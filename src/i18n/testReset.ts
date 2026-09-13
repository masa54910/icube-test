import type {Locale} from '../types';
export const testResetKeys=["home.takeCubeTest","home.continueCubeTest","cubeTest.clearResults","cubeTest.clearConfirmTitle","cubeTest.clearConfirmBody","cubeTest.clearConfirm"] as const;
const copy:Record<Locale,readonly string[]>={
 "en": [
  "TAKE THE CUBE TEST",
  "CONTINUE TEST",
  "Clear test results",
  "Clear test results?",
  "CUBE SCORE, test history and the unfinished test will be deleted. Standard/Advanced progress, settings and regular stage memos will be kept.",
  "CLEAR RESULTS"
 ],
 "ja": [
  "CUBE TESTを受ける",
  "テストを続ける",
  "テスト結果をクリア",
  "テスト結果をクリアしますか？",
  "CUBE SCORE・TESTの結果履歴・途中のTESTが削除されます。Standard／Advancedの進捗、設定、通常Stageのメモは残ります。",
  "クリアする"
 ],
 "ko": [
  "CUBE TEST 도전",
  "테스트 계속",
  "테스트 결과 지우기",
  "테스트 결과를 지울까요?",
  "CUBE SCORE, 테스트 기록과 진행 중인 테스트가 삭제됩니다. Standard/Advanced 진행 상황, 설정과 일반 스테이지 메모는 유지됩니다.",
  "결과 지우기"
 ],
 "zh-CN": [
  "参加 CUBE TEST",
  "继续测试",
  "清除测试结果",
  "清除测试结果？",
  "将删除 CUBE SCORE、测试历史和未完成的测试。保留 Standard/Advanced 进度、设置及普通关卡备忘。",
  "清除结果"
 ],
 "zh-TW": [
  "參加 CUBE TEST",
  "繼續測試",
  "清除測試結果",
  "清除測試結果？",
  "將刪除 CUBE SCORE、測試歷史和未完成的測試。保留 Standard/Advanced 進度、設定及一般關卡備忘。",
  "清除結果"
 ],
 "es": [
  "HACER EL CUBE TEST",
  "CONTINUAR TEST",
  "Borrar resultados del test",
  "¿Borrar los resultados?",
  "Se borrarán CUBE SCORE, el historial y el test pendiente. Se conservarán el progreso Standard/Advanced, los ajustes y los memos de etapas normales.",
  "BORRAR RESULTADOS"
 ],
 "pt": [
  "FAZER O CUBE TEST",
  "CONTINUAR TESTE",
  "Limpar resultados do teste",
  "Limpar os resultados?",
  "CUBE SCORE, o histórico e o teste em curso serão apagados. O progresso Standard/Advanced, as configurações e os memos de fases normais serão mantidos.",
  "LIMPAR RESULTADOS"
 ],
 "de": [
  "CUBE TEST SPIELEN",
  "TEST FORTSETZEN",
  "Testergebnisse löschen",
  "Testergebnisse löschen?",
  "CUBE SCORE, Testverlauf und der laufende Test werden gelöscht. Standard/Advanced-Fortschritt, Einstellungen und normale Stage-Memos bleiben erhalten.",
  "ERGEBNISSE LÖSCHEN"
 ],
 "fr": [
  "PASSER LE CUBE TEST",
  "REPRENDRE LE TEST",
  "Effacer les résultats du test",
  "Effacer les résultats ?",
  "CUBE SCORE, l’historique et le test en cours seront effacés. La progression Standard/Advanced, les réglages et les memos des niveaux normaux seront conservés.",
  "EFFACER LES RÉSULTATS"
 ]
};
export function testResetTranslation(locale:Locale,key:string){const i=(testResetKeys as readonly string[]).indexOf(key);return i<0?undefined:copy[locale][i];}
