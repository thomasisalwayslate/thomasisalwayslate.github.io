// Fictional public examples only. Scores are authored illustrations, not model output.
export const lensNames = ['body','mind','self','direction','others','surroundings','making'] as const;
export type Lens = typeof lensNames[number];
export type Who = 'self' | 'other' | 'circumstance' | 'mixed' | 'unknown';
export const whoLabels: Record<Who,string> = {self:'me',other:'someone else',circumstance:'circumstances',mixed:'mixed',unknown:'not known'};
export interface LifeEntry {
  id: string; title: string; text: string; date: string; source: string;
  lenses: Lens[]; who: Who; spark?: boolean; x: number; y: number;
}
const coreEntries: LifeEntry[] = [
  {id:'old-sketch',title:'An older device sketch',text:'I sketched a small device for keeping ideas. I have not decided whether to build it.',date:'20 August 2026, 18:00',source:'Fictional written entry',lenses:['making'],who:'self',x:180,y:-230},
  {id:'conversation',title:'A conversation about the canal',text:'Sam mentioned a quieter route along the canal. I want to try it on my way home.',date:'3 September 2026, 18:10',source:'Fictional written entry',lenses:['others'],who:'other',spark:true,x:-200,y:-240},
  {id:'new-route',title:'Trying the canal route',text:'I tried the route Sam mentioned. I noticed an open workshop near the bridge and saved its address.',date:'10 September 2026, 18:40',source:'Fictional written entry',lenses:['surroundings'],who:'self',x:-180,y:-80},
  {id:'workshop',title:'Visiting the workshop',text:'I went back to the workshop I noticed on the canal route. Holding a small enclosure made me return to my device sketch.',date:'19 September 2026, 15:00',source:'Fictional written entry',lenses:['surroundings','making'],who:'self',x:-120,y:100},
  {id:'device-decision',title:'Starting the device project',text:'I decided to build the device from my August sketch. The workshop visit helped me picture how it could feel in my hand.',date:'1 October 2026, 11:00',source:'Fictional written entry',lenses:['direction','making'],who:'self',x:100,y:230},
  {id:'sleep',title:'A short night',text:'I slept for four hours. I stayed up finishing a drawing.',date:'5 October 2026, 07:20',source:'Written entry',lenses:['body','making'],who:'self',x:-290,y:-155},
  {id:'run',title:'Tuesday’s run',text:'A 32-minute run. The activity record contains the route and a time series of speed measurements.',date:'6 October 2026, 08:00',source:'Fictional activity import',lenses:['body'],who:'self',spark:true,x:-235,y:-60},
  {id:'pace',title:'A change at minute 14',text:'Recorded speed decreased around minute 14. The record alone does not explain why.',date:'6 October 2026, 08:14',source:'Fictional activity measurement',lenses:['body'],who:'unknown',x:-360,y:30},
  {id:'hill',title:'The hill on the route',text:'That route has an uphill section near the middle. I sometimes stop there to cross the road.',date:'6 October 2026, 12:15',source:'Written entry',lenses:['body','surroundings'],who:'circumstance',x:-195,y:90},
  {id:'ankle',title:'An ankle pain report',text:'My right ankle hurts today. I wonder whether I twisted it yesterday. I am not sure when it began.',date:'8 October 2026, 09:10',source:'Written entry',lenses:['body'],who:'unknown',x:-320,y:170},
  {id:'rest',title:'An afternoon at home',text:'I stayed home and listened to the record Alex recommended. I felt less rushed.',date:'8 October 2026, 17:30',source:'Written entry',lenses:['body','others'],who:'self',x:-100,y:190},
  {id:'alex',title:'Alex',text:'Alex is my sister. We used to walk by the river after school.',date:'2 October 2026, 18:00',source:'Fictional person confirmed by the author',lenses:['others'],who:'unknown',spark:true,x:90,y:-115},
  {id:'visit',title:'Saturday with Alex',text:'Alex visited this afternoon. We made tea and looked through the old river photographs. I felt calm.',date:'10 October 2026, 16:40',source:'Written entry',lenses:['others','mind'],who:'other',x:225,y:-185},
  {id:'photo',title:'The river photograph',text:'A saved photograph of the bridge where Alex and I used to stop. Alex confirmed the place.',date:'10 October 2026, 16:50',source:'Fictional photograph description',lenses:['others','surroundings'],who:'unknown',x:325,y:-65},
  {id:'feeling',title:'A familiar feeling',text:'I feel calm today. I cannot quite place what it reminds me of.',date:'11 October 2026, 10:00',source:'Written entry',lenses:['mind'],who:'unknown',x:195,y:20},
  {id:'song',title:'The song Alex sent',text:'Alex sent me a song with a soft, repeating guitar phrase. It reminded me of our walks.',date:'7 October 2026, 20:10',source:'Written entry',lenses:['others'],who:'other',x:340,y:110},
  {id:'walk',title:'Walking by the river',text:'I walked by the river today. The reflections kept breaking into small coloured squares.',date:'4 October 2026, 15:30',source:'Written entry',lenses:['surroundings','body'],who:'self',x:5,y:100},
  {id:'colour',title:'Keeping a colour',text:'I wanted to keep the pale blue of the water without keeping every photograph.',date:'4 October 2026, 19:10',source:'Written entry',lenses:['mind','making'],who:'self',spark:true,x:65,y:195},
  {id:'drawing',title:'A drawing from the walk',text:'I made a small drawing from the river photograph. I used only four colours.',date:'5 October 2026, 00:15',source:'Written entry',lenses:['making'],who:'self',x:-70,y:-80},
  {id:'idea',title:'An idea for a little tool',text:'What if colours could be collected like small objects, each with a name and a place in a box?',date:'5 October 2026, 11:00',source:'Written entry',lenses:['making','mind'],who:'self',x:45,y:-15},
  {id:'music',title:'Trying a melody',text:'I tried a short guitar loop after listening to Alex’s song. I kept the repeating phrase but changed the rhythm.',date:'9 October 2026, 21:00',source:'Written entry',lenses:['making'],who:'self',x:245,y:190},
  {id:'forgot',title:'Looking for a memory',text:'I remembered Alex and a feeling of calm, but not the details of Saturday. I searched for her name.',date:'12 October 2026, 08:50',source:'Fictional retrieval scenario',lenses:['mind'],who:'self',x:355,y:-185},
  {id:'return',title:'Returning to an idea',text:'Seeing the river photograph again reminded me why I started the colour tool.',date:'12 October 2026, 19:00',source:'Written entry',lenses:['making','mind'],who:'self',x:-75,y:-195},
];
const coreLinks = [
  {from:'new-route',to:'conversation',type:'derived_from',score:null,question:'The fictional author explicitly traced trying this route to the conversation.'},
  {from:'workshop',to:'new-route',type:'derived_from',score:null,question:'The visit developed from the address saved on the earlier walk.'},
  {from:'workshop',to:'old-sketch',type:'linked_to',score:null,question:'The visit brought the earlier sketch back into consideration.'},
  {from:'device-decision',to:'workshop',type:'derived_from',score:null,question:'The author reported the visit as an influence on the decision, not proof that it was necessary.'},
  {from:'device-decision',to:'old-sketch',type:'derived_from',score:null,question:'The project develops the older sketch, which also supplies a possible independent route to the decision.'},
  {from:'sleep',to:'drawing',type:'linked_to',score:0.97,question:'Do these entries refer to the same late drawing session?'},
  {from:'pace',to:'run',type:'linked_to',score:null,question:'This pace observation is connected to the run it describes. Its source is the activity measurement.'},
  {from:'ankle',to:'pace',type:'linked_to',score:0.78,question:'Is this activity change relevant context for reviewing the later pain report?'},
  {from:'hill',to:'pace',type:'linked_to',score:0.89,question:'Does this entry provide an alternative explanation for the speed change?'},
  {from:'run',to:'sleep',type:'linked_to',score:0.62,question:'Is the earlier sleep entry relevant context for reviewing the run?'},
  {from:'rest',to:'ankle',type:'linked_to',score:null,question:'An association supplied by the fictional author.'},
  {from:'visit',to:'alex',type:'involves',score:null,question:'The author identified Alex as the person who visited.'},
  {from:'photo',to:'visit',type:'linked_to',score:0.96,question:'Does this photograph belong to the recorded visit?'},
  {from:'feeling',to:'visit',type:'linked_to',score:0.84,question:'Is the visit a relevant memory cue for this reported feeling?'},
  {from:'forgot',to:'visit',type:'linked_to',score:0.94,question:'Does this entry provide the experience being searched for?'},
  {from:'song',to:'alex',type:'involves',score:null,question:'The author identified Alex as the person who sent the song.'},
  {from:'rest',to:'song',type:'linked_to',score:0.93,question:'Do these entries concern the same music recommendation?'},
  {from:'walk',to:'alex',type:'linked_to',score:0.58,question:'Might this walk be relevant to the earlier recorded river memory?'},
  {from:'colour',to:'walk',type:'derived_from',score:null,question:'The fictional author identified the walk as the source of this idea.'},
  {from:'drawing',to:'walk',type:'derived_from',score:null,question:'The fictional author identified the walk as the source of the drawing.'},
  {from:'idea',to:'colour',type:'derived_from',score:0.92,question:'Does the later tool idea develop the earlier colour thought?'},
  {from:'music',to:'song',type:'derived_from',score:null,question:'The fictional author recorded the song as an influence.'},
  {from:'return',to:'photo',type:'linked_to',score:0.95,question:'Does this photograph provide context for the returning idea?'},
  {from:'return',to:'idea',type:'linked_to',score:null,question:'An association supplied by the fictional author.'},
];

// The additional records make a dense visual demonstration. None are personal data.
const themes: {key:string; lenses:Lens[]; who:Who; x:number; y:number; notes:[string,string][]}[] = [
  {key:'body',lenses:['body'],who:'self',x:-360,y:-90,notes:[
    ['An easy run','I kept the run easy today. I noticed how much the route changed when I stopped watching the time.'],
    ['The longer route','I took the long way home. My legs felt heavy by the last crossing.'],
    ['A morning outside','I went outside before opening the laptop. I wrote down how I felt afterwards.'],
    ['An afternoon pause','I stopped working for a short walk. The problem was still there when I returned, but I could look at it again.'],
    ['A familiar route','The river loop was busy. I stopped twice to let people pass.'],
    ['A note after moving','I felt tired after the walk. I had also slept badly, so I kept both observations.']
  ]},
  {key:'family',lenses:['others'],who:'mixed',x:290,y:-165,notes:[
    ['Tea with Alex','Alex came over for tea. We talked about the bridge near our old school.'],
    ['An old photograph','We looked at a photograph from the river. Alex remembered the weather that day.'],
    ['A familiar name','I wrote down the person’s name and how I knew them, so the entry would make sense later.'],
    ['Sunday lunch','We cooked together and stayed at the table longer than usual.'],
    ['A small message','Alex sent a message about the song we used to play on the way home.'],
    ['Something worth keeping','I saved a sentence from our conversation because I wanted to return to it.']
  ]},
  {key:'ideas',lenses:['making','mind'],who:'self',x:175,y:190,notes:[
    ['A sketch in the margin','A shape in the margin became the beginning of a small interface idea.'],
    ['A colour to keep','I noticed a pale green on a door and wrote down why it caught my attention.'],
    ['An unfinished idea','I returned to an older sketch. The part I had crossed out was useful this time.'],
    ['Four colours','I tried making the drawing with only four colours. The limited palette changed what I noticed.'],
    ['A little collection','I wanted the saved pieces to feel like objects I could look through.'],
    ['Looking again','A photograph I had ignored last week gave me an idea today.']
  ]},
  {key:'sleep',lenses:['body'],who:'self',x:-365,y:185,notes:[
    ['A broken night','I woke more than once and wrote a short note before breakfast.'],
    ['A late drawing','I stayed up working on the drawing. I recorded the late finish rather than guessing its effects.'],
    ['An early evening','I left the unfinished work on the desk and went to bed earlier.'],
    ['A morning note','I wrote down the night I remembered and the way I felt on waking.'],
    ['The next day','The morning felt slow. Yesterday’s record might be useful context, but I did not know why.'],
    ['Keeping the timing','I added the time I noticed the tiredness, separately from the time I wrote about it.']
  ]},
  {key:'work',lenses:['making','direction'],who:'self',x:-120,y:-245,notes:[
    ['A stubborn problem','The same bug returned. I saved the steps that led to it before trying another solution.'],
    ['A clearer explanation','Writing the problem down made one missing condition easier to see.'],
    ['Changing the approach','I changed the order of the work after noticing that two tasks depended on the same decision.'],
    ['A useful correction','The first explanation was wrong. I kept the original note and added what changed my mind.'],
    ['Finishing for today','I stopped with one question unresolved and left a note about where to continue.'],
    ['A decision and its reason','I recorded the choice and the evidence behind it, not just the outcome.']
  ]},
  {key:'music',lenses:['making'],who:'self',x:435,y:65,notes:[
    ['A repeating phrase','I listened to a short guitar phrase until I could hear the change at the end.'],
    ['The song from Alex','The song brought back the walk we had talked about. I saved the link with that memory.'],
    ['A rough recording','I recorded a small melody and wrote down which earlier idea it grew from.'],
    ['A different rhythm','I tried the same notes with a different rhythm. It felt closer to the drawing I was making.'],
    ['An evening listening','I listened without working. A detail in the arrangement stayed with me afterwards.'],
    ['Returning to a sound','I found the recording again by searching for the feeling I had written beside it.']
  ]},
  {key:'places',lenses:['surroundings'],who:'circumstance',x:-80,y:265,notes:[
    ['The bridge','The light on the river looked different from the old photograph.'],
    ['A road crossing','I stopped at the crossing near the hill. I noted where the interruption happened.'],
    ['A quiet street','I took a quieter street and noticed a shop window I normally pass.'],
    ['A place in a photograph','I added the place only after checking it with someone who was there.'],
    ['A longer way back','A detour put me beside the river again. It reminded me of an older conversation.'],
    ['A familiar corner','I recognised the corner before remembering the day I had last been there.']
  ]},
  {key:'reflection',lenses:['mind','self'],who:'self',x:45,y:-65,notes:[
    ['A possible connection','Two entries seemed related. I kept the proposed link and the reason for it.'],
    ['Another explanation','An earlier note changed the way I understood the later one.'],
    ['Not enough yet','There were too few records to call it a pattern. I left the question open.'],
    ['Following a thread','I followed a thought back through two earlier entries and found its original context.'],
    ['What I actually wrote','I checked the original entry before accepting the summary.'],
    ['A connection to revisit','I kept the uncertainty visible so a later entry could change the explanation.']
  ]}
];
const extraEntries:LifeEntry[]=[];
const extraLinks:typeof coreLinks=[];
themes.forEach((theme,group)=>{
  for(let index=0;index<24;index++){
    const angle=index*2.3999632297+group*.7;
    const radius=18+Math.sqrt(index)*19;
    const id=`${theme.key}-${index+1}`;
    const [title,text]=theme.notes[index%theme.notes.length];
    const day=new Date(Date.UTC(2026,5,1+group*3+index*4));
    extraEntries.push({id,title,text,date:day.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}),source:'Fictional written entry',lenses:theme.lenses,who:theme.who,spark:index===0,x:theme.x+Math.cos(angle)*radius,y:theme.y+Math.sin(angle)*radius*.7});
    if(index>0)extraLinks.push({from:id,to:`${theme.key}-${Math.max(1,index-2)}`,type:index%4===0?'derived_from':'linked_to',score:index%3===0?null:Number((.56+(index%36)/100).toFixed(2)),question:'Is this earlier record relevant context for the selected entry?'});
    if(index>4)extraLinks.push({from:id,to:`${theme.key}-${index-4}`,type:'linked_to',score:null,question:'An association supplied in the fictional example.'});
  }
});
const anchors=['run','alex','colour','sleep','device-decision','song','new-route','return'];
themes.forEach((theme,index)=>{
  [1,7,13,19].forEach(number=>extraLinks.push({from:`${theme.key}-${number}`,to:anchors[index],type:'linked_to',score:null,question:'An association supplied in the fictional example.'}));
  extraLinks.push({from:`${theme.key}-12`,to:`${themes[(index+1)%themes.length].key}-8`,type:'linked_to',score:0.64,question:'Might these records from different parts of the fictional life provide relevant context for one another?'});
});
export const lifeEntries:LifeEntry[]=[...coreEntries,...extraEntries];
export const lifeLinks=[...coreLinks,...extraLinks];
