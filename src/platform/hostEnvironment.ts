/** True only when the YouTube Playables host has opted the page into its runtime. */
export const isYouTubePlayables=():boolean=>typeof ytgame!=='undefined'&&ytgame?.IN_PLAYABLES_ENV===true;
