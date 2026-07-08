/**
 * 掌纹算命结果生成引擎
 * 基于掌纹学知识库，综合线路属性生成完整解读
 */

import {
  type LineType,
  type LineAttributes,
  type LineReading,
  type PalmReadingResult,
  lineMeta,
  matchReading,
  calcLineScore,
  getFortuneLevel,
} from './palmData'
import type { AnalysisResult } from './imageAnalysis'

/**
 * 生成完整的掌纹解读结果
 */
export function generatePalmReading(
  lineAttrs: Record<LineType, LineAttributes>,
  analysisResult: AnalysisResult
): PalmReadingResult {
  const lineTypes: LineType[] = ['life', 'head', 'heart', 'fate', 'sun', 'marriage']
  const lines: LineReading[] = []

  // 生成每条线的解读
  for (const type of lineTypes) {
    const attrs = lineAttrs[type]
    const meta = lineMeta[type]
    const reading = matchReading(type, attrs)
    const score = calcLineScore(attrs)

    lines.push({
      type,
      name: meta.name,
      icon: meta.icon,
      title: reading.title,
      desc: reading.desc,
      score,
      attributes: attrs,
    })
  }

  // 加权计算综合评分
  let overallScore = 0
  for (const line of lines) {
    overallScore += line.score * lineMeta[line.type].weight
  }
  overallScore = Math.round(overallScore)

  // 运势评级
  const fortune = getFortuneLevel(overallScore)

  // 生成四维运势（事业、爱情、健康、财运）
  const lifeLine = lines.find(l => l.type === 'life')!
  const headLine = lines.find(l => l.type === 'head')!
  const heartLine = lines.find(l => l.type === 'heart')!
  const fateLine = lines.find(l => l.type === 'fate')!
  const sunLine = lines.find(l => l.type === 'sun')!
  const marriageLine = lines.find(l => l.type === 'marriage')!

  // 事业运：智慧线 + 命运线 + 太阳线
  const careerScore = Math.round(headLine.score * 0.4 + fateLine.score * 0.35 + sunLine.score * 0.25)
  const career = generateCareerReading(headLine, fateLine, sunLine, careerScore)

  // 爱情运：感情线 + 婚姻线
  const loveScore = Math.round(heartLine.score * 0.65 + marriageLine.score * 0.35)
  const love = generateLoveReading(heartLine, marriageLine, loveScore)

  // 健康运：生命线
  const healthScore = lifeLine.score
  const health = generateHealthReading(lifeLine, healthScore)

  // 财运：命运线 + 太阳线 + 智慧线
  const wealthScore = Math.round(fateLine.score * 0.35 + sunLine.score * 0.35 + headLine.score * 0.30)
  const wealth = generateWealthReading(fateLine, sunLine, headLine, wealthScore)

  // 总结
  const summary = generateSummary(overallScore, lines)

  return {
    lines,
    overallScore,
    fortuneLevel: fortune.level,
    fortuneDesc: fortune.desc,
    career,
    love,
    health,
    wealth,
    summary,
    date: new Date().toLocaleDateString('zh-CN'),
  }
}

function generateCareerReading(head: LineReading, fate: LineReading, sun: LineReading, score: number): string {
  if (score >= 85) {
    return `事业运势极佳！${head.title.includes('深弯') ? '你兼具创意与智慧，' : '你思维敏捷务实，'}${fate.title.includes('深直') ? '人生方向明确，' : '善于自我定位，'}${sun.title.includes('明朗') ? '且容易获得公众认可。' : '工作中成就感丰富。'}中年后事业将达高峰，名利双收。宜把握机遇，大胆前行。`
  } else if (score >= 70) {
    return `事业运势良好。${head.title.includes('平直') ? '你的逻辑分析能力是职场利器，' : '你的创造力让你脱颖而出，'}${fate.title.includes('断续') ? '虽方向有变但每次转变都是成长。' : '事业稳步发展，方向逐渐明确。'}建议深耕专业领域，三十岁后渐入佳境。`
  } else {
    return `事业运势平稳。${head.title.includes('短') ? '你擅长集中精力处理具体事务，' : '你需要更多时间找到真正适合的方向。'}${fate.title.includes('缺失') ? '你是自力更生型人才，不依赖命运安排。' : '坚持当前方向，终会有所建树。'}建议多拓展视野，把握贵人机遇。`
  }
}

function generateLoveReading(heart: LineReading, marriage: LineReading, score: number): string {
  if (score >= 85) {
    return `爱情运势极佳！${heart.title.includes('上翘') ? '你感情丰富真挚，魅力四射，' : '你感情忠诚专一，值得被爱，'}${marriage.title.includes('清晰') ? '且婚姻线预示良缘。' : '缘分虽晚但终将到来。'}桃花旺盛，注意甄别真心人，终遇良缘，婚姻美满。`
  } else if (score >= 70) {
    return `爱情运势良好。${heart.title.includes('平直') ? '你对待感情认真稳重，' : '你感性多情，感情丰富，'}${marriage.title.includes('模糊') ? '感情路需多些耐心，缘分到了自然水到渠成。' : '能找到志同道合的伴侣。'}学会表达感受，幸福不遥远。`
  } else {
    return `爱情运势蓄势待发。${heart.title.includes('波浪') ? '感情路上有波折，但每次经历都是成长。' : '你情感内敛含蓄，需主动表达。'}不急不躁，提升自我，扩大社交，对的人终会出现。`
  }
}

function generateHealthReading(life: LineReading, score: number): string {
  if (score >= 85) {
    return `健康运势极佳！${life.title.includes('深长') ? '你天生体魄强健，精力充沛，生命力旺盛。' : '你健康状况良好，恢复力强。'}即使偶有小恙也能迅速恢复。保持良好生活习惯，福寿绵长。`
  } else if (score >= 70) {
    return `健康运势良好。${life.title.includes('中等') ? '你懂得劳逸结合，生活节奏把握得当。' : '你整体健康状况平稳。'}注意规律作息、适当运动，中年后关注心血管保养即可。`
  } else {
    return `健康运势需关注。${life.title.includes('断裂') ? '手相提示某阶段需特别注意身体，建议定期体检。' : '需多关注身体信号，通过运动和均衡饮食增强体质。'}掌纹会随生活改善而变化，注重养生，寿元不减。`
  }
}

function generateWealthReading(fate: LineReading, sun: LineReading, head: LineReading, score: number): string {
  if (score >= 85) {
    return `财运亨通！${fate.title.includes('深直') ? '事业方向明确且稳定，' : '你善于创造财富机会，'}${sun.title.includes('明朗') ? '容易获得意外之财和公众认可。' : '理财能力出色。'}${head.title.includes('平直') ? '理性的消费观让你财富稳步增长。' : '创意思维带来多元收入。'}宜稳健投资，避免投机。`
  } else if (score >= 70) {
    return `财运良好。${fate.title.includes('清晰') ? '事业稳步发展为财富积累奠定基础。' : '你靠自身努力创造财富。'}${head.title.includes('深弯') ? '创意才能可能带来额外收入。' : '理性规划让财务状况健康。'}建议培养理财习惯，积少成多。`
  } else {
    return `财运平稳。${fate.title.includes('断续') ? '收入可能有波动，建议建立紧急储备金。' : '需要更多努力开拓财源。'}${head.title.includes('短') ? '专注本职工作，踏实积累。' : '发挥才智，寻找适合的理财方式。'}记住：勤劳致富，量入为出。`
  }
}

function generateSummary(overallScore: number, lines: LineReading[]): string {
  const topLine = [...lines].sort((a, b) => b.score - a.score)[0]
  const weakLine = [...lines].sort((a, b) => a.score - b.score)[0]

  if (overallScore >= 80) {
    return `综合来看，你的掌相上佳，${topLine.name}尤为出众——${topLine.desc.substring(0, 30)}...整体运势强劲，天时地利人和皆备。${weakLine.name}稍弱，适当关注即可。记住：手相会随生活改变而变化，保持积极心态，运势更上一层楼。`
  } else if (overallScore >= 65) {
    return `综合来看，你的掌相良好，${topLine.name}是你的优势——${topLine.desc.substring(0, 30)}...${weakLine.name}是需要关注的方面。人生如同手相，有强有弱方显平衡。发挥优势，改善不足，未来可期。`
  } else {
    return `综合来看，你的掌相处于蓄势阶段。${topLine.name}是你最大的亮点——${topLine.desc.substring(0, 30)}...${weakLine.name}需要更多关注。但请记住：手相并非宿命，掌纹会随生活态度和行动而变化。积极面对，转机就在不远处。`
  }
}
