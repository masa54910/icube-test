import type {Locale} from '../types';
const en={
 'memo.mini.title':'CUBE MEMO','memo.mini.open':'Open memo','memo.mini.empty':'Tap to add notes',
 'memo.stock.instructions':'Drag a cube into the workspace.\nOr select a face of an existing cube, then drag in the direction you want to extend.',
 'memo.controls.extend':'Select a face → drag outward: extend a row (Continuous mode)',
 'howToPlay.memo.title':'CUBE MEMO',
 'howToPlay.memo.subtitle':'Keep a record of the shape you discover',
 'howToPlay.memo.body':'Record the cubes you have explored in CUBE MEMO.\n\nArrange the cubes you discover as a 3D miniature. Build up the shape from memory, piece by piece, to work out the whole.',
 'howToPlay.memo.hint':'Your first incorrect answer unlocks a hint. It lights up only cubes you have placed in the correct positions in CUBE MEMO, not the entire answer.',
 'howToPlay.memo.scope':'Prototype: available in Stage 1-1 only.',
 'howToPlay.memo.imageAlt':'CUBE MEMO: cube stock, 3D miniature, grid, controls and hint footer.'
};
export type MemoHelpKey=keyof typeof en;
export const memoHelp:Record<Locale,Record<MemoHelpKey,string>>={en,
 ja:{
 'memo.mini.title':'CUBE MEMO','memo.mini.open':"メモを開く",'memo.mini.empty':"タップしてメモを作成",
 'memo.stock.instructions':'立方体を右のワークスペースにドラッグします。\nまたは、ワークスペース内の立方体の面を指定してから、延ばしたい方向へドラッグでも可。',
 'memo.controls.extend':'面を選択 → 延ばしたい方向へドラッグ：連続配置（「連続配置」モード）',
 'howToPlay.memo.title':'CUBE MEMO','howToPlay.memo.subtitle':'見つけた形を記録する',
 'howToPlay.memo.body':'通ったキューブはCUBE MEMOで記録できる。\n\n探索中に見つけたキューブを、3Dのミニチュアとして自由に並べることができます。覚えている形を少しずつ組み立てながら、全体の形を考えましょう。',
 'howToPlay.memo.hint':'1回目の回答を間違えるとヒントが解放されます。ヒントを使うと、CUBE MEMOで正しい位置に置いたキューブだけが光ります。正解全体が表示されるわけではありません。',
 'howToPlay.memo.scope':'Prototype：現在はStage 1-1のみで利用できます。',
 'howToPlay.memo.imageAlt':'CUBE MEMOの立方体ストック、3Dミニチュア、グリッド、操作パネルとヒント欄。'},
 ko:{
 'memo.mini.title':'CUBE MEMO','memo.mini.open':"메모 열기",'memo.mini.empty':"탭하여 기록하기",
 'memo.stock.instructions':'큐브를 작업 공간으로 드래그하세요.\n또는 작업 공간에 놓인 큐브의 면을 선택한 뒤, 늘리고 싶은 방향으로 드래그하세요.',
 'memo.controls.extend':'면 선택 → 바깥쪽으로 드래그: 연속 배치 모드에서 확장',
 'howToPlay.memo.title':'CUBE MEMO','howToPlay.memo.subtitle':'발견한 모양을 기록하세요',
 'howToPlay.memo.body':'지나온 큐브를 CUBE MEMO에 기록할 수 있습니다.\n\n탐색하며 발견한 큐브를 3D 미니어처로 자유롭게 배치하세요. 기억하는 모양을 조금씩 만들면서 전체 형태를 생각해 보세요.',
 'howToPlay.memo.hint':'첫 번째 답이 틀리면 힌트가 열립니다. 힌트를 사용하면 CUBE MEMO에서 올바른 위치에 놓인 큐브만 빛납니다. 정답 전체를 보여 주지는 않습니다.',
 'howToPlay.memo.scope':'프로토타입: 현재 스테이지 1-1에서만 사용할 수 있습니다.',
 'howToPlay.memo.imageAlt':'CUBE MEMO의 큐브 보관함, 3D 미니어처, 격자, 조작 패널과 힌트 영역.'},
 'zh-CN':{
 'memo.mini.title':'CUBE MEMO','memo.mini.open':"打开笔记",'memo.mini.empty':"点击添加笔记",
 'memo.stock.instructions':'将立方体拖到工作区。\n也可以选择工作区中立方体的一个面，再沿想要延伸的方向拖动。',
 'memo.controls.extend':'选择表面 → 向外拖动：连续放置（连续模式）',
 'howToPlay.memo.title':'CUBE MEMO','howToPlay.memo.subtitle':'记录发现的形状',
 'howToPlay.memo.body':'你可以用CUBE MEMO记录走过的立方体。\n\n将探索中发现的立方体自由排列成3D微缩模型。一点点搭出记忆中的形状，思考空间的整体结构。',
 'howToPlay.memo.hint':'第一次回答错误后会解锁提示。使用提示时，只有CUBE MEMO中位置正确的立方体会发光，不会显示完整答案。',
 'howToPlay.memo.scope':'原型：目前仅在关卡1-1中可用。','howToPlay.memo.imageAlt':'CUBE MEMO的立方体库、3D微缩模型、网格、操作面板和提示区。'},
 'zh-TW':{
 'memo.mini.title':'CUBE MEMO','memo.mini.open':"開啟筆記",'memo.mini.empty':"點選新增筆記",
 'memo.stock.instructions':'將立方體拖曳到工作區。\n也可以選擇工作區中立方體的一個面，再沿想要延伸的方向拖曳。',
 'memo.controls.extend':'選擇表面 → 向外拖曳：連續放置（連續模式）',
 'howToPlay.memo.title':'CUBE MEMO','howToPlay.memo.subtitle':'記錄發現的形狀',
 'howToPlay.memo.body':'你可以用CUBE MEMO記錄走過的立方體。\n\n將探索中發現的立方體自由排列成3D微縮模型。一點點搭出記憶中的形狀，思考空間的整體結構。',
 'howToPlay.memo.hint':'第一次回答錯誤後會解鎖提示。使用提示時，只有CUBE MEMO中位置正確的立方體會發光，不會顯示完整答案。',
 'howToPlay.memo.scope':'原型：目前僅在關卡1-1中可用。','howToPlay.memo.imageAlt':'CUBE MEMO的立方體庫、3D微縮模型、網格、操作面板和提示區。'},
 es:{
 'memo.mini.title':'CUBE MEMO','memo.mini.open':"Abrir notas",'memo.mini.empty':"Toca para añadir notas",
 'memo.stock.instructions':'Arrastra un cubo al área de trabajo.\nTambién puedes seleccionar una cara de un cubo colocado y arrastrar en la dirección que quieras extender.',
 'memo.controls.extend':'Selecciona una cara → arrastra hacia fuera: extender en modo continuo',
 'howToPlay.memo.title':'CUBE MEMO','howToPlay.memo.subtitle':'Registra la forma que descubres',
 'howToPlay.memo.body':'Puedes registrar los cubos que has recorrido en CUBE MEMO.\n\nColoca libremente los cubos que descubras para crear una miniatura 3D. Reconstruye poco a poco la forma que recuerdas para deducir el conjunto.',
 'howToPlay.memo.hint':'El primer error desbloquea una pista. Al usarla, solo brillan los cubos que has colocado en posiciones correctas en CUBE MEMO. No se muestra la respuesta completa.',
 'howToPlay.memo.scope':'Prototipo: disponible solo en la fase 1-1.','howToPlay.memo.imageAlt':'CUBE MEMO: reserva de cubos, miniatura 3D, cuadrícula, controles y pistas.'},
 pt:{
 'memo.mini.title':'CUBE MEMO','memo.mini.open':"Abrir notas",'memo.mini.empty':"Toque para adicionar notas",
 'memo.stock.instructions':'Arraste um cubo para a área de trabalho.\nTambém pode selecionar uma face de um cubo colocado e arrastar na direção que pretende prolongar.',
 'memo.controls.extend':'Selecione uma face → arraste para fora: prolongar no modo contínuo',
 'howToPlay.memo.title':'CUBE MEMO','howToPlay.memo.subtitle':'Registe a forma que descobrir',
 'howToPlay.memo.body':'Pode registar os cubos por onde passou no CUBE MEMO.\n\nDisponha livremente os cubos descobertos para criar uma miniatura 3D. Reconstrua aos poucos a forma de que se lembra para compreender o conjunto.',
 'howToPlay.memo.hint':'A primeira resposta errada desbloqueia uma dica. Ao usá-la, apenas brilham os cubos colocados nas posições certas no CUBE MEMO. A resposta completa não é revelada.',
 'howToPlay.memo.scope':'Protótipo: disponível apenas na fase 1-1.','howToPlay.memo.imageAlt':'CUBE MEMO: reserva de cubos, miniatura 3D, grelha, controlos e área de dicas.'},
 de:{
 'memo.mini.title':'CUBE MEMO','memo.mini.open':"Notiz öffnen",'memo.mini.empty':"Tippen zum Notieren",
 'memo.stock.instructions':'Ziehe einen Würfel in die Arbeitsfläche.\nOder wähle eine Fläche eines platzierten Würfels und ziehe in die Richtung, in die du erweitern möchtest.',
 'memo.controls.extend':'Fläche wählen → nach außen ziehen: im Reihenmodus erweitern',
 'howToPlay.memo.title':'CUBE MEMO','howToPlay.memo.subtitle':'Halte die entdeckte Form fest',
 'howToPlay.memo.body':'Halte erkundete Würfel in CUBE MEMO fest.\n\nOrdne die entdeckten Würfel frei als 3D-Miniatur an. Baue die Form aus deiner Erinnerung Stück für Stück nach, um das Ganze zu erkennen.',
 'howToPlay.memo.hint':'Die erste falsche Antwort schaltet einen Hinweis frei. Er lässt nur die richtig platzierten Würfel in CUBE MEMO leuchten, nicht die gesamte Lösung.',
 'howToPlay.memo.scope':'Prototyp: derzeit nur in Level 1-1 verfügbar.','howToPlay.memo.imageAlt':'CUBE MEMO: Würfelvorrat, 3D-Miniatur, Raster, Werkzeuge und Hinweisbereich.'},
 fr:{
 'memo.mini.title':'CUBE MEMO','memo.mini.open':"Ouvrir les notes",'memo.mini.empty':"Toucher pour noter",
 'memo.stock.instructions':'Fais glisser un cube dans la zone de travail.\nTu peux aussi sélectionner une face d’un cube déjà placé, puis glisser dans la direction souhaitée.',
 'memo.controls.extend':'Choisir une face → glisser vers l’extérieur : prolonger en mode continu',
 'howToPlay.memo.title':'CUBE MEMO','howToPlay.memo.subtitle':'Note la forme que tu découvres',
 'howToPlay.memo.body':'Tu peux noter les cubes parcourus dans CUBE MEMO.\n\nDispose librement les cubes découverts pour créer une miniature 3D. Reconstruis peu à peu la forme dont tu te souviens pour comprendre l’ensemble.',
 'howToPlay.memo.hint':'La première mauvaise réponse débloque un indice. Il fait briller uniquement les cubes bien placés dans CUBE MEMO, sans révéler toute la solution.',
 'howToPlay.memo.scope':'Prototype : disponible uniquement au niveau 1-1.','howToPlay.memo.imageAlt':'CUBE MEMO : réserve de cubes, miniature 3D, grille, commandes et zone d’indice.'}
};
import {memoDirectCopy,memoDirectTranslation} from './memoDirect';
export function memoHelpTranslation(locale:Locale,key:string):string|undefined{const direct=memoDirectTranslation(locale,key);if(direct!==undefined)return direct;if(key==='memo.answer')return (memoDirectCopy[locale]??memoDirectCopy.en)[0];const value=memoHelp[locale]?.[key as MemoHelpKey]??memoHelp.en[key as MemoHelpKey];return key==='howToPlay.memo.body'?value+'\n\n'+(memoDirectCopy[locale]??memoDirectCopy.en)[6]:value;}
