import { describe, expect, it } from 'vitest';
import * as engine from '../../src/engine';

describe('脚手架自检', () => {
  it('测试侧能解析 engine barrel', () => {
    expect(engine).toBeTypeOf('object');
  });
});
