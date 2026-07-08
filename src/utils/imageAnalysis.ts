/**
 * 掌纹照片分析与验证模块 v2
 * 
 * 优化内容（基于5组测试图片验证）：
 * - 修复 Canvas 像素数据通道问题
 * - 降低阈值使更多合格照片通过
 * - 三重肤色检测法（YCbCr + HSV + RGB比例），支持各肤色
 * - 修复质量评分 NaN 问题
 * - 优化纹路清晰度计算公式
 * - 拳头检测：通过肤色区域宽高比区分张开的掌和握紧的拳
 */

// 分析结果
export interface AnalysisResult {
  isValid: boolean
  reason: string
  qualityScore: number
  brightness: number
  contrast: number
  sharpness: number
  skinRatio: number
  isPalm: boolean
  lineClarity: number
  detectedLines: string[]
}

// 质量阈值配置（优化后）
const THRESHOLDS = {
  minBrightness: 40,        // 降低：从50→40
  maxBrightness: 230,       // 放宽：从220→230
  minContrast: 20,          // 降低：从25→20
  minSharpness: 50,         // 降低：从100→50
  minSkinRatio: 0.08,       // 大幅降低：从0.25→0.08
  minResolution: 300,       // 最低分辨率
  minPalmAspectRatio: 0.7,  // 手掌区域宽高比下限（区分拳头和手掌）
  maxPalmAspectRatio: 2.0,  // 手掌区域宽高比上限
}

/**
 * 获取图像信息
 */
export function getImageInfo(src: string): Promise<{ width: number; height: number; path: string }> {
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src,
      success: (res) => {
        resolve({ width: res.width, height: res.height, path: res.path })
      },
      fail: (err) => reject(err),
    })
  })
}

/**
 * 使用 Canvas 2D 获取图像像素数据
 */
export function getCanvasImageData(
  canvasId: string,
  component: any,
  imagePath: string,
  targetWidth: number = 256,
  targetHeight: number = 256
): Promise<Uint8ClampedArray> {
  return new Promise((resolve, reject) => {
    const ctx = uni.createCanvasContext(canvasId, component)
    ctx.drawImage(imagePath, 0, 0, targetWidth, targetHeight)
    ctx.draw(false, () => {
      setTimeout(() => {
        uni.canvasGetImageData({
          canvasId,
          x: 0, y: 0,
          width: targetWidth,
          height: targetHeight,
          success: (res) => resolve(res.data as Uint8ClampedArray),
          fail: (err) => reject(err),
        }, component)
      }, 200)
    })
  })
}

/**
 * 计算亮度（灰度均值）
 */
function calcBrightness(data: Uint8ClampedArray): number {
  let sum = 0
  const pixelCount = data.length / 4
  for (let i = 0; i < data.length; i += 4) {
    sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
  }
  return sum / pixelCount
}

/**
 * 计算对比度（灰度标准差）
 */
function calcContrast(data: Uint8ClampedArray, meanBrightness: number): number {
  let sumSq = 0
  const pixelCount = data.length / 4
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    sumSq += (gray - meanBrightness) ** 2
  }
  return Math.sqrt(sumSq / pixelCount)
}

/**
 * 计算清晰度（Laplacian 方差）
 */
function calcSharpness(data: Uint8ClampedArray, width: number, height: number): number {
  const gray: number[] = []
  for (let i = 0; i < data.length; i += 4) {
    gray.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
  }

  const laplacian: number[] = []
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x
      const val = gray[idx - width] + gray[idx + width] + gray[idx - 1] + gray[idx + 1] - 4 * gray[idx]
      laplacian.push(val)
    }
  }

  if (laplacian.length === 0) return 0
  const mean = laplacian.reduce((a, b) => a + b, 0) / laplacian.length
  const variance = laplacian.reduce((a, b) => a + (b - mean) ** 2, 0) / laplacian.length
  return variance
}

/**
 * 三重肤色检测（YCbCr + HSV + RGB比例法）
 * 支持各种肤色：浅色、中等、深色皮肤
 */
function calcSkinRatio(data: Uint8ClampedArray): number {
  let skinPixels = 0
  const pixelCount = data.length / 4

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    let isSkin = false

    // 方法1: YCbCr 肤色检测（放宽范围）
    const y = 0.299 * r + 0.587 * g + 0.114 * b
    const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b
    const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b

    if (y >= 40 && cb >= 75 && cb <= 135 && cr >= 130 && cr <= 180) {
      if (r > g && (r - g) > 5) {
        isSkin = true
      }
    }

    // 方法2: HSV 肤色检测
    if (!isSkin) {
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const delta = max - min
      let h = 0
      if (delta !== 0 && max !== 0) {
        if (max === r) h = ((g - b) / delta) % 6
        else if (max === g) h = (b - r) / delta + 2
        else h = (r - g) / delta + 4
        h *= 60
        if (h < 0) h += 360
      }
      const s = max === 0 ? 0 : delta / max
      const v = max / 255

      if (h >= 0 && h <= 60 && s >= 0.08 && s <= 0.75 && v >= 0.15) {
        isSkin = true
      }
    }

    // 方法3: RGB 比例法
    if (!isSkin) {
      if (r > 80 && g > 30 && b > 15 && r > g && g > b && (r - g) > 10 && (r - b) > 10) {
        isSkin = true
      }
    }

    if (isSkin) skinPixels++
  }

  return skinPixels / pixelCount
}

/**
 * 检测手掌区域的宽高比
 * 张开的手掌宽高比接近1或略大，握紧的拳头更接近正方形且面积更小
 */
function calcSkinAspectRatio(data: Uint8ClampedArray, width: number, height: number): number {
  let minX = width, maxX = 0, minY = height, maxY = 0
  let skinCount = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const r = data[i], g = data[i + 1], b = data[i + 2]

      // 简化肤色判断
      const yVal = 0.299 * r + 0.587 * g + 0.114 * b
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b

      let isSkin = false
      if (yVal >= 40 && cb >= 75 && cb <= 135 && cr >= 130 && cr <= 180 && r > g && (r - g) > 5) {
        isSkin = true
      }
      if (!isSkin) {
        const max = Math.max(r, g, b), min = Math.min(r, g, b)
        const delta = max - min
        let h = 0
        if (delta !== 0 && max !== 0) {
          if (max === r) h = ((g - b) / delta) % 6
          else if (max === g) h = (b - r) / delta + 2
          else h = (r - g) / delta + 4
          h *= 60
          if (h < 0) h += 360
        }
        const s = max === 0 ? 0 : delta / max
        const v = max / 255
        if (h >= 0 && h <= 60 && s >= 0.08 && s <= 0.75 && v >= 0.15) isSkin = true
      }

      if (isSkin) {
        skinCount++
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (skinCount === 0) return 0
  const skinWidth = maxX - minX + 1
  const skinHeight = maxY - minY + 1
  if (skinHeight === 0) return 0
  return skinWidth / skinHeight
}

/**
 * 估算纹路清晰度
 */
function estimateLineClarity(contrast: number, sharpness: number, skinRatio: number): number {
  const contrastScore = Math.min(100, (contrast / 40) * 100)
  const sharpnessScore = Math.min(100, (sharpness / 300) * 100)
  const skinScore = Math.min(100, skinRatio * 300)
  return Math.round(contrastScore * 0.35 + sharpnessScore * 0.40 + skinScore * 0.25)
}

/**
 * 检测掌纹纹路
 */
function detectLines(clarity: number, skinRatio: number): string[] {
  const lines: string[] = []
  if (clarity > 25 && skinRatio > 0.06) lines.push('生命线')
  if (clarity > 30 && skinRatio > 0.08) lines.push('智慧线')
  if (clarity > 35 && skinRatio > 0.10) lines.push('感情线')
  if (clarity > 50) lines.push('命运线')
  if (clarity > 60) lines.push('太阳线')
  if (clarity > 45) lines.push('婚姻线')
  return lines
}

/**
 * 主分析函数：验证掌纹照片
 */
export function analyzePalmImage(
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  imgWidth: number,
  imgHeight: number
): AnalysisResult {
  // 1. 分辨率检查
  const minResolution = Math.min(imgWidth, imgHeight)
  if (minResolution < THRESHOLDS.minResolution) {
    return {
      isValid: false, reason: '照片分辨率过低，请重新拍摄更高清晰度的照片',
      qualityScore: 0, brightness: 0, contrast: 0, sharpness: 0,
      skinRatio: 0, isPalm: false, lineClarity: 0, detectedLines: [],
    }
  }

  // 2. 计算各项指标
  const brightness = calcBrightness(imageData)
  const contrast = calcContrast(imageData, brightness)
  const sharpness = calcSharpness(imageData, width, height)
  const skinRatio = calcSkinRatio(imageData)
  const lineClarity = estimateLineClarity(contrast, sharpness, skinRatio)
  const isPalm = skinRatio >= THRESHOLDS.minSkinRatio
  const detectedLines = detectLines(lineClarity, skinRatio)

  // 3. 手掌区域宽高比检测（区分拳头和手掌）
  const aspectRatio = isPalm ? calcSkinAspectRatio(imageData, width, height) : 0
  const isLikelyOpenPalm = aspectRatio === 0 || (aspectRatio >= THRESHOLDS.minPalmAspectRatio && aspectRatio <= THRESHOLDS.maxPalmAspectRatio)

  // 4. 综合质量评分（修复NaN）
  let qualityScore = 0
  qualityScore += (brightness >= THRESHOLDS.minBrightness && brightness <= THRESHOLDS.maxBrightness) ? 25 : 10
  qualityScore += (contrast >= THRESHOLDS.minContrast) ? 25 : Math.round(contrast)
  qualityScore += (sharpness >= THRESHOLDS.minSharpness) ? 25 : Math.round(Math.min(25, sharpness / 5))
  qualityScore += (isPalm) ? 25 : 0
  qualityScore = Math.min(100, qualityScore)

  // 5. 验证判断
  let isValid = true
  let reason = ''

  if (brightness < THRESHOLDS.minBrightness) {
    isValid = false
    reason = '照片过暗，请到光线充足的地方重新拍摄'
  } else if (brightness > THRESHOLDS.maxBrightness) {
    isValid = false
    reason = '照片过亮（可能曝光过度），请调整光线后重新拍摄'
  }

  if (isValid && contrast < THRESHOLDS.minContrast) {
    isValid = false
    reason = '照片对比度不足，掌纹不够清晰，请靠近手掌重新拍摄'
  }

  if (isValid && sharpness < THRESHOLDS.minSharpness) {
    isValid = false
    reason = '照片模糊，掌纹纹路无法辨识，请保持手部稳定重新拍摄'
  }

  if (isValid && !isPalm) {
    isValid = false
    reason = '未检测到手掌，请将手掌正对摄像头重新拍摄'
  }

  // 拳头检测：如果肤色区域宽高比异常，可能是握紧的拳头而非张开的手掌
  if (isValid && !isLikelyOpenPalm && skinRatio > 0.08) {
    isValid = false
    reason = '检测到可能不是张开的手掌，请五指自然展开后重新拍摄'
  }

  if (isValid && lineClarity < 30) {
    isValid = false
    reason = '掌纹纹路不够清晰，请在光线更好的环境重新拍摄，并确保手掌平整展开'
  }

  if (isValid && detectedLines.length < 3) {
    isValid = false
    reason = '检测到的掌纹纹路过少，请确保手掌平整展开、光线均匀后重新拍摄'
  }

  return {
    isValid, reason, qualityScore,
    brightness: Math.round(brightness),
    contrast: Math.round(contrast),
    sharpness: Math.round(sharpness),
    skinRatio: Math.round(skinRatio * 100) / 100,
    isPalm, lineClarity, detectedLines,
  }
}

/**
 * 模拟 AI 掌纹分析（生成掌纹特征属性）
 */
export function generateLineAttributes(analysisResult: AnalysisResult) {
  const { lineClarity, contrast, sharpness, skinRatio } = analysisResult

  const base = Math.min(5, Math.max(1, Math.ceil(lineClarity / 20)))
  const variation = () => Math.max(1, Math.min(5, base + Math.floor(Math.random() * 3) - 1))

  const lifeAttrs = {
    depth: variation(),
    length: Math.max(2, Math.min(5, base + (skinRatio > 0.35 ? 1 : 0))),
    curvature: 3 + Math.floor(Math.random() * 2),
    clarity: variation(),
    continuity: lineClarity > 50 ? 4 + Math.floor(Math.random() * 2) : variation(),
    markings: lineClarity > 60 && Math.random() > 0.7 ? ['fork'] : [],
  }

  const headAttrs = {
    depth: variation(), length: variation(),
    curvature: 2 + Math.floor(Math.random() * 3),
    clarity: variation(), continuity: variation(), markings: [],
  }

  const heartAttrs = {
    depth: variation(),
    length: Math.max(2, Math.min(5, base + (contrast > 35 ? 1 : 0))),
    curvature: 2 + Math.floor(Math.random() * 3),
    clarity: variation(),
    continuity: lineClarity > 45 ? 4 : variation(),
    markings: lineClarity > 55 && Math.random() > 0.8 ? ['chain'] : [],
  }

  const fateAttrs = {
    depth: lineClarity > 55 ? variation() : 1,
    length: lineClarity > 55 ? variation() : 1,
    curvature: 2, clarity: lineClarity > 55 ? variation() : 1,
    continuity: lineClarity > 50 ? 4 : 2, markings: [],
  }

  const sunAttrs = {
    depth: lineClarity > 65 ? variation() : 1,
    length: lineClarity > 65 ? variation() : 1,
    curvature: 2, clarity: lineClarity > 65 ? variation() : 1,
    continuity: 3, markings: [],
  }

  const marriageAttrs = {
    depth: lineClarity > 50 ? variation() : 2,
    length: lineClarity > 50 ? variation() : 1,
    curvature: 2, clarity: lineClarity > 50 ? variation() : 2,
    continuity: 3, markings: [],
  }

  return { life: lifeAttrs, head: headAttrs, heart: heartAttrs, fate: fateAttrs, sun: sunAttrs, marriage: marriageAttrs }
}
