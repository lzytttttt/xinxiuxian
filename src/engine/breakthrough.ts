import {
  CHAIN_MULT,
  GATE_PENALTY,
  IMM_GATE_CULT_MULT,
  IMM_GATE_PASS,
  IMM_GATE_PASS_MAX,
  IMM_GATE_PASS_MIN,
  IMM_GATE_RATIO_EXP,
  IMM_GATE_RATIO_HI,
  IMM_GATE_RATIO_LO,
  IMM_GATE_REQ,
  IMM_CHAIN_MULT,
  LIFESPAN_GAIN,
  MAX_LEVEL_CULT_HI,
  MAX_LEVEL_CULT_IMMORTAL_MULT,
  MAX_LEVEL_CULT_LO,
  REALM_MAX_IMMORTAL,
  REALM_MAX_MORTAL,
  STAGE_ENTER,
  STAGE_PEAK,
} from './constants';
import {
  ageCoef,
  breakChance,
  combatCoef,
  localLevel,
  localStage,
  realmName,
  talentMult,
  talentTier,
} from './selectors';
import { thunderBreakMult, thunderFailLoss } from './arts';
import type { ContentBundle } from './types/effects';
import type { LogLine } from './types/log';
import type { RngBag } from './types/rng';
import type { RunState } from './types/run';

function peakIndex(level: number): number {
  const stage = localStage(level);
  return level > REALM_MAX_MORTAL ? stage + 9 : stage - 1;
}

function gainCultivation(s: RunState, rng: RngBag): number {
  const tier = talentTier(s.root);
  const coef = combatCoef(tier, s.realm.arc);
  const local = localLevel(s);
  let raw: number;
  if (local >= 100) {
    raw = coef * (local * 1.2 + rng.break.int(-200, 200) + 200);
  } else if (local >= 90) {
    raw = coef * (local * 0.6 + rng.break.int(-Math.round(local * 0.4), Math.round(local * 0.4)) + 20);
  } else {
    raw = coef * (local * 0.6 + rng.break.int(-Math.round(local * 0.4), Math.round(local * 0.4)) + 6);
  }
  return raw * talentMult(s.root);
}

function levelUp(s: RunState, rng: RngBag, logs: LogLine[], chained: boolean): void {
  s.realm.level += 1;
  s.cultivation += gainCultivation(s, rng);
  const gain = LIFESPAN_GAIN.reduce((acc, [at, v]) => (s.realm.level >= at ? v : acc), 0);
  if (gain > 0) s.simPoints += gain;
  s.stats.breakthroughs += 1;
  s.brokeThisYear = true;
  logs.push({
    cls: 'brk',
    text: chained
      ? `接连突破！你一路冲至${realmName(s.realm.level)}。`
      : `瓶颈应声而破，你踏入${realmName(s.realm.level)}。`,
    fx: 'levelup',
  });
}

function pinnacleUp(s: RunState, rng: RngBag, logs: LogLine[]): void {
  const idx = peakIndex(s.realm.level);
  s.pinnacleThisYear = true;
  if (s.realm.arc === 'mortal') {
    const peak = STAGE_PEAK[idx] ?? '';
    const enter = STAGE_ENTER[idx] ?? '';
    s.realm.level += 1;
    logs.push({ cls: 'huan', text: `${peak}。${enter}。` });
    return;
  }
  const stage = localStage(s.realm.level);
  const req = (IMM_GATE_REQ[stage - 2] ?? 0) * s.tribulationReqMult;
  const base = IMM_GATE_PASS[stage - 2] ?? 0.5;
  const ratio = Math.min(IMM_GATE_RATIO_HI, Math.max(IMM_GATE_RATIO_LO, cultivPower(s) / (req || 1)));
  const pass = Math.min(IMM_GATE_PASS_MAX, Math.max(IMM_GATE_PASS_MIN, base * Math.pow(ratio, IMM_GATE_RATIO_EXP)));
  if (rng.tribulation.chance(pass)) {
    s.cultivation *= IMM_GATE_CULT_MULT;
    s.realm.level += 1;
    logs.push({
      cls: 'rainbow',
      text: `仙劫降临，你周身仙力凝而不散，劫云四散而去。${realmName(s.realm.level)}！`,
    });
  } else {
    s.dead = true;
    s.endedReason = 'gateFail';
    logs.push({ cls: 'dead', text: '仙劫之下，仙躯寸寸崩解，道消身陨。' });
  }
}

function cultivPower(s: RunState): number {
  return s.cultivation * (1 + s.root / 500);
}

export function attemptBreak(s: RunState, rng: RngBag, c: ContentBundle): LogLine[] {
  const logs: LogLine[] = [];
  const max = s.realm.arc === 'immortal' ? REALM_MAX_IMMORTAL : REALM_MAX_MORTAL;
  const tier = talentTier(s.root);
  const gate = s.realm.level % 10 === 9 ? GATE_PENALTY : 1;
  const age = ageCoef(s);
  const talent = talentMult(s.root);
  const thunder = thunderBreakMult(s, c);

  if (s.realm.level < max && s.realm.level % 10 !== 0) {
    const table = breakChance(tier, localLevel(s), s.realm.arc);
    const base = table / 100 * age * gate * talent * s.breakthroughMult * thunder;
    if (base <= 0.25) {
      if (rng.break.chance(base)) levelUp(s, rng, logs, false);
    } else {
      let step = 0;
      const chainMult = s.realm.arc === 'immortal' ? IMM_CHAIN_MULT : 1;
      for (;;) {
        const p =
          (breakChance(tier, localLevel(s), s.realm.arc) / 100) *
          age *
          (s.realm.level % 10 === 9 ? GATE_PENALTY : 1) *
          talent *
          s.breakthroughMult *
          thunder *
          Math.pow(CHAIN_MULT, step) *
          chainMult;
        if (p <= 0.25 || s.realm.level >= max || s.realm.level % 10 === 0) break;
        if (!rng.break.chance(p)) break;
        levelUp(s, rng, logs, step > 0);
        step += 1;
      }
    }
  }

  while (s.realm.level % 10 === 0 && s.realm.level < max && !s.dead) {
    pinnacleUp(s, rng, logs);
  }

  if (!s.brokeThisYear && !s.dead) {
    const loss = thunderFailLoss(s, c);
    if (loss > 0) {
      s.cultivation = Math.max(0, s.cultivation * (1 - loss));
      logs.push({ cls: 'red', text: '雷气反噬，经脉受损，修为略有倒退。' });
    }
    if (s.realm.level >= max) {
      const coef = combatCoef(tier, s.realm.arc);
      const mult = s.realm.arc === 'immortal' ? MAX_LEVEL_CULT_IMMORTAL_MULT : 1;
      const lo = rng.break.int(MAX_LEVEL_CULT_LO, MAX_LEVEL_CULT_HI);
      s.cultivation += lo * coef * mult;
      logs.push({ cls: 'year', text: '你已至圆满，唯余苦修。' });
    } else {
      const rate = 0.0005 + rng.break.next() * 0.0005;
      const floor = rng.break.int(1 + tier, 5 + tier);
      s.cultivation += Math.max(s.cultivation * rate, floor);
      logs.push({ cls: 'year', text: '闭关静修，修为微增。' });
    }
  }
  return logs;
}
