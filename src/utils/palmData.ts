/**
 * 掌纹学知识库
 * 综合西方手相学经典（Benham/Cheiro/Gettings）与中国传统相学（麻衣神相/柳庄神相/玉管照神局）
 */

// 线路类型
export type LineType = 'life' | 'head' | 'heart' | 'fate' | 'sun' | 'marriage'

// 线路属性维度
export interface LineAttributes {
  depth: number       // 深浅 1-5
  length: number      // 长短 1-5
  curvature: number   // 曲直 1-5 (1=直, 5=弯)
  clarity: number     // 清晰度 1-5
  continuity: number  // 连续性 1-5 (1=多断, 5=无断)
  markings: string[]  // 记号列表
}

// 掌纹解读结果
export interface LineReading {
  type: LineType
  name: string
  icon: string
  title: string
  desc: string
  score: number
  attributes: LineAttributes
}

// 综合运势结果
export interface PalmReadingResult {
  lines: LineReading[]
  overallScore: number
  fortuneLevel: string
  fortuneDesc: string
  career: string
  love: string
  health: string
  wealth: string
  summary: string
  date: string
}

// 运势评级
export const fortuneLevels = [
  { min: 90, level: '大吉大利 ✨', desc: '鸿运当头，万事顺遂，天时地利人和皆备！' },
  { min: 80, level: '吉星高照 🌟', desc: '运势上佳，贵人相助，宜把握机遇大胆前行。' },
  { min: 70, level: '福星临门 🍀', desc: '运势良好，稳中有进，脚踏实地必有收获。' },
  { min: 60, level: '平稳安康 🌿', desc: '运势平稳，无大起落，蓄势待发静待花开。' },
  { min: 50, level: '蓄势待发 🌱', desc: '韬光养晦，积攒能量，转机就在不远处。' },
  { min: 0, level: '逆流而上 💪', desc: '虽有挑战，但磨砺使人成长，坚持必有转机。' },
]

// 线路名称与图标
export const lineMeta: Record<LineType, { name: string; icon: string; weight: number }> = {
  life:     { name: '生命线', icon: '💪', weight: 0.25 },
  head:     { name: '智慧线', icon: '🧠', weight: 0.25 },
  heart:    { name: '感情线', icon: '❤️', weight: 0.25 },
  fate:     { name: '命运线', icon: '🌟', weight: 0.10 },
  sun:      { name: '太阳线', icon: '☀️', weight: 0.10 },
  marriage: { name: '婚姻线', icon: '💍', weight: 0.05 },
}

// 生命线解读规则
export const lifeLineReadings = [
  { condition: (a: LineAttributes) => a.depth >= 4 && a.length >= 4 && a.continuity >= 4,
    title: '生命线 · 深长清晰',
    desc: '你的生命线深长清晰、弧度优美，这是健康长寿的象征。你天生体魄强健，精力充沛，拥有旺盛的生命力。即使偶有小恙，也能迅速恢复。人生旅途中，你将始终保持蓬勃朝气。',
    score: 92 },
  { condition: (a: LineAttributes) => a.length >= 3 && a.continuity >= 3,
    title: '生命线 · 中等长直',
    desc: '你的生命线长度适中、纹路清晰，健康状况整体平稳。你懂得劳逸结合，生活节奏把握得当。注意规律作息、适当运动，福气自然绵长。中年后注意心血管保养即可。',
    score: 75 },
  { condition: (a: LineAttributes) => a.length <= 2,
    title: '生命线 · 短而精悍',
    desc: '你的生命线较短，提醒你要多关注身体信号。但不必忧虑——许多长寿者生命线也短。掌纹会随生活改变而变化，通过适当运动、均衡饮食可以增强体质。注重养生，寿元不减。',
    score: 62 },
  { condition: (a: LineAttributes) => a.continuity <= 2,
    title: '生命线 · 有断裂',
    desc: '你的生命线出现断裂，传统手相学认为这代表人生某个阶段会有重大健康转变或生活变故。断裂后纹路重新出现，说明你能度过难关，迎来新生。建议定期体检，关注健康。',
    score: 58 },
]

// 智慧线解读规则
export const headLineReadings = [
  { condition: (a: LineAttributes) => a.curvature >= 4 && a.depth >= 4,
    title: '智慧线 · 深弯长伸',
    desc: '你的智慧线长而深刻，向下弯曲延伸至月丘，这是极高的智慧与创造力象征。你思维缜密，想象力丰富，善于深度思考。在文学、艺术、科研等领域大有可为。天生的智者和创造者。',
    score: 93 },
  { condition: (a: LineAttributes) => a.curvature <= 2 && a.depth >= 3,
    title: '智慧线 · 平直清晰',
    desc: '你的智慧线平直清晰，思维务实理性，擅长逻辑分析。你做事有条理，判断力强，是值得信赖的实干家。在商界、工程、管理领域大有作为。理性是你的最大优势。',
    score: 85 },
  { condition: (a: LineAttributes) => a.curvature >= 3,
    title: '智慧线 · 微弯下伸',
    desc: '你的智慧线微微向下弯曲，兼具理性与感性。你既有逻辑分析能力，又不乏创意灵感。适应力强，能在多种领域游刃有余。理想止于无名指与小指之间，走向均衡圆满。',
    score: 80 },
  { condition: (a: LineAttributes) => a.length <= 2,
    title: '智慧线 · 短而集中',
    desc: '你的智慧线较短，思维偏向集中务实。你不喜欢好高骛远，专注眼前事务，执行力强。虽不善长抽象思辨，但在具体实操领域表现出色。建议多拓展视野，弥补广度不足。',
    score: 68 },
]

// 感情线解读规则
export const heartLineReadings = [
  { condition: (a: LineAttributes) => a.length >= 4 && a.curvature >= 3,
    title: '感情线 · 长且上翘',
    desc: '你的感情线长且末端上翘至木星丘，感情丰富而真挚。你重情重义，待人温暖，容易收获美好姻缘。桃花旺盛，魅力四射。注意甄别真心人，终遇良缘。婚姻美满，家庭幸福。',
    score: 90 },
  { condition: (a: LineAttributes) => a.curvature <= 2,
    title: '感情线 · 平直清晰',
    desc: '你的感情线平直清晰，感情观成熟稳定。你对待感情忠诚专一，不轻易动心但一旦投入便全心全意。分析型对待爱情，重忠诚可靠胜于浪漫激情。是值得托付终身的人。',
    score: 82 },
  { condition: (a: LineAttributes) => a.continuity <= 2,
    title: '感情线 · 波浪起伏',
    desc: '你的感情线呈波浪状或有断裂，情感经历较为丰富曲折。你感性多情，感情路上有惊喜也有波折。学会平和心态，理性对待感情，终会遇到对的人。每一次经历都是成长。',
    score: 68 },
  { condition: (a: LineAttributes) => a.length <= 2,
    title: '感情线 · 短而内敛',
    desc: '你的感情线较短，情感表达偏内敛含蓄。你不善言辞但内心深情，需要时间建立信任。一旦认定便长久专一。建议多表达感受，让爱人了解你的心意。慢热型也有慢热的幸福。',
    score: 70 },
]

// 命运线解读规则
export const fateLineReadings = [
  { condition: (a: LineAttributes) => a.depth >= 3 && a.continuity >= 3,
    title: '命运线 · 深直贯穿',
    desc: '你的命运线深直贯穿手掌中央，这是事业有成的象征。你自幼便有明确方向感，人生目标清晰，贯彻始终必获成功。生活安定，发展顺利。中年后事业将达到高峰，名利双收。',
    score: 88 },
  { condition: (a: LineAttributes) => a.depth >= 2,
    title: '命运线 · 清晰可辨',
    desc: '你的命运线清晰可见，说明你有自己的人生方向。虽偶有迷茫，但总能找到正轨。事业稳步发展，生活安定。三十岁后方向更加明确，逐步实现人生理想。',
    score: 75 },
  { condition: (a: LineAttributes) => a.continuity <= 2,
    title: '命运线 · 断续起伏',
    desc: '你的命运线断续起伏，人生方向经历过多次调整。这不一定是坏事——说明你勇于尝试、不墨守成规。职场可能有变动，但每次转变都带来新的成长。人生精彩丰富。',
    score: 65 },
  { condition: () => true,
    title: '命运线 · 隐约或缺失',
    desc: '你的命运线隐约或缺失，这在手相学中并非负面。说明你是自我定向型人才，不依赖命运安排，靠自身选择创造道路。企业家型或非传统人格多见此相。自力更生，前途无量。',
    score: 72 },
]

// 太阳线解读规则
export const sunLineReadings = [
  { condition: (a: LineAttributes) => a.depth >= 3,
    title: '太阳线 · 明朗深刻',
    desc: '你的太阳线明朗深刻，这是名利双收的象征。你在事业上不仅能获得方向（命运线），还能获得满足感和公众认可。创造力丰富，工作中常有成就感。中年以后声名渐起。',
    score: 87 },
  { condition: () => true,
    title: '太阳线 · 隐约未见',
    desc: '你的太阳线不明显或缺失，这不代表不成功——只是你的满足感更多来自内在而非外界认可。你可能在不被大众瞩目的领域默默耕耘，收获属于自己的成就感。知足常乐，亦是福气。',
    score: 70 },
]

// 婚姻线解读规则
export const marriageLineReadings = [
  { condition: (a: LineAttributes) => a.clarity >= 3,
    title: '婚姻线 · 清晰深长',
    desc: '你的婚姻线清晰深长，预示你能找到理想伴侣，婚姻幸福和谐。你对待感情认真负责，值得被爱。左右手都有清晰婚姻线者，婚姻一定美满。珍惜眼前人，幸福绵长。',
    score: 85 },
  { condition: () => true,
    title: '婚姻线 · 短浅模糊',
    desc: '你的婚姻线较短或模糊，感情路可能需要多一些耐心。不急不躁，缘分到了自然水到渠成。提升自我、扩大社交圈，增加遇见对的人的机会。婚姻不急，幸福不晚。',
    score: 68 },
]

// 所有线路解读规则
export const allLineReadings: Record<LineType, typeof lifeLineReadings> = {
  life: lifeLineReadings,
  head: headLineReadings,
  heart: heartLineReadings,
  fate: fateLineReadings,
  sun: sunLineReadings,
  marriage: marriageLineReadings,
}

// 记号解读
export const markingMeanings: Record<string, string> = {
  island: '岛纹 · 困境期',
  break: '断裂 · 转变点',
  chain: '锁链 · 焦虑期',
  fork: '分叉 · 多元化',
  star: '星纹 · 突破点',
  cross: '十字 · 转折点',
  square: '方格 · 保护力',
  triangle: '三角 · 才能显',
}

// 获取运势评级
export function getFortuneLevel(score: number) {
  return fortuneLevels.find(f => score >= f.min) || fortuneLevels[fortuneLevels.length - 1]
}

// 根据属性匹配解读
export function matchReading(type: LineType, attrs: LineAttributes): { title: string; desc: string; score: number } {
  const rules = allLineReadings[type]
  for (const rule of rules) {
    if (rule.condition(attrs)) {
      return { title: rule.title, desc: rule.desc, score: rule.score }
    }
  }
  // 默认返回最后一条
  const last = rules[rules.length - 1]
  return { title: last.title, desc: last.desc, score: last.score }
}

// 计算单线评分（基于五维属性）
export function calcLineScore(attrs: LineAttributes): number {
  const base = (attrs.depth * 20 + attrs.clarity * 15 + attrs.continuity * 15 + attrs.length * 10 + attrs.curvature * 5) / 65 * 100
  // 记号修正
  let modifier = 0
  attrs.markings.forEach(m => {
    if (m === 'star' || m === 'square' || m === 'triangle') modifier += 3
    if (m === 'island' || m === 'break' || m === 'chain') modifier -= 5
  })
  return Math.max(40, Math.min(98, Math.round(base + modifier)))
}
