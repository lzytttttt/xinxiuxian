import {
  IMMORTAL_BOOST,
  IMM_PERIL_BASE,
  IMM_PERIL_LOSS_HI,
  IMM_PERIL_LOSS_LO,
  IMM_PERIL_MAX,
  IMM_PERIL_SLOPE,
  LUCK_TRIB_DIV,
  REALM_MAX_IMMORTAL,
  SIM_MAX_IMMORTAL,
  TOXICITY_PERIL_BONUS,
  TRIB_BONUS,
  TRIB_BONUS2,
  TRIB_MULT,
  TRIB_MULT2,
  TRIB_REQ,
  TRIB_REQ2,
} from './constants';
import { powerOf } from './selectors';
import { luckyTribMult } from './arts';
import type { ContentBundle, Decision } from './types/effects';
import type { LogLine } from './types/log';
import type { RngBag } from './types/rng';
import type { RunState } from './types/run';

export interface TribulationResult {
  logs: LogLine[];
  pending: Decision | null;
}

export function shouldTribulate(s: RunState): boolean {
  if (s.dead) return false;
  if (s.realm.arc === 'immortal') return s.realm.level >= REALM_MAX_IMMORTAL;
  return s.realm.level >= 91 && !s.brokeThisYear && s.simPoints - s.age <= 0;
}

export function runTribulation(s: RunState, rng: RngBag, c: ContentBundle): TribulationResult {
  const logs: LogLine[] = [];
  const immortal = s.realm.arc === 'immortal';
  const reqs = immortal ? TRIB_REQ2 : TRIB_REQ;
  const mults = immortal ? TRIB_MULT2 : TRIB_MULT;
  const bonus = immortal ? TRIB_BONUS2 : TRIB_BONUS;
  const luckyMult = luckyTribMult(s, c);

  logs.push({ cls: 'rainbow', text: '劫云压顶，九重雷光在云中翻涌——你已无路可退！', fx: 'trib' });

  for (let i = 0; i < 9; i++) {
    const req = (reqs[i] ?? 0) * s.tribulationReqMult;
    const power = powerOf(s, c);
    let passed = false;
    if (power >= req) {
      passed = true;
      logs.push({ cls: 'rainbow', text: `第${cnNum(i + 1)}重劫雷应声而散，你硬抗而过！` });
    } else if (rng.tribulation.next() < (s.luck / LUCK_TRIB_DIV) * luckyMult) {
      passed = true;
      logs.push({ cls: 'rainbow', text: `第${cnNum(i + 1)}重劫雷擦身而过——侥幸！` });
    } else if (!immortal && s.xianqi >= 1) {
      s.xianqi -= 1;
      passed = true;
      logs.push({ cls: 'xian', text: `你祭出一缕仙灵气，第${cnNum(i + 1)}重劫雷应声而散。` });
    } else if (immortal && s.chaosQi >= 1) {
      s.chaosQi -= 1;
      passed = true;
      logs.push({ cls: 'xian', text: `你以混沌气护住道体，第${cnNum(i + 1)}重劫雷尽数溃散。` });
    }
    if (!passed) {
      s.dead = true;
      s.endedReason = 'tribFail';
      logs.push({ cls: 'dead', text: `第${cnNum(i + 1)}重劫雷贯穿道体，你的意识在雷光中散尽。` });
      return { logs, pending: null };
    }
    s.tribPassed = i + 1;
    s.cultivation *= mults[i] ?? 1;
  }

  s.cultivation += bonus;
  if (!immortal) {
    s.ascendMode = 'immortal';
    s.brokeThisYear = true;
    logs.push({
      cls: 'rainbow',
      text: '九重俱过，霞光万道自天而降，天地在你身前敞开！',
      fx: 'ascend',
    });
    return {
      logs,
      pending: {
        source: 'system',
        kind: 'tribulation',
        eventId: 'ascension',
        title: '飞升',
        body: '身周霞光渐盛，你已触及仙界门槛。是就此踏入，还是止步于此、留下这一世的传说？',
        choices: [
          { id: 'continue', label: '继续·仙界篇', show: true, enable: true, hint: { risk: 2, reward: 3 } },
          { id: 'settle', label: '就此结算', show: true, enable: true, hint: { risk: 0, reward: 1 } },
        ],
      },
    };
  }

  s.ascendMode = 'zhengdao';
  s.endedReason = 'zhengdao';
  logs.push({
    cls: 'god',
    text: '大道加身，你证道成圣，自此超脱仙域，与道合真。',
    fx: 'ascend',
  });
  return { logs, pending: null };
}

export function enterImmortalRealm(s: RunState): LogLine[] {
  s.realm = { arc: 'immortal', stage: 1, level: 101 };
  s.cultivation *= IMMORTAL_BOOST;
  s.simPoints = SIM_MAX_IMMORTAL;
  s.xianqi += 1;
  s.chaosQi = 0;
  s.tribPassed = 0;
  s.yearsStayed = 0;
  s.ascended = false;
  return [
    {
      cls: 'god',
      text: '仙门大开，你踏入仙界，周身仙元翻涌——修仙之路，自此重头。',
      fx: 'ascend',
    },
  ];
}

export function resolveAscensionChoice(s: RunState, choiceId: string): LogLine[] {
  if (choiceId === 'continue') return enterImmortalRealm(s);
  s.endedReason = 'immortal';
  s.simPoints = SIM_MAX_IMMORTAL;
  return [{ cls: 'god', text: '你止步于仙门之外，将这一世的传说留给后人。' }];
}

export function perilTick(s: RunState, rng: RngBag): LogLine[] {
  if (s.realm.arc !== 'immortal' || s.dead) return [];
  s.yearsStayed += 1;
  const risk = Math.min(IMM_PERIL_MAX, IMM_PERIL_BASE + s.yearsStayed * IMM_PERIL_SLOPE) +
    s.toxicity / TOXICITY_PERIL_BONUS;
  if (!rng.tribulation.chance(Math.min(IMM_PERIL_MAX, risk))) return [];
  if (s.chaosQi >= 1) {
    s.chaosQi -= 1;
    const loss = s.cultivation * (IMM_PERIL_LOSS_LO + rng.tribulation.next() * (IMM_PERIL_LOSS_HI - IMM_PERIL_LOSS_LO));
    s.cultivation = Math.max(0, s.cultivation - loss);
    return [{ cls: 'red', text: '心魔骤起，你以混沌气镇压，修为略损。' }];
  }
  s.dead = true;
  s.endedReason = 'peril';
  return [{ cls: 'dead', text: '心魔翻涌，无人护持，你的道体自内而外崩解。' }];
}

function cnNum(n: number): string {
  const names = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
  return names[n - 1] ?? String(n);
}
