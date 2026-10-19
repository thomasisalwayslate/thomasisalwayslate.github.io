import type { LifeEntry, lifeLinks } from '../data/huhu-demo';
import type { CausalGraphState } from './huhu-counterfactual';

type Vector = { x:number; y:number; z:number };
type Particle = Vector & { id:string; home:Vector; vx:number; vy:number; vz:number; phase:number; node:SVGGElement; sx:number; sy:number; depth:number; opacity:string };

/** SVG hit targets stay accessible; connection segments are batched into a few paths. */
export function createHuhuSphere(svg:SVGSVGElement, entries:LifeEntry[], links:typeof lifeLinks) {
  const viewport=svg.querySelector<SVGGElement>('.graph-viewport')!,edgeLayer=svg.querySelector<SVGGElement>('.edges')!;
  const hash=(n:number)=>{const value=Math.sin(n*127.1+311.7)*43758.5453;return value-Math.floor(value);};
  const particles:Particle[]=entries.map((entry,index)=>{
    const y=1-2*(index+.5)/entries.length,angle=index*2.3999632297;
    const radial=Math.sqrt(1-y*y),radius=306*(index%5===0?.48+.25*hash(index):.87+.13*hash(index));
    const home={x:Math.cos(angle)*radial*radius,y:y*radius,z:Math.sin(angle)*radial*radius};
    return {...home,id:entry.id,home,vx:0,vy:0,vz:0,phase:index*2.3999632297,node:svg.querySelector<SVGGElement>(`[data-entry="${entry.id}"]`)!,sx:0,sy:0,depth:0,opacity:''};
  });
  const byId=new Map(particles.map(p=>[p.id,p]));
  const types=[...new Set(links.map(link=>link.type))];
  const batches=types.flatMap(type=>Array.from({length:4},(_,depth)=>[false,true].map(dimmed=>{
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('class',`edge ${type}${dimmed?' dimmed':''}`);path.setAttribute('fill','none');
    path.style.setProperty('--depth-opacity',String(.09+(depth+.5)/4*.26));edgeLayer.append(path);
    return {path,segments:'',type,depth,dimmed};
  })).flat());
  const springs=links.map(link=>{
    const a=byId.get(link.from)!,b=byId.get(link.to)!;
    return {a,b,length:Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z),type:types.indexOf(link.type)};
  });
  const causalLayer=svg.querySelector<SVGGElement>('.causal-edges')!;
  let causalPaths:{path:SVGPathElement;from:Particle;to:Particle}[]=[];
  let causalState:CausalGraphState|null=null;
  const savedHomes=new Map<string,Vector>();
  let causalIds=new Set<string>();
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let playing=!preference.matches,visible=false,active=true,focused:string|null=null;
  let frame=0,lastTime=0,elapsed=0,settleUntil=0,orbiting=false,drag:Particle|null=null,dirty=false;
  let yaw=.35,pitch=-.13,dragDepth=0,offset={x:0,y:0},destroyed=false;
  let yawVelocity=0,pitchVelocity=0,lastOrbitTime=0,lastOrbitInput=0;
  svg.setAttribute('viewBox','-360 -360 720 720');
  const rotate=(point:Vector):Vector=>{
    const cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch);
    const x=point.x*cy+point.z*sy,z=-point.x*sy+point.z*cy;
    return {x,y:point.y*cx-z*sx,z:point.y*sx+z*cx};
  };
  const unrotate=(point:Vector):Vector=>{
    const cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch);
    const y=point.y*cx+point.z*sx,z=-point.y*sx+point.z*cx;
    return {x:point.x*cy-z*sy,y,z:point.x*sy+z*cy};
  };
  let labelScale=1;
  const sizeCausalLabels=()=>{
    labelScale=Math.max(1,720/Math.max(1,Math.min(svg.clientWidth,svg.clientHeight)));
    svg.style.setProperty('--causal-dot',`${5*labelScale}px`);
    svg.style.setProperty('--causal-hit',`${18*labelScale}px`);
    for(const node of causalState?.scenario.nodes??[]){
      const p=byId.get(node.id)!;
      p.node.querySelector('.star')?.setAttribute('transform',`scale(${labelScale*.6})`);
      for(const text of p.node.querySelectorAll('text')){
        text.setAttribute('transform',`scale(${labelScale})`);
        text.setAttribute('text-anchor',node.align==='end'?'end':'start');
        text.setAttribute('x',node.align==='end'?'-12':'15');
      }
    }
  };
  const resizeObserver=new ResizeObserver(()=>{sizeCausalLabels();invalidate();});resizeObserver.observe(svg);
  const paint=()=>{
    const cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch);
    for(const p of particles){
      const x=p.x*cy+p.z*sy,z=-p.x*sy+p.z*cy;
      p.sx=x;p.sy=p.y*cx-z*sx;p.depth=(p.y*sx+z*cx+330)/660;
      p.node.setAttribute('transform',`translate(${p.sx.toFixed(2)} ${p.sy.toFixed(2)}) scale(${(.72+p.depth*.43).toFixed(3)})`);
      const opacity=(.32+p.depth*.68).toFixed(2);
      if(opacity!==p.opacity){p.node.style.setProperty('--depth-opacity',opacity);p.opacity=opacity;}
    }
    for(const batch of batches)batch.segments='';
    for(const {a,b,type} of springs){
      const depth=Math.max(0,Math.min(3,Math.floor((a.depth+b.depth)*2)));
      const dimmed=focused!==null&&a.id!==focused&&b.id!==focused;
      batches[type*8+depth*2+Number(dimmed)].segments+=`M${a.sx.toFixed(1)} ${a.sy.toFixed(1)}L${b.sx.toFixed(1)} ${b.sy.toFixed(1)}`;
    }
    for(const batch of batches)batch.path.setAttribute('d',batch.segments);
    for(const {path,from,to} of causalPaths){
      path.style.display=causalState?'':'none';
      if(!causalState)continue;
      const dx=to.sx-from.sx,dy=to.sy-from.sy,length=Math.hypot(dx,dy)||1;
      const gap=Math.min(17,length*.25);
      path.setAttribute('d',`M${from.sx+dx/length*gap} ${from.sy+dy/length*gap}L${to.sx-dx/length*gap} ${to.sy-dy/length*gap}`);
      path.classList.toggle('cut',to.id===causalState.removed);
      path.classList.toggle('inactive',causalState.probabilities[from.id]===0);
    }
  };
  const coasting=()=>Math.abs(yawVelocity)+Math.abs(pitchVelocity)>.008;
  const step=(dt:number,now:number)=>{
    const motion=playing&&!drag&&!orbiting;
    for(const p of particles){
      if(p===drag)continue;
      const drift=motion?3:0;
      p.vx+=(p.home.x+Math.sin(elapsed*.00023+p.phase)*drift-p.x)*.018*dt;
      p.vy+=(p.home.y+Math.cos(elapsed*.00019+p.phase)*drift-p.y)*.018*dt;
      p.vz+=(p.home.z+Math.sin(elapsed*.00017+p.phase)*drift-p.z)*.018*dt;
    }
    for(const {a,b,length} of springs){
      const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,distance=Math.hypot(dx,dy,dz)||1,pull=(distance-length)/distance*.002*dt;
      if(a!==drag&&!causalIds.has(a.id)){a.vx+=dx*pull;a.vy+=dy*pull;a.vz+=dz*pull;}
      if(b!==drag&&!causalIds.has(b.id)){b.vx-=dx*pull;b.vy-=dy*pull;b.vz-=dz*pull;}
    }
    // Repulsion is only needed while rearranging nodes and during their short settling period.
    if(drag||now<settleUntil)for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){
      const a=particles[i],b=particles[j],dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,squared=dx*dx+dy*dy+dz*dz;
      if(squared>784||squared<.001)continue;
      const distance=Math.sqrt(squared),push=(28-distance)/distance*.012*dt;
      if(a!==drag){a.vx-=dx*push;a.vy-=dy*push;a.vz-=dz*push;}
      if(b!==drag){b.vx+=dx*push;b.vy+=dy*push;b.vz+=dz*push;}
    }
    const damping=Math.pow(.82,dt);
    for(const p of particles){
      if(p===drag)continue;
      p.vx*=damping;p.vy*=damping;p.vz*=damping;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;
    }
    if(motion){
      // Integrate exponential friction analytically so release feels the same at any frame rate.
      if(coasting()){
        const decay=Math.exp(-dt*16.667/280);
        yaw+=yawVelocity*.28*(1-decay);pitch+=pitchVelocity*.28*(1-decay);
        yawVelocity*=decay;pitchVelocity*=decay;
      }else{yawVelocity=0;pitchVelocity=0;}
      yaw+=.000008*dt*16.667;
    }
  };
  const shouldRun=()=>!destroyed&&visible&&active&&!document.hidden&&(dirty||(playing&&!orbiting)||!!drag||performance.now()<settleUntil);
  const tick=(now:number)=>{
    frame=0;if(!shouldRun()){lastTime=0;return;}
    const dt=lastTime?Math.min(2.5,(now-lastTime)/16.667):1;lastTime=now;
    if(playing)elapsed+=dt*16.667;
    if(!orbiting||drag||now<settleUntil)step(dt,now);
    dirty=false;paint();
    if(shouldRun())frame=requestAnimationFrame(tick);else lastTime=0;
  };
  const wake=()=>{
    if(shouldRun()&&!frame){lastTime=0;frame=requestAnimationFrame(tick);}
    else if(!shouldRun()&&frame){cancelAnimationFrame(frame);frame=0;lastTime=0;}
  };
  const invalidate=()=>{dirty=true;wake();};
  const stopSpin=()=>{yawVelocity=0;pitchVelocity=0;};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;wake();});observer.observe(svg);
  const visibility=()=>{if(document.hidden)stopSpin();wake();};document.addEventListener('visibilitychange',visibility);
  const graphPoint=(x:number,y:number)=>{
    const matrix=viewport.getScreenCTM();return matrix?new DOMPoint(x,y).matrixTransform(matrix.inverse()):new DOMPoint(x,y);
  };
  particles.slice().sort((a,b)=>rotate(a).z-rotate(b).z).forEach(p=>viewport.append(p.node));paint();
  return {
    get playing(){return playing;},
    setCausal(state:typeof causalState){
      if(state?.scenario.id!==causalState?.scenario.id){
        stopSpin();
        for(const [id,home] of savedHomes){
          const p=byId.get(id)!;Object.assign(p,home,{home:{...home},vx:0,vy:0,vz:0});
          p.node.querySelector('.star')?.removeAttribute('transform');
          for(const text of p.node.querySelectorAll('text')){text.removeAttribute('transform');text.setAttribute('text-anchor','start');text.setAttribute('x','15');}
        }
        savedHomes.clear();causalLayer.replaceChildren();causalPaths=[];
        particles.slice().sort((a,b)=>rotate(a).z-rotate(b).z).forEach(p=>viewport.append(p.node));
        for(const node of state?.scenario.nodes??[]){
          const p=byId.get(node.id)!;savedHomes.set(node.id,{...p.home});
          const point=unrotate({x:node.x,y:node.y,z:160});
          Object.assign(p,point,{home:{...point},vx:0,vy:0,vz:0});viewport.append(p.node);
        }
        for(const edge of state?.scenario.edges??[]){
          const path=document.createElementNS('http://www.w3.org/2000/svg','path');
          path.setAttribute('fill','none');path.setAttribute('class','causal-edge');path.setAttribute('marker-end','url(#causal-arrow)');causalLayer.append(path);
          causalPaths.push({path,from:byId.get(edge.from)!,to:byId.get(edge.to)!});
        }
      }
      causalState=state;causalIds=new Set(state?.scenario.nodes.map(node=>node.id)??[]);sizeCausalLabels();
      for(const p of particles){
        const modeled=state?.scenario.nodes.some(node=>node.id===p.id)??false;
        p.node.classList.toggle('causal-node',modeled);
        p.node.classList.toggle('causal-removed',modeled&&state?.removed===p.id);
      }
      invalidate();
    },
    setPlaying(value:boolean){playing=value;if(!value)stopSpin();wake();},
    setActive(value:boolean){active=value;if(!value)stopSpin();wake();},
    setSelection(id:string|null){focused=id;invalidate();},
    startOrbit(){orbiting=true;stopSpin();lastOrbitTime=performance.now();lastOrbitInput=0;wake();},
    rotateBy(dx:number,dy:number){
      const now=performance.now(),sensitivity=Math.PI/Math.max(180,Math.min(svg.clientWidth,svg.clientHeight));
      const dt=Math.max(8,Math.min(40,now-lastOrbitTime))/1000;
      const vx=dx*sensitivity,vy=-dy*sensitivity;
      if(now-lastOrbitTime>100)stopSpin();
      yaw+=vx;pitch+=vy;
      yawVelocity=.45*yawVelocity+.55*Math.max(-1.6,Math.min(1.6,vx/dt));
      pitchVelocity=.45*pitchVelocity+.55*Math.max(-1.6,Math.min(1.6,vy/dt));
      lastOrbitTime=now;lastOrbitInput=now;invalidate();
    },
    endOrbit(coast=true){
      if(!orbiting)return;orbiting=false;
      if(!coast||!playing||preference.matches||performance.now()-lastOrbitInput>90)stopSpin();
      wake();
    },
    startDrag(id:string,x:number,y:number){
      stopSpin();drag=byId.get(id)??null;if(!drag)return;
      if(viewport.lastElementChild!==drag.node)viewport.append(drag.node);
      drag.node.classList.add('is-held');
      const point=rotate(drag),cursor=graphPoint(x,y);dragDepth=point.z;
      offset={x:point.x-cursor.x,y:point.y-cursor.y};wake();
    },
    moveDrag(x:number,y:number){
      if(!drag)return;
      const cursor=graphPoint(x,y),point=unrotate({x:cursor.x+offset.x,y:cursor.y+offset.y,z:dragDepth});
      const radius=Math.hypot(point.x,point.y,point.z),bound=Math.min(1,324/radius);
      drag.x=point.x*bound;drag.y=point.y*bound;drag.z=point.z*bound;
      drag.vx=0;drag.vy=0;drag.vz=0;invalidate();
    },
    endDrag(moved:boolean){
      if(drag&&moved)drag.home={x:drag.x,y:drag.y,z:drag.z};
      drag?.node.classList.remove('is-held');drag=null;settleUntil=performance.now()+700;invalidate();
    },
    destroy(){destroyed=true;if(frame)cancelAnimationFrame(frame);observer.disconnect();resizeObserver.disconnect();document.removeEventListener('visibilitychange',visibility);}
  };
}
