(function(){
  const dogs=[
    {id:'mame',area:'street',x:500,y:440,name:'まめ',breed:'柴犬',personality:'しっかり者',favorite:'ささみ',toy:'ボール',icon:'🐕',line:'この街のことなら任せてワン！'},
    {id:'moco',area:'park',x:280,y:330,name:'モコ',breed:'トイプードル',personality:'おしゃれ',favorite:'ケーキ',toy:'ぬいぐるみ',icon:'🐩',line:'今日のリボン、似合うでしょ？'},
    {id:'choco',area:'shopping',x:510,y:440,name:'チョコ',breed:'ダックス',personality:'食いしん坊',favorite:'おやつ',toy:'ロープ',icon:'🐕',line:'商店街はいい匂いがするワン！'},
    {id:'kiki',area:'cafe',x:300,y:355,name:'キキ',breed:'チワワ',personality:'甘えん坊',favorite:'ミルク',toy:'小さなボール',icon:'🐶',line:'となりに座ってもいい？'},
    {id:'bunta',area:'dogrun',x:410,y:350,name:'ぶんた',breed:'フレンチブルドッグ',personality:'元気',favorite:'チキン',toy:'フリスビー',icon:'🐕',line:'いっしょに走ろうぜ！'},
    {id:'leo',area:'seaside',x:520,y:300,name:'レオ',breed:'ゴールデンレトリバー',personality:'やさしい',favorite:'野菜',toy:'流木',icon:'🦮',line:'海風が気持ちいいね。'},
    {id:'coro',area:'riverside',x:680,y:430,name:'コロ',breed:'コーギー',personality:'好奇心旺盛',favorite:'りんご',toy:'ボール',icon:'🐕',line:'川の向こうも探検したいワン！'},
    {id:'beat',area:'station',x:170,y:440,name:'ビート',breed:'ビーグル',personality:'旅好き',favorite:'骨',toy:'音の鳴るおもちゃ',icon:'🐕',line:'電車で遠くへ行ってみたいな！'},
    {id:'pomu',area:'petshop',x:610,y:360,name:'ポム',breed:'ポメラニアン',personality:'陽気',favorite:'クッキー',toy:'ぬいぐるみ',icon:'🐶',line:'ふわふわ仲間になろう！'},
    {id:'sora',area:'forest',x:620,y:335,name:'ソラ',breed:'ボーダーコリー',personality:'賢い',favorite:'チーズ',toy:'フリスビー',icon:'🐕‍🦺',line:'森の道は全部覚えているよ。'}
  ];
  const humans=[{id:'aoi',area:'street',x:350,y:440,name:'あおいさん',icon:'🧑',line:'こんにちは！ お散歩日和ですね。'},{id:'owner',area:'petshop',x:450,y:270,name:'店長さん',icon:'👩‍🦰',line:'わんちゃん用品をそろえて待っていますよ。'},{id:'doctor',area:'hospital',x:450,y:270,name:'やさしい先生',icon:'👨‍⚕️',line:'元気そうですね。無理せず遊んでね。'},{id:'master',area:'cafe',x:610,y:270,name:'カフェ店主',icon:'🧑‍🍳',line:'わんこ用のお水はいつでもどうぞ。'},{id:'ranger',area:'forest',x:240,y:390,name:'森の案内人',icon:'🧑‍🌾',line:'暗くなる前に帰るんだよ。'}];
  const all=[...dogs,...humans],tier=value=>value>=80?'親友':value>=50?'仲良し':value>=20?'友達':'知り合い';
  window.PugNPC={dogs,humans,tier,inArea:area=>all.filter(n=>n.area===area),nearest(area,x,y,max=82){let best=null,dist=max;for(const n of this.inArea(area)){const d=Math.hypot(x-n.x,y-n.y);if(d<dist){best=n;dist=d;}}return best;},isDog:n=>dogs.some(d=>d.id===n.id)};
})();
