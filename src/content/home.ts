import { bundle } from '../engine/registry';
import { ARTS } from './arts/index';
import { FATES } from './fates';

/**
 * 首屏（抽卡屏）最小内容集：抽命帖只需 `fates`，开局三选一只需 `arts`。
 * 事件池 / 名称表 / 药材 / 丹药 / 丹方由 `content/index.ts` 提供，走动态 import 分包，
 * 由 `store/runStore.ts` 在抽卡屏挂载时预取 —— 见 v0.1.0-06 §三·包体预算。
 */
export const HOME_BUNDLE = bundle({ events: [], fates: FATES, arts: ARTS });
