import { defineFate } from '../engine/registry';
import { midFateValue } from '../engine/fate';
import type { Fate, FateAttr, FateColor } from '../engine/types/effects';

function fate(
  id: string,
  name: string,
  attr: FateAttr,
  color: FateColor,
  text: string,
): Fate {
  return defineFate({ id, name, attr, color, value: midFateValue(attr, color), text });
}

export const FATES: Fate[] = [
  fate('fate_root_green', '草叶相安', 'root', 'green', '草木之气亲近你，修行时总有微光聚在身侧。'),
  fate('fate_root_blue', '灵窍自开', 'root', 'blue', '你生来灵窍通透，吐纳之间灵气自来。'),
  fate('fate_root_purple', '骨相清奇', 'root', 'purple', '相者说你骨相清奇，是百年难遇的修行胚子。'),
  fate('fate_root_gold', '天授灵胎', 'root', 'gold', '你出生那夜星落如雨，天地亲授一副灵胎。'),

  fate('fate_luck_green', '小有福缘', 'luck', 'green', '你总能在山道边捡到些无主的小物件。'),
  fate('fate_luck_blue', '顺水行舟', 'luck', 'blue', '你做事总比旁人少些波折，仿佛有风在推着你。'),
  fate('fate_luck_purple', '逢凶化吉', 'luck', 'purple', '数次险死还生后，你信了那句"命不该绝"。'),
  fate('fate_luck_gold', '天命所钟', 'luck', 'gold', '你行走世间，仿佛连天地都不愿让你轻易陨落。'),

  fate('fate_xianqi_green', '晨露通灵', 'xianqi', 'green', '晨露沾衣时，你偶尔能嗅到一丝极淡的仙灵气息。'),
  fate('fate_xianqi_blue', '古井映月', 'xianqi', 'blue', '你曾在古井中看见一轮不属于此世的月。'),
  fate('fate_xianqi_purple', '仙缘早结', 'xianqi', 'purple', '幼时有道人路过，说你身上带着上界的印记。'),
  fate('fate_xianqi_gold', '与仙有约', 'xianqi', 'gold', '你梦见自己立于云海，有人在那里等了你很久。'),

  fate('fate_artifact_green', '识宝微光', 'artifact', 'green', '你摸过的旧物，偶尔会自行泛起一层薄光。'),
  fate('fate_artifact_blue', '古器相认', 'artifact', 'blue', '残破的法器到了你手中，总比在别处更听话。'),
  fate('fate_artifact_purple', '器灵亲近', 'artifact', 'purple', '你能听见兵器深处那声极轻的嗡鸣。'),
  fate('fate_artifact_gold', '万器归心', 'artifact', 'gold', '你尚未修身，便已有灵器在梦中自行朝拜。'),

  fate('fate_brk_green', '心静如水', 'brk', 'green', '你遇事不慌，冲关时杂念极少。'),
  fate('fate_brk_blue', '壁前有志', 'brk', 'blue', '你认准的事，撞了南墙也要撞出个洞来。'),
  fate('fate_brk_purple', '劫中悟道', 'brk', 'purple', '你在最难的那一夜，反而把一切都想通了。'),
  fate('fate_brk_gold', '命里该破', 'brk', 'gold', '你的瓶颈从来不像瓶颈，倒像一扇虚掩的门。'),

  fate('fate_trib_green', '雷雨不惊', 'trib', 'green', '你从小不怕雷声，雨夜反而睡得最沉。'),
  fate('fate_trib_blue', '心正不惧', 'trib', 'blue', '你自忖行事无愧，对上天的责问也坦荡。'),
  fate('fate_trib_purple', '以身为炉', 'trib', 'purple', '你愿以一身骨血为炉，把雷霆熬成自己的养分。'),
  fate('fate_trib_gold', '劫为汝设', 'trib', 'gold', '你隐隐觉得，那九重雷光本就是为了成全你才存在。'),
];
