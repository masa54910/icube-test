export type Vec3Tuple = readonly [number, number, number];
export interface LadderDefinition { readonly id: string; readonly from: Vec3Tuple; readonly to: Vec3Tuple; readonly facingYaw?:number; }
export interface ShapeChoice { readonly id: string; readonly voxels: readonly Vec3Tuple[]; readonly correct: boolean; }
export interface StageDefinition {
  readonly routeChapter?:number;
  readonly answerPoints?:readonly Vec3Tuple[];
  readonly boostPads?:readonly {position:Vec3Tuple;direction:Vec3Tuple;distance:number}[];
  readonly section?:'standard'|'advanced'|'test';
  readonly stageType?:'shape'|'route';
  readonly goal?:Vec3Tuple;
  readonly route?:{readonly main:readonly Vec3Tuple[];readonly distractors:readonly Vec3Tuple[]};
  readonly memo?: StageMemoConfig;
  readonly id: string;
  readonly numericId: number;
  readonly group: 1 | 2 | 3;
  readonly level: number;
  readonly displayName: string;
  readonly subtitle: string;
  readonly difficulty: number;
  readonly rooms: readonly Vec3Tuple[];
  readonly start: Vec3Tuple;
  readonly ladders: readonly LadderDefinition[];
  readonly choiceFamily?: 'letters' | 'digits';
}
export interface StageMemoConfig {
  readonly enabled:boolean;
  readonly origin:Vec3Tuple;
  readonly canonicalCubes:readonly Vec3Tuple[];
  readonly hintLimit:number;
}
export type Locale = 'en' | 'ja' | 'zh-CN' | 'zh-TW' | 'ko' | 'es' | 'pt' | 'de' | 'fr';
