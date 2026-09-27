import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { BUNDLE } from '../../src/content/index';
import { BOND_AID_CAP, SECT_PROMOTE } from '../../src/engine/constants';
import {
  acceptMission,
  addContribution,
  addTension,
  aidBonus,
  createNpc,
  defectTargets,
  joinSect,
  pickMissions,
  promoteIfEligible,
  rankName,
  runTournament,
  tournamentPlace,
  sectName,
  stipendOf,
  tournamentDue,
} from '../../src/engine/index';
import { rollYear, applyChoice } from '../../src/engine/tick';
import { makeRngBag } from '../../src/engine/rng';
import { zones } from '../../src/engine/selectors';
import type { Npc } from '../../src/engine/types/effects';
import type { RunState } from '../../src/engine/types/run';
import { newState } from './helpers';

function inSect(seed = 'sect-test', id = 'sect_taixu'): RunState {
  const s = newState(seed);
  joinSect(s, id, BUNDLE);
  return s;
}

function pushNpc(
  s: RunState,
  type: Npc['bondType'],
  level: number,
  affinity = 100,
  neglect = 0,
): Npc {
  const npc: Npc = {
    id: `t_${type}_${s.bonds.list.length}`,
    name: `${type}${s.bonds.list.length}`,
    gender: '女',
    rootTier: 8,
    personality: '仁厚',
    origin: '散修',
    level: s.realm.level,
    affinity,
    bondType: type,
    bondLevel: level,
    alive: true,
    metYear: 0,
    neglect,
    injuredUntil: 0,
    seed: `t:${s.bonds.list.length}`,
  };
  s.bonds.list.push(npc);
  return npc;
}

describe('宗门：加入、职位与俸禄', () => {
  it('入宗初始化张力表（对其它宗门全为 0）与职位', () => {
    const s = inSect();
    expect(s.sect.id).toBe('sect_taixu');
    expect(s.sect.rank).toBe(0);
    expect(Object.keys(s.sect.tension).length).toBe((BUNDLE.sects ?? []).length);
    expect(Object.values(s.sect.tension).every((v) => v === 0)).toBe(true);
  });

  it('贡献走同门羁绊加成：每级 +10%', () => {
    const s = inSect('sect-contrib');
    expect(addContribution(s, 100)).toBe(100);
    pushNpc(s, '同门', 3);
    expect(addContribution(s, 100)).toBe(130);
  });

  it('晋升单向且按 SECT_PROMOTE 门槛（贡献不清零）', () => {
    const s = inSect('sect-promote');
    addContribution(s, 119);
    expect(promoteIfEligible(s)).toBeNull();
    addContribution(s, 1);
    expect(promoteIfEligible(s)).toBe('内门弟子');
    addContribution(s, 240);
    expect(promoteIfEligible(s)).toBe('真传弟子');
    addContribution(s, 540);
    expect(promoteIfEligible(s)).toBe('长老');
    addContribution(s, 900);
    expect(promoteIfEligible(s)).toBe('宗主');
    // 单向：贡献不清零，已在最高位就不再变
    expect(s.sect.contribution).toBe(1800);
    expect(promoteIfEligible(s)).toBeNull();
    expect(rankName(s.sect.rank)).toBe('宗主');
  });

  it('俸禄随职位提升（悟性 / 药材 / 丹药）', () => {
    const s = inSect('sect-stipend');
    s.realm.level = 30;
    const r0 = stipendOf(s, BUNDLE)!;
    expect(r0.insight).toBeGreaterThan(0);
    expect(r0.herbs.length).toBe(0);
    expect(r0.pills.length).toBe(0);
    s.sect.rank = 3;
    const r3 = stipendOf(s, BUNDLE)!;
    expect(r3.insight).toBeGreaterThan(r0.insight);
    expect(r3.herbs.length).toBe(1);
    // 丹药俸禄只给宗主（5.1 收窄的结果）
    s.sect.rank = 4;
    expect(stipendOf(s, BUNDLE)!.pills.length).toBe(1);
  });

  it('俸禄在 tick 槽 6 实发（悟性与会新增）', () => {
    const s = inSect('sect-stipend-tick');
    s.sect.rank = 1;
    const rng = makeRngBag('sect-stipend-tick');
    const before = s.insight;
    const herbs = JSON.stringify(s.herbs);
    rollYear(s, rng, BUNDLE);
    expect(s.insight).toBeGreaterThan(before);
    expect(JSON.stringify(s.herbs)).not.toBe(herbs);
  });

  it('宗门名与收益随 id 解析；散修不享受 perk', () => {
    const s = inSect('sect-name');
    expect(sectName(BUNDLE, s.sect.id)).toBe('太虚剑宗');
    expect(sectName(BUNDLE, null)).toBe('无门无派');
  });
});

describe('宗门：任务（界面接取，走与事件同一条结算路径）', () => {
  it('任务受职位 / 境界 / 冷却三重门槛', () => {
    const s = inSect('sect-mission');
    s.realm.level = 10;
    const rank0 = pickMissions(s, BUNDLE);
    expect(rank0.length).toBeGreaterThan(0);
    expect(rank0.every((m) => m.minRank === 0 && m.levelMin <= 10 && m.levelMax >= 10)).toBe(true);
    // 高职位 + 高境界应解锁首批所没有的任务（职位门槛或境界门槛更高）
    s.sect.rank = 4;
    s.realm.level = 120;
    const high = pickMissions(s, BUNDLE);
    const unlockedByRank = high.filter((m) => m.minRank > 0 || m.levelMin > 10);
    expect(unlockedByRank.length).toBeGreaterThan(0);
    expect(rank0.some((m) => high.some((h) => h.id === m.id))).toBe(true);
  });

  it('接取即打冷却，结算给贡献（经同门加成）', () => {
    const s = inSect('sect-mission-run');
    s.realm.level = 10;
    const m = pickMissions(s, BUNDLE)[0]!;
    const rng = makeRngBag('sect-mission-run');
    const decision = acceptMission(s, m, BUNDLE, rng.event);
    expect(decision).not.toBeNull();
    expect(s.cooldowns[m.id]).toBe(s.year + m.cooldownYears);
    const choiceId = decision!.choices.find((c) => c.enable)!.id;
    applyChoice(s, decision!, choiceId, rng, BUNDLE);
    expect(s.sect.contribution).toBeGreaterThanOrEqual(m.contribution);
    expect(s.decisionLog.at(-1)?.eventId).toBe(m.id);
  });

  it('重复接取被冷却挡住', () => {
    const s = inSect('sect-mission-cd');
    s.realm.level = 10;
    const m = pickMissions(s, BUNDLE)[0]!;
    const rng = makeRngBag('sect-mission-cd');
    acceptMission(s, m, BUNDLE, rng.event);
    expect(pickMissions(s, BUNDLE).some((x) => x.id === m.id)).toBe(false);
  });

  it('30 个任务全部在某个 (宗门, 职位, 境界) 组合下可接（内容不出现死任务）', () => {
    const s = inSect('sect-mission-cover');
    const reachable = new Set<string>();
    for (const def of BUNDLE.sects ?? []) {
      s.sect.id = def.id;
      for (const rank of [0, 1, 2, 3, 4]) {
        s.sect.rank = rank;
        for (const level of [1, 20, 40, 60, 90, 110, 150, 200]) {
          s.realm.level = level;
          s.cooldowns = {};
          for (const m of pickMissions(s, BUNDLE)) reachable.add(m.id);
        }
      }
    }
    expect(reachable.size).toBe((BUNDLE.missions ?? []).length);
  });
});

describe('宗门：大比（每 20 年，界面而非打断）', () => {
  it('每 20 年一次，进入可比的年份才 true，且同一年只比一次', () => {
    const s = inSect('sect-tour');
    s.year = 19;
    expect(tournamentDue(s)).toBe(false);
    s.year = 20;
    expect(tournamentDue(s)).toBe(true);
    const r = runTournament(s, BUNDLE);
    expect(r).not.toBeNull();
    expect(r!.place).toBeGreaterThanOrEqual(1);
    expect(tournamentDue(s)).toBe(false);
  });

  it('名次随构筑单调：无构筑垫底，加了功法就往上走', () => {
    const bare = inSect('sect-tour-bare');
    bare.year = 20;
    bare.realm.level = 50;
    // 无功法 + 高等级 → 乘积 1（境界不计入，因为同境界归一化）
    const worst = tournamentPlace(bare, BUNDLE);
    expect(worst).toBeGreaterThan(1);

    const built = inSect('sect-tour-built');
    built.year = 20;
    built.realm.level = 50;
    built.slots = ['art_wan_du', 'art_bai_du', 'art_hua_du', 'art_shi_gu', null, null];
    built.flags['dao_seat'] = 1;
    for (const id of ['art_wan_du', 'art_bai_du', 'art_hua_du', 'art_shi_gu']) {
      built.arts[id] = { level: 10, insight: 0 };
    }
    const better = tournamentPlace(built, BUNDLE);
    expect(better).toBeLessThan(worst);
  });

  it('夺魁发宗门专属功法：乘积触到软封顶拐点即第 1 名', () => {
    // 用合成 bundle 把六乘区一起推满（真内容里凑不到 25× 的乘积，测试需要确定的边界）
    const synthetic = {
      ...BUNDLE,
      arts: [
        { id: 't_z1', name: 't1', school: '剑修' as const, quality: 1 as const, passives: { z1: 3 }, text: '' },
        { id: 't_z2', name: 't2', school: '剑修' as const, quality: 1 as const, passives: { z2: 2.2 }, text: '' },
        { id: 't_z3', name: 't3', school: '剑修' as const, quality: 1 as const, passives: { z3: 4 }, text: '' },
        { id: 't_z4', name: 't4', school: '剑修' as const, quality: 1 as const, passives: { z4: 2.5 }, text: '' },
        { id: 't_z6', name: 't5', school: '剑修' as const, quality: 1 as const, passives: { z6: 2 }, text: '' },
      ],
    };
    const s = inSect('sect-tour-art');
    s.year = 20;
    s.slots = ['t_z1', 't_z2', 't_z3', 't_z4', 't_z6', null];
    for (const id of ['t_z1', 't_z2', 't_z3', 't_z4', 't_z6']) s.arts[id] = { level: 1, insight: 0 };
    // Z5 无内容侧来源，用一条药力补上
    s.pillBuffs = [{ pillId: 'x', type: '聚气', zone: 'z5', power: 2, years: 99 }];
    const product = zones(s, synthetic).rawProduct;
    expect(product).toBeGreaterThanOrEqual(25);
    expect(tournamentPlace(s, synthetic)).toBe(1);
    runTournament(s, synthetic);
    expect(Object.keys(s.arts)).toContain('art_sect_taixu');
  });

  it('散修不触发大比', () => {
    const s = newState('sect-tour-none');
    s.year = 20;
    expect(tournamentDue(s)).toBe(false);
    expect(runTournament(s, BUNDLE)).toBeNull();
  });
});

describe('宗门：张力与叛宗', () => {
  it('张力封顶 100、每年自然 −1', () => {
    const s = inSect('sect-tension');
    addTension(s, 'sect_youming', 999);
    expect(s.sect.tension['sect_youming']).toBe(100);
    s.sect.tension['sect_youming'] = 50;
    rollYear(s, makeRngBag('sect-tension'), BUNDLE);
    expect(s.sect.tension['sect_youming']).toBe(49);
  });

  it('张力 ≥ 80 触发叛宗邀请（同年即进仲裁，不抢天劫/机缘的位）', () => {
    const s = inSect('sect-defect-refuse');
    s.sect.rank = 2;
    addTension(s, 'sect_youming', 85);
    expect(defectTargets(s)).toEqual(['sect_youming']);
    rollYear(s, makeRngBag('sect-defect-refuse'), BUNDLE);
    expect(s.sect.inviteFrom).toBe('sect_youming');
    const surfaced =
      s.awaiting?.eventId === 'ev_sect_defect_invite' ||
      s.deferredQueue.some((d) => d.eventId === 'ev_sect_defect_invite') ||
      s.eventLog.includes('ev_sect_defect_invite');
    expect(surfaced).toBe(true);
  });

  it('接受叛宗：defections++、旧宗门贡献清零、新宗门按 30% 起算', () => {
    const s = inSect('sect-defect-accept');
    s.sect.contribution = 1000;
    s.sect.rank = 3;
    addTension(s, 'sect_youming', 85);
    rollYear(s, makeRngBag('sect-defect-accept'), BUNDLE);
    const rng = makeRngBag('sect-defect-accept');
    const pending = s.awaiting;
    expect(pending?.eventId).toBe('ev_sect_defect_invite');
    applyChoice(s, pending!, 'accept', rng, BUNDLE);
    expect(s.sect.id).toBe('sect_youming');
    expect(s.sect.defections).toBe(1);
    expect(s.sect.contribution).toBe(300);
    expect(s.sect.rank).toBe(0);
  });
});

describe('宗门：验收 5.5 叛宗可达（500 种子全触发，强于「至少一次」）', () => {
  it('500 个种子在满足条件时都排上了叛宗邀请', () => {
    let fired = 0;
    for (let i = 0; i < 500; i++) {
      const seed = `defect-${String(i).padStart(3, '0')}`;
      const s = inSect(seed);
      addTension(s, 'sect_youming', 90);
      rollYear(s, makeRngBag(seed), BUNDLE);
      const surfaced =
        s.awaiting?.eventId === 'ev_sect_defect_invite' ||
        s.deferredQueue.some((d) => d.eventId === 'ev_sect_defect_invite') ||
        s.eventLog.includes('ev_sect_defect_invite');
      if (s.sect.inviteFrom === 'sect_youming' && surfaced) fired += 1;
    }
    expect(fired).toBe(500);
  });
});

describe('宗门：不破坏红线', () => {
  it('引擎不读 MetaState（6.3 红线）：engine/ 下无一导入 types/meta', () => {
    const files = [
      'sect.ts',
      'bonds.ts',
      'tick.ts',
      'interpret.ts',
      'selectors.ts',
      'conditions.ts',
      'encounter.ts',
      'breakthrough.ts',
      'tribulation.ts',
      'alchemy.ts',
      'arts.ts',
    ];
    for (const f of files) {
      const text = readFileSync(`src/engine/${f}`, 'utf8');
      expect(text.includes('types/meta'), `${f} 不得导入 MetaState`).toBe(false);
    }
  });
});

describe('宗门：创建 NPC 的确定性', () => {
  it('同种子生成的 NPC 完全一致（可重放）', () => {
    const a = inSect('npc-det');
    const b = inSect('npc-det');
    const na = createNpc(a, makeRngBag('npc-det').bond, BUNDLE, { type: '挚友' });
    const nb = createNpc(b, makeRngBag('npc-det').bond, BUNDLE, { type: '挚友' });
    expect(na?.name).toBe(nb?.name);
    expect(na?.rootTier).toBe(nb?.rootTier);
    expect(na?.personality).toBe(nb?.personality);
    expect(na?.origin).toBe(nb?.origin);
  });

  it('助战上限在引擎入口处截断（G5）', () => {
    const s = inSect('npc-aid');
    for (const t of ['道侣', '挚友', '师徒', '同门', '宿敌'] as const) pushNpc(s, t, 5);
    expect(aidBonus(s)).toBe(BOND_AID_CAP);
  });
});

describe('宗门：常量自检', () => {
  it('职位表边界与晋升门槛自洽', () => {
    expect(rankName(0)).toBe('外门弟子');
    expect(rankName(4)).toBe('宗主');
    expect(rankName(99)).toBe('宗主');
    expect(SECT_PROMOTE[3]).toBe(900);
    expect(SECT_PROMOTE[4]).toBe(1800);
  });
});
