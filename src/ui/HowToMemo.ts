import {t} from '../i18n';
import './how-memo.css';

/** Documentation only. Does not create or connect a live editor. */
export function createHowToMemo():HTMLElement {
 const section=document.createElement('section');section.className='how-memo';section.dataset.howSection='memo';
 const title=document.createElement('h3');title.textContent=t('howToPlay.memo.title');
 const subtitle=document.createElement('h4');subtitle.textContent=t('howToPlay.memo.subtitle');
 const copy=document.createElement('div');copy.className='how-memo-copy';
 for(const [i,part]of t('howToPlay.memo.body').split('\n\n').entries()){
  const p=document.createElement('p');if(i===0){const strong=document.createElement('strong');strong.textContent=part;p.append(strong);}else p.textContent=part;copy.append(p);
 }
 const figure=document.createElement('figure');const img=document.createElement('img');
 img.src=import.meta.env.BASE_URL+'assets/howto/cube-memo.png';img.alt=t('howToPlay.memo.imageAlt');img.loading='lazy';img.decoding='async';img.width=1896;img.height=1256;figure.append(img);
 const hint=document.createElement('p');hint.className='how-memo-hint';hint.textContent=t('howToPlay.memo.hint');
 const scope=document.createElement('section');scope.className='how-memo-scope';const heading=document.createElement('h3');heading.textContent=t('advanced.title');const body=document.createElement('p');body.textContent=t('advanced.body');scope.append(heading,body);const boostHeading=document.createElement('h4');boostHeading.textContent='❯❯ BOOST PAD';const boost=document.createElement('p');boost.textContent=t('advanced.boost');const answers=document.createElement('p');answers.textContent=t('advanced.answers');scope.append(boostHeading,boost,answers);
 section.append(title,subtitle,copy,figure,hint,scope);return section;
}
