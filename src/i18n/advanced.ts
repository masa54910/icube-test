import type {Locale} from '../types';
import {pureRouteCopy} from './pureRoute';
export const advancedCopy:Record<Locale,readonly [string,string,string]>={
 en:['STANDARD — See the shape · 31 stages','Follow the route · 3 prototype stages','Explore a winding trail of cubes. Remember its turns, height and length, and watch for cubes attached outside the main route. Use CUBE MEMO to reconstruct what you see in 3D as you explore.'],
 ja:['STANDARD — 形を見抜く · 31問','ルートを読み解く · Prototype 3問','長く連なったキューブの道筋を探索します。曲がり方、高さ、長さだけでなく、進路の外側に付いたキューブにも注意しましょう。CUBE MEMOを使って、自分が見たルートを立体的に組み立てながら進むことができます。'],
 ko:['STANDARD — 형태를 파악하세요 · 31개 스테이지','경로를 파악하세요 · 프로토타입 3개','길게 이어진 큐브의 경로를 탐색하세요. 방향과 높이, 길이뿐 아니라 경로 바깥에 붙은 큐브도 살펴보세요. CUBE MEMO로 본 경로를 입체적으로 기록하며 나아갈 수 있습니다.'],
 'zh-CN':['STANDARD — 看清形状 · 31关','读懂路线 · 3个原型关卡','探索由立方体连接而成的长路。留意转弯、高度、长度，以及主路线外侧附着的立方体。探索时，可以用CUBE MEMO将看到的路线逐步搭成立体模型。'],
 'zh-TW':['STANDARD — 看清形狀 · 31關','讀懂路線 · 3個原型關卡','探索由立方體連接而成的長路。留意轉彎、高度、長度，以及主路線外側附著的立方體。探索時，可以用CUBE MEMO將看到的路線逐步搭成立體模型。'],
 es:['STANDARD — Descubre la forma · 31 fases','Descifra la ruta · 3 fases de prueba','Explora un camino sinuoso de cubos. Recuerda los giros, la altura y la longitud, y observa los cubos unidos por fuera de la ruta principal. Usa CUBE MEMO para reconstruir en 3D lo que ves mientras avanzas.'],
 pt:['STANDARD — Descubra a forma · 31 fases','Desvende o percurso · 3 fases de teste','Explore um caminho sinuoso de cubos. Observe as curvas, a altura, o comprimento e os cubos ligados ao exterior do percurso principal. Use o CUBE MEMO para reconstruir em 3D o que vê enquanto avança.'],
 de:['STANDARD — Erkenne die Form · 31 Level','Erkunde den Verlauf · 3 Prototyp-Level','Erkunde einen langen, gewundenen Würfelpfad. Merke dir Richtungswechsel, Höhen und Längen. Achte auch auf Würfel außerhalb des Hauptwegs. Mit CUBE MEMO kannst du den erkundeten Verlauf unterwegs dreidimensional nachbauen.'],
 fr:['STANDARD — Trouve la forme · 31 niveaux','Déchiffre le parcours · 3 prototypes','Explore un long chemin de cubes. Observe les virages, les hauteurs, les longueurs et les cubes fixés en dehors du parcours principal. Utilise CUBE MEMO pour reconstruire en 3D ce que tu vois au fil de ton exploration.']
};
export function advancedTranslation(locale:Locale,key:string):string|undefined{if(key==='advanced.title')return 'ADVANCED — ROUTE 1';if(key==='advanced.select')return 'PURE ROUTE · 1-1 — 1-10';const j=['advanced.body','advanced.boost','advanced.answers'].indexOf(key);if(j>=0)return (pureRouteCopy[locale]??pureRouteCopy.en)[j];return key==='advanced.standard'?advancedCopy[locale][0]:undefined;}
