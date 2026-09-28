/**
 * 存档 fixture 生成器（验收 6.4）。**fixture 必须是真实迁移产物，不许手写。**
 *
 * 用法：把上一个版本的 fixture 逐级跑到目标版本，落盘为新 fixture：
 *   npx tsx tools/gen-fixture.ts 6
 *
 * 迁移链本身在 `tests/engine/migrations.test.ts` 里被重跑一遍并比对校验和，
 * 所以这里生成的产物必须与 `MIGRATIONS` 的输出逐字节一致。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { checksumOf, MIGRATIONS, type SaveEnvelope } from '../src/store/persistence';

const target = Number(process.argv[2]);
if (!Number.isInteger(target) || target < 2) {
  console.error('用法：npx tsx tools/gen-fixture.ts <目标版本号>');
  process.exit(1);
}

const path = (v: number): string => resolve(process.cwd(), `tests/fixtures/save-v${v}.json`);

let cursor = JSON.parse(readFileSync(path(1), 'utf8')) as SaveEnvelope;
for (let v = 1; v < target; v++) {
  // 必须走**单步**：用 `migrate` 会一路跑到 CURRENT_VERSION，产出的版本号对不上
  const step = MIGRATIONS[cursor.v];
  if (!step) throw new Error(`no migration from v${cursor.v}`);
  cursor = step(cursor) as SaveEnvelope;
}

const out = { ...cursor, v: target, checksum: checksumOf(cursor.meta, cursor.run) };
writeFileSync(path(target), `${JSON.stringify(out, null, 2)}\n`, 'utf8');
console.log(`save-v${target}.json 已生成：run=${out.run ? '有' : '无'} checksum=${out.checksum}`);
