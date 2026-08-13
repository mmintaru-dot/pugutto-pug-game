const SAVE_KEY = 'pugutto-save-v1';
const clamp = n => Math.max(0, Math.min(100, n));
const today = () => new Date().toLocaleDateString('sv-SE');
const items = [
  {id:'collar',name:'いちごの首輪',type:'collar',icon:'📿',price:80,level:1,desc:'赤い首輪でおめかし'},
  {id:'hat',name:'おさんぽ帽子',type:'hat',icon:'🧢',price:140,level:2,desc:'レベル2で解放'},
  {id:'clothes',name:'星の洋服',type:'clothes',icon:'👕',price:220,level:3,desc:'レベル3で解放'},
  {id:'ball',name:'カラフルボール',type:'toy',icon:'🎾',price:100,level:2,desc:'遊ぶ時の経験値アップ'},
  {id:'plush',name:'くまのぬいぐるみ',type:'toy',icon:'🧸',price:180,level:4,desc:'遊ぶ時のごきげんアップ'},
  {id:'premium',name:'高級ドッグフード',type:'food',icon:'🥩',price:160,level:3,desc:'ごはんの回復量アップ'}
];
const SAVE_VERSION = 3;
const initial = name => ({saveVersion:SAVE_VERSION,name,level:1,xp:0,hunger:80,energy:80,mood:80,clean:80,coins:120,owned:[],equipped:{hat:null,collar:null,clothes:null},lastDaily:null,actions:0,world:{area:'park',lastArea:'park'},dogBook:{},npcRelations:{}});
let state = null;
const $ = id => document.getElementById(id);
function save(){localStorage.setItem(SAVE_KEY,JSON.stringify(state));}
function load(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));if(s?.name){const base=initial(s.name);state={...base,...s,saveVersion:SAVE_VERSION,equipped:{...base.equipped,...s.equipped},world:{...base.world,...s.world},dogBook:{...base.dogBook,...s.dogBook},npcRelations:{...base.npcRelations,...s.npcRelations}};save();}}catch(e){localStorage.removeItem(SAVE_KEY);}}
function xpGoal(){return 30+state.level*10;}
function change(values){for(const [key,value] of Object.entries(values)){if(['hunger','energy','mood','clean'].includes(key))state[key]=clamp(state[key]+value);else state[key]+=value;}checkLevel();save();render();}
function checkLevel(){while(state.xp>=xpGoal()){const oldGoal=xpGoal();state.xp-=oldGoal;state.level++;state.coins+=50;const unlocked=items.filter(i=>i.level===state.level).map(i=>i.name);setTimeout(()=>showEvent('レベルアップ！',`レベル ${state.level} になったワン！ 50コインをもらったよ。${unlocked.length?' 「'+unlocked.join('」「')+'」が解放！':''}`,'🎉'),250);}}
function reaction(){if(state.hunger<=25)return'おなかすいたワン…';if(state.energy<=25)return'ねむいワン…';if(state.mood>=100)return'最高だワン！';if(state.energy>=80)return'遊ぼうワン！';if(state.clean<=25)return'お風呂に入りたいワン…';return'きょうも一緒だワン！';}
function render(){if(!state)return;$('startScreen').hidden=true;$('gameScreen').hidden=false;$('pugName').textContent=state.name;$('levelText').textContent=state.level;$('xpText').textContent=state.xp;$('xpGoalText').textContent=xpGoal();$('xpBar').style.width=`${state.xp/xpGoal()*100}%`;['hunger','energy','mood','clean'].forEach(k=>{$(k+'Value').textContent=state[k];$(k+'Bar').style.width=state[k]+'%';});$('coinText').textContent=state.coins;$('shopCoinText').textContent=state.coins;$('speech').textContent=reaction();$('hatLayer').className='wear hat-layer '+(state.equipped.hat==='hat'?'cap':'');$('collarLayer').className='wear collar-layer '+(state.equipped.collar==='collar'?'red':'');$('clothesLayer').className='wear clothes-layer '+(state.equipped.clothes==='clothes'?'sweater':'');const worn=Object.values(state.equipped).filter(Boolean).map(id=>items.find(i=>i.id===id)?.name);$('equippedSummary').textContent='おしゃれ：'+(worn.length?worn.join('・'):'なし');const claimed=state.lastDaily===today();$('dailyButton').disabled=claimed;$('dailyButton').textContent=claimed?'受け取り済み':'受け取る';$('dailyHint').textContent=claimed?'また明日も来てね！':'毎日50コインをプレゼント！';renderShop();renderInventory();}
function renderShop(){$('shopList').innerHTML=items.map(i=>{const owned=state.owned.includes(i.id),locked=state.level<i.level;return `<article class="item"><div class="item-icon">${i.icon}</div>${locked?`<span class="locked">Lv.${i.level}で解放</span>`:''}<h3>${i.name}</h3><p>${i.desc}</p><button class="${owned?'':'buy'}" data-buy="${i.id}" ${owned||locked||state.coins<i.price?'disabled':''}>${owned?'購入済み':`🪙 ${i.price}`}</button></article>`;}).join('');}
function renderInventory(){const owned=items.filter(i=>state.owned.includes(i.id));$('inventoryList').innerHTML=owned.length?owned.map(i=>{const wearable=['hat','collar','clothes'].includes(i.type),equipped=state.equipped[i.type]===i.id;return `<article class="item ${equipped?'equipped':''}"><div class="item-icon">${i.icon}</div><h3>${i.name}</h3><p>${equipped?'ただいま装備中！':i.desc}</p>${wearable?`<button data-equip="${i.id}">${equipped?'はずす':'装備する'}</button>`:'<button disabled>持っています</button>'}</article>`;}).join(''):'<p class="helper">まだ持ち物はありません。ショップをのぞいてみよう！</p>';}
const actions={meal:{cost:{},v:{hunger:30,energy:3,xp:5},msg:'おいしいワン！'},snack:{v:{hunger:10,mood:12,xp:4},msg:'もっとほしいワン！'},walk:{v:{mood:16,energy:-18,hunger:-10,clean:-8,xp:14,coins:12},msg:'お散歩たのしいワン！'},play:{v:{mood:20,energy:-13,hunger:-6,xp:10,coins:7},msg:'わーい！もう一回！'},sleep:{v:{energy:35,hunger:-8,xp:4},msg:'むにゃむにゃ…'},bath:{v:{clean:45,mood:-4,xp:7},msg:'ふわふわになったワン！'}};
function doAction(key){const a=actions[key],v={...a.v};if(key==='meal'&&state.owned.includes('premium'))v.hunger+=12;if(key==='play'&&state.owned.includes('ball'))v.xp+=5;if(key==='play'&&state.owned.includes('plush'))v.mood+=8;state.actions++;change(v);$('speech').textContent=a.msg;document.body.classList.add('celebrate');setTimeout(()=>document.body.classList.remove('celebrate'),900);if(Math.random()<.22)setTimeout(randomEvent,500);}
function randomEvent(){const events=[{t:'ラッキーなお散歩！',m:'道で100コインを見つけたよ！',i:'🪙',v:{coins:100}},{t:'すやすやタイム',m:'パグが昼寝して元気が20回復！',i:'💤',v:{energy:20}},{t:'宝もの発見！',m:'小さなおもちゃを見つけて、ごきげんアップ！',i:'🧸',v:{mood:18}},{t:'どろんこ事件！',m:'水たまりに飛び込んで清潔度が20ダウン！',i:'💦',v:{clean:-20}}];const e=events[Math.floor(Math.random()*events.length)];change(e.v);showEvent(e.t,e.m,e.i);}
function showEvent(title,message,icon){$('eventTitle').textContent=title;$('eventMessage').textContent=message;$('eventIcon').textContent=icon;$('eventDialog').showModal();}
function switchTab(name){document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));$(name+'Panel').classList.add('active');}
$('startButton').addEventListener('click',()=>{const name=$('nameInput').value.trim();if(!name){$('nameError').textContent='名前を入力してね！';return;}state=initial(name);save();render();});
$('nameInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('startButton').click();});
document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>doAction(b.dataset.action)));
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));
$('shopList').addEventListener('click',e=>{const id=e.target.dataset.buy;if(!id)return;const i=items.find(x=>x.id===id);if(state.coins>=i.price&&!state.owned.includes(id)&&state.level>=i.level){state.coins-=i.price;state.owned.push(id);save();render();showEvent('お買いもの成功！',`${i.name}を買ったワン！`,'🛍️');}});
$('inventoryList').addEventListener('click',e=>{const id=e.target.dataset.equip;if(!id)return;const i=items.find(x=>x.id===id);state.equipped[i.type]=state.equipped[i.type]===id?null:id;save();render();});
$('dailyButton').addEventListener('click',()=>{if(state.lastDaily===today())return;state.lastDaily=today();change({coins:50});showEvent('デイリーボーナス！','50コインをプレゼント！ また明日も遊ぼうね。','🎁');});
$('eventClose').addEventListener('click',()=>$('eventDialog').close());
$('renameButton').addEventListener('click',()=>{$('renameInput').value=state.name;$('renameDialog').showModal();});
$('renameCancel').addEventListener('click',()=>$('renameDialog').close());
$('renameSave').addEventListener('click',()=>{const n=$('renameInput').value.trim();if(n){state.name=n;save();render();$('renameDialog').close();}});
$('resetButton').addEventListener('click',()=>{if(confirm('本当に最初からやり直しますか？\n育成データや持ち物はすべて消えます。')){localStorage.removeItem(SAVE_KEY);location.reload();}});

// 公園のお散歩モード
const walk = {active:false,earned:0,coins:[],keys:new Set(),frame:null,lastTime:0,areaChanged:false};
const coinSpots = [[170,180],[310,120],[480,205],[690,185],[780,300],[500,510],[290,525]];
function openWalk(){
  walk.active=true;walk.earned=0;walk.keys.clear();
  walk.coins=coinSpots.sort(()=>Math.random()-.5).slice(0,7).map((p,index)=>({id:index,x:p[0],y:p[1],value:5,collected:false}));
  $('gameScreen').hidden=true;$('walkScreen').hidden=false;
  PugWorld.enter(state.world?.area||'park');renderWalk();$('parkMap').focus();walk.lastTime=performance.now();walk.frame=requestAnimationFrame(walkLoop);
}
function closeWalk(){
  walk.active=false;walk.keys.clear();cancelAnimationFrame(walk.frame);$('walkScreen').hidden=true;$('gameScreen').hidden=false;render();window.scrollTo({top:0,behavior:'smooth'});
}
function renderWalk(){
  $('walkPug').style.left=PugWorld.x+'px';$('walkPug').style.top=PugWorld.y+'px';
  $('walkPug').classList.toggle('moving',walk.keys.size>0);
  $('walkCoinText').textContent=state.coins;$('walkEarnedText').textContent=walk.earned;
  $('areaNameText').textContent=PugWorld.areas[PugWorld.current].name;$('areaGuideText').textContent=PugWorld.areas[PugWorld.current].guide;
  const env=PugWorld.environment();$('seasonText').textContent=env.season;$('periodText').textContent=env.period;$('weatherText').textContent=env.weather;
  $('walkCoins').innerHTML=PugWorld.current==='park'?walk.coins.filter(c=>!c.collected).map(c=>`<span class="map-coin" style="left:${c.x}px;top:${c.y}px">¥</span>`).join(''):'';
  $('npcLayer').innerHTML=PugNPC.inArea(PugWorld.current).map(n=>`<div class="world-npc ${PugNPC.isDog(n)?'dog':'human'}" style="left:${n.x}px;top:${n.y}px" aria-label="${n.name}"><span>${n.icon}</span><b>${n.name}</b></div>`).join('');
  const near=PugNPC.nearest(PugWorld.current,PugWorld.x,PugWorld.y);$('talkButton').disabled=!near;$('talkButton').textContent=near?`💬 ${near.name}と話す`:'💬 近くの相手と話す';
  const view=$('parkMap'),camera=PugWorld.camera(view.clientWidth,view.clientHeight);$('worldLayer').style.transform=`translate3d(${camera.x}px,${camera.y}px,0)`;
}
function moveWalk(dx,dy,amount){
  const changed=PugWorld.move(dx,dy,amount);if(changed){state.world.area=PugWorld.current;state.world.lastArea=PugWorld.current;save();}
  if(PugWorld.current==='park')walk.coins.forEach(c=>{if(!c.collected&&Math.hypot(PugWorld.x-c.x,PugWorld.y-c.y)<48){c.collected=true;walk.earned+=c.value;state.coins+=c.value;save();showCoinPop(c.x,c.y,c.value);}});
  renderWalk();
}
function walkLoop(time){
  if(!walk.active)return;const delta=Math.min(32,time-walk.lastTime);walk.lastTime=time;let dx=0,dy=0;
  if(walk.keys.has('left'))dx--;if(walk.keys.has('right'))dx++;if(walk.keys.has('up'))dy--;if(walk.keys.has('down'))dy++;
  if(dx||dy){const length=Math.hypot(dx,dy);moveWalk(dx/length,dy/length,delta*.025*PugWorld.environment().speed);}
  walk.frame=requestAnimationFrame(walkLoop);
}
function showCoinPop(x,y,value){const pop=document.createElement('span');pop.className='coin-pop';pop.textContent=`+${value} 🪙`;pop.style.left=x+'px';pop.style.top=y+'px';$('worldLayer').appendChild(pop);setTimeout(()=>pop.remove(),750);}
PugWorld.onAreaChange=id=>{if(!state)return;state.world.area=id;state.world.lastArea=id;save();if(walk.active){const toast=document.createElement('span');toast.className='area-toast';toast.textContent=PugWorld.areas[id].name;$('parkMap').appendChild(toast);setTimeout(()=>toast.remove(),1600);}};
const keyDirections={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
window.addEventListener('keydown',e=>{if(!walk.active||!keyDirections[e.key])return;e.preventDefault();walk.keys.add(keyDirections[e.key]);});
window.addEventListener('keyup',e=>{if(keyDirections[e.key])walk.keys.delete(keyDirections[e.key]);});
window.addEventListener('blur',()=>walk.keys.clear());
document.querySelectorAll('.dpad [data-direction]').forEach(button=>{
  const start=e=>{e.preventDefault();walk.keys.add(button.dataset.direction);button.classList.add('pressed');};
  const stop=e=>{e.preventDefault();walk.keys.delete(button.dataset.direction);button.classList.remove('pressed');};
  button.addEventListener('pointerdown',start);button.addEventListener('pointerup',stop);button.addEventListener('pointercancel',stop);button.addEventListener('pointerleave',stop);
});
$('openWalkButton').addEventListener('click',openWalk);
$('returnHomeButton').addEventListener('click',closeWalk);
$('talkButton').addEventListener('click',()=>{const n=PugNPC.nearest(PugWorld.current,PugWorld.x,PugWorld.y);if(!n)return;if(PugNPC.isDog(n)){const old=state.dogBook[n.id]||{meets:0,friendship:0};const entry={meets:old.meets+1,friendship:Math.min(100,old.friendship+10),metAt:n.area};state.dogBook[n.id]=entry;state.xp+=3;state.mood=clamp(state.mood+3);checkLevel();save();renderWalk();showEvent(`${n.name}とおはなし`,`${n.line}\n\n${n.breed}・${n.personality}\n仲良し度 ${entry.friendship}（${PugNPC.tier(entry.friendship)}）`,'🐾');}else{state.npcRelations[n.id]=(state.npcRelations[n.id]||0)+1;save();showEvent(n.name,n.line,n.icon);}});
function renderDogBook(){const met=PugNPC.dogs.filter(d=>state.dogBook[d.id]);$('dogBookCount').textContent=`出会った犬 ${met.length} / ${PugNPC.dogs.length}`;$('dogBookList').innerHTML=PugNPC.dogs.map(d=>{const e=state.dogBook[d.id];return e?`<article class="dog-card"><span>${d.icon}</span><div><h3>${d.name} <small>${d.breed}</small></h3><p>${d.personality}｜好物：${d.favorite}<br>出会った場所：${PugWorld.areas[e.metAt].name}｜${e.meets}回<br><b>${PugNPC.tier(e.friendship)} ${e.friendship}/100</b></p></div></article>`:`<article class="dog-card unknown"><span>❔</span><div><h3>？？？</h3><p>まだ出会っていない犬です</p></div></article>`;}).join('');}
$('dogBookButton').addEventListener('click',()=>{renderDogBook();$('dogBookDialog').showModal();});
$('dogBookClose').addEventListener('click',()=>$('dogBookDialog').close());
load();if(state)render();
