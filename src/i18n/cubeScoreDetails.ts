import type {Locale} from '../types';
export const scoreDetailKeys=['cubeScore.date','cubeScore.firstTry','cubeScore.averageTime','cubeScore.progress','cubeScore.newBest','cubeScore.components'] as const;
const labels:Record<Locale,readonly string[]>={
 en:['Test date','First-try correct','Average solve time','Stage progress','NEW BEST','Difficulty / Accuracy / Time'],
 ja:['受験日','1回目で正解','平均解答時間','ステージ進捗','ベスト更新','難易度 / 正確さ / 時間'],
 ko:['테스트 날짜','첫 시도 정답','평균 풀이 시간','스테이지 진행','최고 기록','난이도 / 정확도 / 시간'],
 'zh-CN':['测试日期','首次答对','平均解题时间','关卡进度','新最佳成绩','难度 / 准确度 / 时间'],
 'zh-TW':['測試日期','首次答對','平均解題時間','關卡進度','新最佳成績','難度 / 準確度 / 時間'],
 es:['Fecha del test','Aciertos al primer intento','Tiempo medio','Progreso de fases','NUEVO RÉCORD','Dificultad / Precisión / Tiempo'],
 pt:['Data do teste','Acertos na primeira tentativa','Tempo médio','Progresso das fases','NOVO RECORDE','Dificuldade / Precisão / Tempo'],
 de:['Testdatum','Beim ersten Versuch richtig','Durchschnittliche Lösungszeit','Levelfortschritt','NEUER BESTWERT','Schwierigkeit / Genauigkeit / Zeit'],
 fr:['Date du test','Réussites au premier essai','Temps moyen','Progression des niveaux','NOUVEAU RECORD','Difficulté / Précision / Temps'],
};
export function scoreDetailTranslation(locale:Locale,key:string){const i=(scoreDetailKeys as readonly string[]).indexOf(key);return i<0?undefined:labels[locale][i];}
