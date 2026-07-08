// 掌纹解读数据

export interface LineReading {
  title: string
  desc: string
  score: number
}

export interface LineOption {
  value: string
  icon: string
  text: string
}

// 三大主线选项
export const lineOptions: Record<string, LineOption[]> = {
  life: [
    { value: 'long', icon: '📏', text: '长而清晰，弧度大' },
    { value: 'medium', icon: '✂️', text: '中等长度，弧度适中' },
    { value: 'short', icon: '🔻', text: '较短，靠近大拇指' },
  ],
  head: [
    { value: 'straight', icon: '➡️', text: '平直延伸' },
    { value: 'curved', icon: '🌊', text: '向下弯曲' },
    { value: 'long', icon: '🌀', text: '长而深刻' },
  ],
  heart: [
    { value: 'long', icon: '💕', text: '长且向上翘' },
    { value: 'wavy', icon: '〰️', text: '波浪起伏' },
    { value: 'straight', icon: '📏', text: '平直清晰' },
  ],
}

// 掌纹解读内容
export const palmReadings: Record<string, Record<string, LineReading>> = {
  life: {
    long: {
      title: '生命线 · 长而清晰',
      desc: '你的生命线长且弧度大，这是健康长寿的象征。你天生体魄强健，精力充沛，拥有旺盛的生命力。即使偶有小恙，也能迅速恢复。',
      score: 90,
    },
    medium: {
      title: '生命线 · 中等长度',
      desc: '你的生命线长度适中，健康状况整体平稳。你懂得劳逸结合，生活节奏把握得当。注意规律作息，福气自然绵长。',
      score: 75,
    },
    short: {
      title: '生命线 · 较短',
      desc: '你的生命线较短且靠近大拇指，提醒你要多关注身体信号。适当运动、均衡饮食可以增强体质。掌纹会随生活改变而变化，不必忧虑。',
      score: 60,
    },
  },
  head: {
    straight: {
      title: '智慧线 · 平直延伸',
      desc: '你的智慧线平直，思维务实理性，擅长逻辑分析。你做事有条理，是值得信赖的实干家。在商界和工程领域大有可为。',
      score: 82,
    },
    curved: {
      title: '智慧线 · 向下弯曲',
      desc: '你的智慧线向下弯曲，富有想象力与创造力。你心思细腻，有艺术天赋，适合从事文学、艺术或设计类工作。灵感是你最大的财富。',
      score: 85,
    },
    long: {
      title: '智慧线 · 长而深刻',
      desc: '你的智慧线长且深刻，思维缜密，学习能力强。你善于深谋远虑，能洞察事物本质。是天生的智者和领导者。',
      score: 92,
    },
  },
  heart: {
    long: {
      title: '感情线 · 长且上翘',
      desc: '你的感情线长且末端上翘，感情丰富而真挚。你重情重义，待人温暖，容易收获美好姻缘。桃花旺盛，注意甄别真心人。',
      score: 88,
    },
    wavy: {
      title: '感情线 · 波浪起伏',
      desc: '你的感情线呈波浪状，情感经历较为丰富曲折。你感性多情，感情路上有惊喜也有波折。学会平和心态，终会遇到对的人。',
      score: 70,
    },
    straight: {
      title: '感情线 · 平直清晰',
      desc: '你的感情线平直清晰，感情观成熟稳定。你对待感情忠诚专一，不轻易动心但一旦投入便全心全意。是值得托付终身的人。',
      score: 80,
    },
  },
}

// 运势评级
export const fortuneLabels = [
  { min: 90, label: '大吉大利 ✨', desc: '鸿运当头，万事顺遂！' },
  { min: 75, label: '吉星高照 🌟', desc: '运势上佳，把握机遇。' },
  { min: 60, label: '平稳安康 🍀', desc: '稳中向好，脚踏实地。' },
  { min: 0, label: '蓄势待发 🌱', desc: '韬光养晦，静待花开。' },
]

// 线路名称映射
export const lineNames: Record<string, string> = {
  life: '生命线',
  head: '智慧线',
  heart: '感情线',
}

// 线路图标映射
export const lineIcons: Record<string, string> = {
  life: '💪',
  head: '🧠',
  heart: '❤️',
}

// 获取运势评级
export function getFortune(score: number) {
  return fortuneLabels.find((f) => score >= f.min) || fortuneLabels[fortuneLabels.length - 1]
}
