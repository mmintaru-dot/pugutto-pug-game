(function(){
  const W=900,H=650,playerSize=48;
  const areas={
    home:{name:'自宅',guide:'右の玄関から住宅街へ',className:'area-home',spawn:{x:180,y:330},objects:[
      {type:'wall solid',x:40,y:35,w:820,h:35,label:''},{type:'wall solid',x:40,y:580,w:820,h:35,label:''},{type:'wall solid',x:40,y:70,w:35,h:510,label:''},{type:'wall solid',x:825,y:70,w:35,h:205,label:''},{type:'wall solid',x:825,y:380,w:35,h:200,label:''},
      {type:'rug',x:285,y:235,w:310,h:190,label:'🏠 ぼくのお部屋'},{type:'solid',x:115,y:95,w:190,h:95,label:'🛏️'},{type:'solid',x:650,y:100,w:105,h:85,label:'🛋️'},
      {type:'exit',x:815,y:275,w:75,h:105,label:'玄関 →',exit:{to:'street',x:100,y:325}}
    ]},
    street:{name:'住宅街',guide:'左は自宅、右は公園',className:'area-street',spawn:{x:105,y:325},objects:[
      {type:'road',x:0,y:250,w:900,h:150,label:''},{type:'house solid',x:90,y:55,w:160,h:140,label:'🏡'},{type:'house solid',x:370,y:40,w:170,h:150,label:'🏠'},{type:'house solid',x:650,y:65,w:155,h:135,label:'🏘️'},
      {type:'fence solid',x:250,y:465,w:280,h:38,label:''},{type:'tree solid',x:115,y:475,w:75,h:90,label:'🌳'},{type:'tree solid',x:700,y:475,w:75,h:90,label:'🌲'},
      {type:'exit',x:0,y:270,w:70,h:110,label:'← 自宅',exit:{to:'home',x:780,y:325}},{type:'exit',x:830,y:270,w:70,h:110,label:'公園 →',exit:{to:'park',x:100,y:325}}
    ]},
    park:{name:'公園',guide:'コインを集めよう！ 左は住宅街',className:'area-park',spawn:{x:105,y:325},objects:[
      {type:'pond solid',x:570,y:350,w:245,h:180,label:'〰'},{type:'tree solid',x:120,y:80,w:80,h:95,label:'🌳'},{type:'tree solid',x:400,y:55,w:80,h:95,label:'🌲'},{type:'tree solid',x:735,y:85,w:80,h:95,label:'🌳'},
      {type:'fence solid',x:255,y:455,w:210,h:38,label:''},{type:'solid',x:330,y:195,w:90,h:55,label:'🪵'},
      {type:'exit',x:0,y:270,w:75,h:110,label:'← 住宅街',exit:{to:'street',x:785,y:325}}
    ]}
  };
  function rectHit(x,y,o){return x+playerSize/2>o.x&&x-playerSize/2<o.x+o.w&&y+playerSize/2>o.y&&y-playerSize/2<o.y+o.h;}
  window.PugWorld={
    width:W,height:H,areas,current:'park',x:105,y:325,
    enter(id,spawn){const area=areas[id];if(!area)return;this.current=id;this.x=spawn?.x??area.spawn.x;this.y=spawn?.y??area.spawn.y;this.renderArea();this.onAreaChange?.(id);},
    renderArea(){const area=areas[this.current],layer=document.getElementById('worldLayer'),decor=document.getElementById('worldDecor');layer.className='world-layer '+area.className;decor.innerHTML=area.objects.map((o,i)=>`<div class="world-object ${o.type}" data-object="${i}" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px">${o.label||''}</div>`).join('');},
    move(dx,dy,amount){const area=areas[this.current];let nx=Math.max(25,Math.min(W-25,this.x+dx*amount)),ny=this.y;const solids=area.objects.filter(o=>o.type.includes('solid'));if(!solids.some(o=>rectHit(nx,ny,o)))this.x=nx;nx=this.x;ny=Math.max(25,Math.min(H-25,this.y+dy*amount));if(!solids.some(o=>rectHit(nx,ny,o)))this.y=ny;const gate=area.objects.find(o=>o.exit&&rectHit(this.x,this.y,o));if(gate){this.enter(gate.exit.to,{x:gate.exit.x,y:gate.exit.y});return true;}return false;},
    camera(viewW,viewH){return{x:Math.min(0,Math.max(viewW-W,viewW/2-this.x)),y:Math.min(0,Math.max(viewH-H,viewH/2-this.y))};}
  };
})();
