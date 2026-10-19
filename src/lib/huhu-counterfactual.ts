/** Illustrative structural models. Recorded associations never become mechanisms
 * automatically. All background probabilities below are authored assumptions. */
type World = Record<string,boolean>;
export type CausalNode = {
  id:string; label:string; symbol:string; role:'cause'|'signal'|'outcome';
  x:number; y:number; align?:'end';
  evaluate:(world:World,background:World)=>boolean;
};
export type CausalScenario = {
  id:string; title:string; nodes:CausalNode[]; edges:{from:string;to:string}[];
  background:{key:string;symbol:string;label:string;probability:number}[];
  equations:string[]; note:string;
};
const present=()=>true;
export const causalScenarios:CausalScenario[] = [
  {
    id:'conversation',title:'A conversation and a project',
    nodes:[
      {id:'conversation',label:'A conversation',symbol:'A',role:'cause',x:-180,y:-220,evaluate:present},
      {id:'new-route',label:'A different route',symbol:'R',role:'cause',x:-115,y:-80,evaluate:(w,b)=>(w.conversation&&b.r)||b.u},
      {id:'workshop',label:'A workshop visit',symbol:'W',role:'cause',x:-80,y:70,evaluate:(w,b)=>(w['new-route']&&b.w)||b.q},
      {id:'old-sketch',label:'An older sketch',symbol:'K',role:'cause',x:165,y:-85,evaluate:present},
      {id:'device-decision',label:'Device project',symbol:'Y',role:'outcome',x:125,y:220,align:'end',evaluate:(w,b)=>(w.workshop&&b.d)||(w['old-sketch']&&b.k)}
    ],
    edges:[{from:'conversation',to:'new-route'},{from:'new-route',to:'workshop'},{from:'workshop',to:'device-decision'},{from:'old-sketch',to:'device-decision'}],
    background:[{key:'r',symbol:'r',label:'Conversation changes route',probability:.7},{key:'u',symbol:'u',label:'Other reason for route',probability:.2},{key:'w',symbol:'w',label:'Route leads to workshop',probability:.6},{key:'q',symbol:'q',label:'Workshop found another way',probability:.1},{key:'d',symbol:'d',label:'Workshop prompts project',probability:.8},{key:'k',symbol:'k',label:'Sketch prompts project independently',probability:.25}],
    equations:['A = K = 1','R = (A AND r) OR u','W = (R AND w) OR q','Y = (W AND d) OR (K AND k)'],
    note:'Fictional history across several weeks. The outcome is starting the device project by 1 October. Removing the conversation leaves the older sketch available. Other routes to the workshop and project remain possible. All input probabilities are assumed.'
  },
  {
    id:'run',title:'Run and ankle pain',
    nodes:[
      {id:'run',label:'Tuesday run',symbol:'R',role:'cause',x:-145,y:-170,align:'end',evaluate:present},
      {id:'hill',label:'Route hill',symbol:'H',role:'cause',x:125,y:-65,evaluate:present},
      {id:'pace',label:'Pace change',symbol:'P',role:'signal',x:-145,y:65,align:'end',evaluate:(w,b)=>w.run&&(b.s||(w.hill&&b.c))},
      {id:'ankle',label:'Ankle pain',symbol:'Y',role:'outcome',x:125,y:180,evaluate:(w,b)=>(w.run&&b.s&&b.t)||b.v}
    ],
    // Shared latent response L=R AND S connects pace and pain. There is no
    // pace->pain mechanism. P is absent if its containing run did not happen.
    edges:[{from:'run',to:'pace'},{from:'run',to:'ankle'},{from:'hill',to:'pace'}],
    background:[{key:'s',symbol:'S',label:'Run response',probability:.35},{key:'c',symbol:'C',label:'Hill slows pace',probability:.65},{key:'t',symbol:'T',label:'Response leads to pain',probability:.6},{key:'v',symbol:'V',label:'Other pain cause',probability:.08}],
    equations:['R = H = 1; L = R AND S','P = R AND (L OR (H AND C))','Y = (L AND T) OR V'],
    note:'Alternatives: skip the run or replace the hill with a flat section. Pain is assumed to start later. Graph paths share hidden L; pace does not cause pain here. Not a diagnosis.'
  },
  {
    id:'idea',title:'River walk and tool idea',
    nodes:[
      {id:'walk',label:'River walk',symbol:'W',role:'cause',x:-135,y:-170,evaluate:present},
      {id:'colour',label:'Colour thought',symbol:'C',role:'cause',x:0,y:0,evaluate:(w,b)=>(w.walk&&b.s)||b.u},
      {id:'idea',label:'Tool idea',symbol:'Y',role:'outcome',x:135,y:170,align:'end',evaluate:(w,b)=>(w.colour&&b.t)||b.v}
    ],
    edges:[{from:'walk',to:'colour'},{from:'colour',to:'idea'}],
    background:[{key:'s',symbol:'S',label:'Walk inspires thought',probability:.7},{key:'u',symbol:'U',label:'Other colour cue',probability:.15},{key:'t',symbol:'T',label:'Thought develops',probability:.65},{key:'v',symbol:'V',label:'Other idea source',probability:.12}],
    equations:['W = 1','C = (W AND S) OR U','Y = (C AND T) OR V'],
    note:'Walk absent means not taking that walk; colour thought absent means setting C=0. The tool idea can still have another source.'
  },
  {
    id:'music',title:'Song and melody',
    nodes:[
      {id:'song',label:'Alex’s song',symbol:'S',role:'cause',x:-100,y:-85,evaluate:present},
      {id:'music',label:'New melody',symbol:'Y',role:'outcome',x:100,y:85,align:'end',evaluate:(w,b)=>(w.song&&b.i)||b.v}
    ],
    edges:[{from:'song',to:'music'}],
    background:[{key:'i',symbol:'I',label:'Song inspires melody',probability:.75},{key:'v',symbol:'V',label:'Other inspiration',probability:.2}],
    equations:['S = 1','Y = (S AND I) OR V'],
    note:'Song absent means not receiving that song. The same melody may still arise through another source in this model.'
  }
];
export const scenarioForEvent=(id:string)=>causalScenarios.find(scenario=>scenario.nodes.some(node=>node.id===id));
export type CausalGraphState = {scenario:CausalScenario;removed:string|null;probabilities:Record<string,number>};

/** Exact abduction, intervention and prediction, using paired background states.
 * All displayed events are observed as present in these fictional histories.
 * Downstream facts condition the factual world only, never the alternative.
 */
export function calculateCounterfactual(scenario:CausalScenario, intervention:string|null, overrides:Record<string,number>={}) {
  if(intervention&&!scenario.nodes.some(node=>node.id===intervention&&node.role==='cause'))throw new RangeError('Choose a modelled cause, not a signal or the outcome.');
  if(Object.keys(overrides).some(key=>!scenario.background.some(variable=>variable.key===key)))throw new RangeError('Unknown background parameter.');
  const priors=scenario.background.map(variable=>overrides[variable.key]??variable.probability);
  if(priors.some(p=>!Number.isFinite(p)||p<0||p>1))throw new RangeError('Model probabilities must be between 0 and 1.');
  const outcome=scenario.nodes.find(node=>node.role==='outcome')!.id;
  const totals=Object.fromEntries(scenario.nodes.map(node=>[node.id,0]));
  let evidenceMass=0,compatibleStates=0;
  for(let mask=0;mask<2**priors.length;mask++){
    const background=Object.fromEntries(scenario.background.map((variable,i)=>[variable.key,Boolean(mask&(1<<i))]));
    const weight=priors.reduce((mass,p,i)=>mass*((mask&(1<<i))?p:1-p),1);
    const world=(removed:string|null):World=>{
      const state:World={};
      for(const node of scenario.nodes)state[node.id]=node.id===removed?false:node.evaluate(state,background);
      return state;
    };
    const factual=world(null);
    if(weight===0||scenario.nodes.some(node=>!factual[node.id]))continue;
    evidenceMass+=weight;compatibleStates++;
    const alternative=world(intervention);
    for(const node of scenario.nodes)if(alternative[node.id])totals[node.id]+=weight;
  }
  if(evidenceMass===0)return null;
  for(const node of scenario.nodes)totals[node.id]=Math.max(0,Math.min(1,totals[node.id]/evidenceMass));
  return {probabilities:totals,necessity:intervention?1-totals[outcome]:null,evidenceMass,compatibleStates};
}
