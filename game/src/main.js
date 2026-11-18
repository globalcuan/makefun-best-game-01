import {createInput} from './input.js';
import {createAudio} from './audio.js';
import {createWorld} from './world.js';
import {createRenderer} from './render.js';
import {mulberry32} from './random.js';
import {buildShot} from './shots.js';
const canvas=document.querySelector('#game'),input=createInput(canvas),audio=createAudio(),renderer=createRenderer(canvas),params=new URLSearchParams(location.search),shot=params.get('shot');
let world,last=performance.now();
if(shot){world=buildShot(shot,Number(params.get('seed')||1),audio);renderer.render(world,true);document.title='shot-ready';}
else{world=createWorld(Math.random,audio);const frame=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;const s=world.state,k=input.keys;
 if(k.has('m')&&input.justPressed('m'))audio.toggle();
 if((k.has('p')||k.has('escape'))&&input.justPressed(k.has('p')?'p':'escape'))world.togglePause();
 if(s.mode==='title'&&(k.has('enter')||input.mouse.down)){world.start();audio.unlock();}
 else if(s.mode==='gameover'&&(k.has('r')||k.has('enter'))&&input.justPressed(k.has('r')?'r':'enter')){location.reload();}
 else if(s.mode==='levelup'){for(let i=0;i<3;i++)if(k.has(String(i+1))&&input.justPressed(String(i+1)))world.chooseUpgrade(i);if(input.mouse.down){const rect=canvas.getBoundingClientRect(),x=(input.mouse.x/1280)*1280;const i=Math.max(0,Math.min(2,Math.floor((x-350)/195)));world.chooseUpgrade(i);}}
 world.update(dt,input);renderer.render(world);input.consume();requestAnimationFrame(frame);};requestAnimationFrame(frame);}
