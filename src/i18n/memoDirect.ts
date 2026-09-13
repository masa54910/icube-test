import type {Locale} from '../types';
export const memoDirectCopy:Record<Locale,readonly [string,string,string,string,string,string,string]>={
 en:['SUBMIT THIS SHAPE','YOUR ANSWER','Submit this shape as your answer?','YES','BACK','INCORRECT','When your shape is complete in CUBE MEMO, you can submit the miniature itself as your answer. Choose SUBMIT THIS SHAPE and confirm to have that shape checked directly.'],
 ja:['この形を答えとして提出する','あなたの回答','これで回答しますか？','はい','戻る','不正解','CUBE MEMOで形が完成したら、そのミニチュア自体を答えとして提出できます。\n\n「この形を答えとして提出する」を押して確認すると、その形が直接判定されます。'],
 ko:['이 모양을 답으로 제출','나의 답','이 모양을 답으로 제출할까요?','예','돌아가기','오답','CUBE MEMO에서 모양을 완성하면 미니어처 자체를 답으로 제출할 수 있습니다. 「이 모양을 답으로 제출」을 누르고 확인하면 만든 모양을 바로 판정합니다.'],
 'zh-CN':['将此形状作为答案提交','你的答案','确定将此形状作为答案提交吗？','是','返回','回答错误','在CUBE MEMO中完成形状后，可以将微缩模型本身作为答案提交。点击“将此形状作为答案提交”并确认，即可直接判定该形状。'],
 'zh-TW':['將此形狀作為答案提交','你的答案','確定將此形狀作為答案提交嗎？','是','返回','回答錯誤','在CUBE MEMO中完成形狀後，可以將微縮模型本身作為答案提交。點擊「將此形狀作為答案提交」並確認，即可直接判定該形狀。'],
 es:['ENVIAR ESTA FORMA','TU RESPUESTA','¿Enviar esta forma como respuesta?','SÍ','VOLVER','INCORRECTO','Cuando completes la forma en CUBE MEMO, puedes enviar la miniatura como respuesta. Elige ENVIAR ESTA FORMA y confirma para comprobar directamente la forma que has creado.'],
 pt:['ENVIAR ESTA FORMA','A SUA RESPOSTA','Enviar esta forma como resposta?','SIM','VOLTAR','INCORRETO','Quando completar a forma no CUBE MEMO, pode enviar a miniatura como resposta. Escolha ENVIAR ESTA FORMA e confirme para verificar diretamente a forma que criou.'],
 de:['DIESE FORM EINREICHEN','DEINE ANTWORT','Diese Form als Antwort einreichen?','JA','ZURÜCK','FALSCH','Wenn deine Form in CUBE MEMO fertig ist, kannst du die Miniatur selbst als Antwort einreichen. Wähle DIESE FORM EINREICHEN und bestätige, um deine Form direkt prüfen zu lassen.'],
 fr:['SOUMETTRE CETTE FORME','TA RÉPONSE','Soumettre cette forme comme réponse ?','OUI','RETOUR','INCORRECT','Quand ta forme est terminée dans CUBE MEMO, tu peux proposer la miniature elle-même comme réponse. Choisis SOUMETTRE CETTE FORME et confirme pour faire vérifier directement ta forme.']
};
const keys=['memo.submitShape','memo.confirm.title','memo.confirm.message','memo.confirm.yes','memo.confirm.back','memo.answer.incorrect'];
export function memoDirectTranslation(locale:Locale,key:string):string|undefined {const i=keys.indexOf(key);return i<0?undefined:(memoDirectCopy[locale]??memoDirectCopy.en)[i];}
