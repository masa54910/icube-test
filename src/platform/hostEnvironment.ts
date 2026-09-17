/** True only when the YouTube Playables host has opted the page into its runtime. */
export const isYouTubePlayables=():boolean=>typeof ytgame!=='undefined'&&ytgame?.IN_PLAYABLES_ENV===true;
/** Build-time CrazyGames Basic Launch mode; no host SDK is required. */
export const isCrazyGamesBuild=():boolean=>import.meta.env.MODE==='crazygames';
