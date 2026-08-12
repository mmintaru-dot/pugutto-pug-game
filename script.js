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
const initial = name => ({name,level:1,xp:0,hunger:80,energy:80,mood:80,clean:80,coins:120,owned:[],equipped:{hat:null,collar:null,clothes:null},lastDaily:null,actions:0});
let state = null;
const $ = id => document.getElementById(id);
function save(){localStorage.setItem(SAVE_KEY,JSON.stringify(state));}
function load(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));if(s?.name) state={...initial(s.name),...s,equipped:{...initial('').equipped,...s.equipped}};}catch(e){localStorage.removeItem(SAVE_KEY);}}
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
load();if(state)render();
