/** Home-only copy, centralized for future i18n. */
export const HOME_COPY={
  headline:'探索して、記憶して、見抜け。',
  supporting:'君の空間把握能力が試される。',
  tagline:'THINK IN THREE DIMENSIONS.',
  worldTagline:'EXPLORE · SOLVE · THINK',
  cubieAlt:'キュービー — 白い惑星に立つ探検家',
};
export const HOME_ICONS:Record<string,string>={
  test:'<rect x="6" y="6" width="20" height="23" rx="3"/><rect x="11" y="3" width="10" height="6" rx="2"/><path d="m10 18 4 4 8-9"/>',
  continue:'<path d="m9 5 12 11-12 11Z"/>',
  new:'<path d="m16 3 11 6v14l-11 6-11-6V9Z M5 9l11 6 11-6 M16 15v14"/>',
  stages:'<rect x="4" y="4" width="9" height="9" rx="2"/><rect x="19" y="4" width="9" height="9" rx="2"/><rect x="4" y="19" width="9" height="9" rx="2"/><rect x="19" y="19" width="9" height="9" rx="2"/>',
  how:'<path d="M16 7C12 4 7 4 3 6v21c4-2 9-2 13 1 4-3 9-3 13-1V6c-4-2-9-2-13 1Zm0 0v21 M8 11h3 M8 16h3 M21 11h3 M21 16h3"/>',
};
export const homeIcon=(key:string):string=>'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+HOME_ICONS[key]+'</svg>';
