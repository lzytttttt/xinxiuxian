import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { crossTierDuplicates, generateNames, tierCounts } from '../src/content/names/compose';

const OUT = 'src/content/generated/names.json';
const check = process.argv.includes('--check');

const tables = generateNames();
const serialized = `${JSON.stringify(tables, null, 2)}\n`;

const dups = crossTierDuplicates(tables);
if (dups.length > 0) {
  console.error(`gen-names: 跨档重复 ${dups.length} 条，例：${dups.slice(0, 5).join('、')}`);
  process.exitCode = 1;
}

const encMin = Math.min(...tierCounts(tables, 'encounter'));
const artMin = Math.min(...tierCounts(tables, 'artifact'));
if (encMin < 120 || artMin < 120) {
  console.error(`gen-names: 档内条数不足（机缘最少 ${encMin}、法宝最少 ${artMin}，要求 ≥120）`);
  process.exitCode = 1;
}

if (check) {
  if (!existsSync(OUT)) {
    console.error(`gen-names: 缺少产物 ${OUT}，先运行 npx tsx tools/gen-names.ts`);
    process.exitCode = 1;
  } else {
    const current = readFileSync(OUT, 'utf8');
    if (current !== serialized) {
      console.error(`gen-names: 产物与词池不一致（${OUT}）——运行 npx tsx tools/gen-names.ts 重新生成`);
      process.exitCode = 1;
    } else {
      console.log(`gen-names: 产物一致（机缘每档 ≥${encMin}、法宝每档 ≥${artMin}，跨档零重复）`);
    }
  }
} else {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, serialized, 'utf8');
  console.log(`gen-names: 已写入 ${OUT}（机缘每档 ≥${encMin}、法宝每档 ≥${artMin}）`);
}
