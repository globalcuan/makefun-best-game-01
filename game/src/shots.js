import {createWorld} from './world.js';
import {range,unit} from './random.js';
export function buildShot(name,seed,audio){const rng=(()=>{let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})();const game=createWorld(rng,audio),s=game.state;s.time=28;s.wave=name==='boss'?5:name==='end'?8:3;s.score=name==='end'?4280:1640;s.level=4;s.xp=5;s.nextXp=16;s.player.x=640;s.player.y=390;s.player.hull= name==='end'?0:3;s.player.angle=-.42;
 const add=(type,x,y,hp)=>game.spawn(type,x,y).hp=hp;
 if(name==='start'){s.mode='title';for(let i=0;i<4;i++)add('chaser',250+i*240,190+(i%2)*250,2);}
 if(name==='play'){s.mode='playing';add('chaser',430,280,1);add('shooter',870,250,2);add('splitter',780,520,3);add('mini',510,475,1);for(let i=0;i<9;i++){let d=unit(rng);s.bullets.push({x:400+rng()*450,y:180+rng()*390,vx:d.x*240,vy:d.y*240,r:4,life:2,damage:1,team:i%3?'player':'enemy'});}for(let i=0;i<8;i++){let d=unit(rng);s.shards.push({x:300+rng()*650,y:160+rng()*430,vx:d.x*30,vy:d.y*30,r:3,value:1,life:8});}for(let i=0;i<26;i++)game.particle(600+rng()*120,320+rng()*100,['#55f6ff','#ff4f9a','#ffd66b'][i%3],1,90);}
 if(name==='boss'){s.mode='playing';s.enemies.length=0;const b=game.spawn('boss',640,175);b.hp=62;b.maxHp=90;b.fire=.35;for(let i=0;i<10;i++){const a=i*Math.PI/5;s.bullets.push({x:640,y:175,vx:Math.cos(a)*220,vy:Math.sin(a)*220,r:5,life:2,damage:1,team:'enemy'});}for(let i=0;i<6;i++)s.shards.push({x:410+i*90,y:560+(i%2)*24,vx:0,vy:0,r:3,value:1,life:8});}
 if(name==='end'){s.mode='gameover';for(let i=0;i<7;i++)add(i%2?'chaser':'splitter',260+i*120,185+(i%3)*150,0);for(let i=0;i<40;i++)game.particle(640+rng()*170,390+rng()*140,i%2?'#ff4f9a':'#ffd66b',1,155);}
 return game;}
