export type LogTone =
  | 'year'
  | 'brk'
  | 'ev1'
  | 'ev2'
  | 'ev3'
  | 'ev4'
  | 'huan'
  | 'rare'
  | 'red'
  | 'gold'
  | 'xian'
  | 'rainbow'
  | 'god'
  | 'special'
  | 'dead';

export type LogFx = 'trib' | 'levelup' | 'ascend';

export interface LogLine {
  cls: LogTone;
  text: string;
  fx?: LogFx;
}

export type RunEndReason =
  | 'simDepleted'
  | 'tribFail'
  | 'immortal'
  | 'gateFail'
  | 'peril'
  | 'zhengdao'
  | 'voluntary';
