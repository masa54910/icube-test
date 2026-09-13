import type {Locale} from '../types';
// Title, four heading/body pairs, back. Brand control names remain recognizable.
export const how:Record<Locale,readonly string[]>={
en:['HOW TO PLAY','Explore freely','Explore freely and remember the shape of the space.','Ladders','Use ladders to move between floors.','LOOK UP','Hold LOOK UP to check directly above you.','Answer','At the Answer Point, choose the shape that matches the space you explored. You have two attempts.','BACK'],
ja:['遊び方','自由に探索','自由に探索し、空間の形を記憶しよう。','梯子','梯子を使って上下のフロアを移動できます。','見上げる','LOOK UPで真上を確認できます。','回答','Answer Pointで、探索した形と一致するものを選びます。 回答権は2回です。','戻る'],
ko:['플레이 방법','자유롭게 탐색','자유롭게 탐색하며 공간의 형태를 기억하세요.','사다리','사다리를 이용해 위아래 층으로 이동하세요.','위를 보기','LOOK UP을 누르고 있으면 바로 위를 볼 수 있어요.','정답 선택','Answer Point에서 탐색한 공간과 일치하는 형태를 선택하세요. 답변 기회는 두 번입니다.','뒤로'],
'zh-CN':['玩法说明','自由探索','自由探索，记住空间的形状。','梯子','使用梯子在上下楼层之间移动。','向上看','按住LOOK UP，查看正上方。','回答','在Answer Point选择与探索过的空间一致的形状。 你有两次回答机会。','返回'],
'zh-TW':['玩法說明','自由探索','自由探索，記住空間的形狀。','梯子','使用梯子在上下樓層之間移動。','向上看','按住LOOK UP，查看正上方。','回答','在Answer Point選擇與探索過的空間一致的形狀。 你有兩次回答機會。','返回'],
es:['CÓMO JUGAR','Explora libremente','Explora libremente y recuerda la forma del espacio.','Escaleras','Usa las escaleras para moverte entre pisos.','Mira hacia arriba','Mantén pulsado LOOK UP para mirar justo encima de ti.','Responde','En el Answer Point, elige la forma que coincide con el espacio que exploraste. Tienes dos intentos.','VOLVER'],
pt:['COMO JOGAR','Explore livremente','Explore livremente e memorize a forma do espaço.','Escadas','Use as escadas para se deslocar entre os pisos.','Olhe para cima','Mantenha LOOK UP pressionado para olhar diretamente para cima.','Responda','No Answer Point, escolha a forma que corresponde ao espaço explorado. Tem duas tentativas.','VOLTAR'],
de:['SPIELANLEITUNG','Frei erkunden','Erkunde frei und merke dir die Form des Raums.','Leitern','Benutze Leitern, um zwischen den Stockwerken zu wechseln.','Nach oben schauen','Halte LOOK UP gedrückt, um direkt nach oben zu schauen.','Antworten','Wähle am Answer Point die Form, die dem erkundeten Raum entspricht. Du hast zwei Versuche.','ZURÜCK'],
fr:['COMMENT JOUER','Explore librement','Explore librement et mémorise la forme de l’espace.','Échelles','Utilise les échelles pour passer d’un étage à l’autre.','Regarde en haut','Maintiens LOOK UP pour regarder juste au-dessus de toi.','Réponds','Au Answer Point, choisis la forme qui correspond à l’espace exploré. Tu as droit à deux essais.','RETOUR']
};
export const howKeys=['how.title','how.explore.title','how.explore.body','how.ladder.title','how.ladder.body','how.look.title','how.look.body','how.answer.title','how.answer.body','how.back'] as const;
