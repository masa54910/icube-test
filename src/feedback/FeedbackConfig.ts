export type FeedbackConfig={betaFeedbackEnabled:boolean;normalStageClearThreshold:number;activePlaySecondsThreshold:number;dismissCooldownMs:number};

/** Feedback is intentionally enabled only for the standalone web beta. */
const isPlayablesHost=()=>typeof ytgame!=='undefined' && Boolean(ytgame?.IN_PLAYABLES_ENV);
export const feedbackConfig:FeedbackConfig={
  betaFeedbackEnabled:import.meta.env.VITE_BETA_FEEDBACK_ENABLED==='true' && typeof window!=='undefined' && !isPlayablesHost(),
  normalStageClearThreshold:3,
  activePlaySecondsThreshold:300,
  dismissCooldownMs:24*60*60*1000,
};

export const feedbackIsEnabled=()=>feedbackConfig.betaFeedbackEnabled;
