/**
 * 掌纹照片分析与验证模块
 * 
 * 技术方案：
 * - 端侧使用 Canvas 2D API 进行图像质量检测（亮度、对比度、模糊度、肤色占比）
 * - 模拟手掌检测：通过肤色像素占比判断是否为手掌照片
 * - 模拟纹路清晰度：通过 Laplacian 方差评估图像锐度
 * 
 * 架构设计：预留 AI 后端接口，可无缝替换为真实掌纹识别服务
 */

// 分析结果
export interface AnalysisResult {
  isValid: boolean        // 是否通过验证
  reason: string          // 不通过原因（若 isValid=false）
  qualityScore: number    // 图像质量评分 0-100
  brightness: number      // 亮度 0-255
  contrast: number        // 对对比度 0-100
  sharpness: number       // 清晰度（Laplacian 方差）
  skinRatio: number       // 肤色占比 0-1
  isPalm: boolean         // 是否检测到手掌
  lineClarity: number     // 纹路清晰度 0-100
  // 检测到的掌纹特征（模拟）
  detectedLines: string[] // 检测到的纹路
}

// 图像信息
interface ImageInfo {
  width: number
  height: number
  path: string
}

// 质量阈值配置
const THRESHOLDS = {
  minBrightness: 50,        // 最低亮度
  maxBrightness: 220,       // 最高亮度
  minContrast: 25,          // 最低对比度
  minSharpness: 100,        // 最低清晰度（Laplacian 方差）
  minSkinRatio: 0.25,       // 最低肤色占比
  minResolution: 300,       // 最低分辨率（短边）
}

/**
 * 获取图像信息
 */
export function getImageInfo(src: string): Promise<ImageInfo> {
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src,
      success: (res) => {
        resolve({
          width: res.width,
          height: res.height,
          path: res.path,
        })
      },
      fail: (err) => reject(err),
    })
  })
}

/**
 * 使用 Canvas 2D 获取图像像素数据
 * 需要在页面 onReady 后调用，且页面中需有 canvas 元素
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

    // 绘制图像到 canvas（缩放到目标尺寸）
    ctx.drawImage(imagePath, 0, 0, targetWidth, targetHeight)

    ctx.draw(false, () => {
      setTimeout(() => {
        uni.canvasGetImageData({
          canvasId,
          x: 0,
          y: 0,
          width: targetWidth,
          height: targetHeight,
          success: (res) => {
            resolve(res.data as Uint8ClampedArray)
          },
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
    // 灰度 = 0.299R + 0.587G + 0.114B
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
 * Laplacian 算子：[0,1,0; 1,-4,1; 0,1,0]
 * 方差越大表示图像越清晰（边缘越多）
 */
function calcSharpness(data: Uint8ClampedArray, width: number, height: number): number {
  // 先转灰度图
  const gray: number[] = []
  for (let i = 0; i < data.length; i += 4) {
    gray.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
  }

  // Laplacian 卷积
  const laplacian: number[] = []
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x
      const val = gray[idx - width] + gray[idx + width] + gray[idx - 1] + gray[idx + 1] - 4 * gray[idx]
      laplacian.push(val)
    }
  }

  // 计算方差
  const mean = laplacian.reduce((a, b) => a + b, 0) / laplacian.length
  const variance = laplacian.reduce((a, b) => a + (b - mean) ** 2, 0) / laplacian.length
  return variance
}

/**
 * 检测肤色像素占比
 * 使用 YCbCr 色彩空间的肤色检测规则
 */
function calcSkinRatio(data: Uint8ClampedArray): number {
  let skinPixels = 0
  const pixelCount = data.length / 4

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // YCbCr 肤色检测
    const y = 0.299 * r + 0.587 * g + 0.114 * b
    const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b
    const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b

    // 肤色范围判断
    if (y >= 60 && cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173) {
      // 进一步验证：R > G > B 且 R - G > 15
      if (r > g && g > b && (r - g) > 10) {
        skinPixels++
      }
    }
  }

  return skinPixels / pixelCount
}

/**
 * 模拟掌纹纹路检测
 * 基于图像对比度和清晰度推断纹路可辨识度
 */
function estimateLineClarity(contrast: number, sharpness: number, skinRatio: number): number {
  // 综合评分
  const contrastScore = Math.min(100, (contrast / 50) * 100)
  const sharpnessScore = Math.min(100, (sharpness / 500) * 100)
  const skinScore = Math.min(100, skinRatio * 150)

  return Math.round(contrastScore * 0.35 + sharpnessScore * 0.40 + skinScore * 0.25)
}

/**
 * 模拟检测到的纹路
 */
function detectLines(clarity: number, skinRatio: number): string[] {
  const lines: string[] = []
  if (clarity > 30 && skinRatio > 0.2) lines.push('生命线')
  if (clarity > 35 && skinRatio > 0.25) lines.push('智慧线')
  if (clarity > 40 && skinRatio > 0.3) lines.push('感情线')
  if (clarity > 55) lines.push('命运线')
  if (clarity > 65) lines.push('太阳线')
  if (clarity > 50) lines.push('婚姻线')
  return lines
}

/**
 * 主分析函数：验证掌纹照片
 * @param imageData Canvas 像素数据
 * @param width 图像宽度
 * @param height 图像高度
 * @param imgWidth 原图宽度（分辨率检查）
 * @param imgHeight 原图高度
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
      isValid: false,
      reason: '照片分辨率过低，请重新拍摄更高清晰度的照片',
      qualityScore: 0,
      brightness: 0,
      contrast: 0,
      sharpness: 0,
      skinRatio: 0,
      isPalm: false,
      lineClarity: 0,
      detectedLines: [],
    }
  }

  // 2. 计算各项指标
  const brightness = calcBrightness(imageData)
  const contrast = calcContrast(imageData, brightness)
  const sharpness = calcSharpness(imageData, width, height)
  const skinRatio = calcSkinRatio(imageData)

  // 3. 纹路清晰度
  const lineClarity = estimateLineClarity(contrast, sharpness, skinRatio)

  // 4. 是否检测到手掌
  const isPalm = skinRatio >= THRESHOLDS.minSkinRatio

  // 5. 检测到的纹路
  const detectedLines = detectLines(lineClarity, skinRatio)

  // 6. 综合质量评分
  const qualityScore = Math.round(
    (brightness >= THRESHOLDS.minBrightness && brightness <= THRESHOLDS.maxBrightness ? 25 : 10) +
    (contrast >= THRESHOLDS.minContrast ? 25 : contrast) +
    (sharpness >= THRESHOLDS.minSharpness ? 25 : sharpness / 10) +
    (isPalm ? 25 : 0)
  )

  // 7. 验证判断
  let isValid = true
  let reason = ''

  // 亮度检查
  if (brightness < THRESHOLDS.minBrightness) {
    isValid = false
    reason = '照片过暗，请到光线充足的地方重新拍摄'
  } else if (brightness > THRESHOLDS.maxBrightness) {
    isValid = false
    reason = '照片过亮（可能曝光过度），请调整光线后重新拍摄'
  }

  // 对比度检查
  if (isValid && contrast < THRESHOLDS.minContrast) {
    isValid = false
    reason = '照片对比度不足，掌纹不够清晰，请靠近手掌重新拍摄'
  }

  // 清晰度检查
  if (isValid && sharpness < THRESHOLDS.minSharpness) {
    isValid = false
    reason = '照片模糊，掌纹纹路无法辨识，请保持手部稳定重新拍摄'
  }

  // 手掌检测
  if (isValid && !isPalm) {
    isValid = false
    reason = '未检测到手掌，请将手掌正对摄像头重新拍摄'
  }

  // 纹路清晰度检查
  if (isValid && lineClarity < 35) {
    isValid = false
    reason = '掌纹纹路不够清晰，请在光线更好的环境重新拍摄，并确保手掌平整展开'
  }

  // 至少检测到3条主线
  if (isValid && detectedLines.length < 3) {
    isValid = false
    reason = '检测到的掌纹纹路过少，请确保手掌平整展开、光线均匀后重新拍摄'
  }

  return {
    isValid,
    reason,
    qualityScore,
    brightness: Math.round(brightness),
    contrast: Math.round(contrast),
    sharpness: Math.round(sharpness),
    skinRatio: Math.round(skinRatio * 100) / 100,
    isPalm,
    lineClarity,
    detectedLines,
  }
}

/**
 * 模拟 AI 掌纹分析（生成掌纹特征属性）
 * 在真实场景中，这里应调用后端 AI 服务进行纹路提取
 * 目前基于图像质量指标生成合理的模拟数据
 */
export function generateLineAttributes(analysisResult: AnalysisResult) {
  const { lineClarity, contrast, sharpness, skinRatio } = analysisResult

  // 基于 qualityScore 生成随机但合理的属性值
  const base = Math.min(5, Math.max(1, Math.ceil(lineClarity / 20)))
  const variation = () => Math.max(1, Math.min(5, base + Math.floor(Math.random() * 3) - 1))

  // 三大主线（一定有）
  const lifeAttrs = {
    depth: variation(),
    length: Math.max(2, Math.min(5, base + (skinRatio > 0.35 ? 1 : 0))),
    curvature: 3 + Math.floor(Math.random() * 2),
    clarity: variation(),
    continuity: lineClarity > 50 ? 4 + Math.floor(Math.random() * 2) : variation(),
    markings: lineClarity > 60 && Math.random() > 0.7 ? ['fork'] : [],
  }

  const headAttrs = {
    depth: variation(),
    length: variation(),
    curvature: 2 + Math.floor(Math.random() * 3),
    clarity: variation(),
    continuity: variation(),
    markings: [],
  }

  const heartAttrs = {
    depth: variation(),
    length: Math.max(2, Math.min(5, base + (contrast > 35 ? 1 : 0))),
    curvature: 2 + Math.floor(Math.random() * 3),
    clarity: variation(),
    continuity: lineClarity > 45 ? 4 : variation(),
    markings: lineClarity > 55 && Math.random() > 0.8 ? ['chain'] : [],
  }

  // 辅助线（可能有）
  const fateAttrs = {
    depth: lineClarity > 55 ? variation() : 1,
    length: lineClarity > 55 ? variation() : 1,
    curvature: 2,
    clarity: lineClarity > 55 ? variation() : 1,
    continuity: lineClarity > 50 ? 4 : 2,
    markings: [],
  }

  const sunAttrs = {
    depth: lineClarity > 65 ? variation() : 1,
    length: lineClarity > 65 ? variation() : 1,
    curvature: 2,
    clarity: lineClarity > 65 ? variation() : 1,
    continuity: 3,
    markings: [],
  }

  const marriageAttrs = {
    depth: lineClarity > 50 ? variation() : 2,
    length: lineClarity > 50 ? variation() : 1,
    curvature: 2,
    clarity: lineClarity > 50 ? variation() : 2,
    continuity: 3,
    markings: [],
  }

  return {
    life: lifeAttrs,
    head: headAttrs,
    heart: heartAttrs,
    fate: fateAttrs,
    sun: sunAttrs,
    marriage: marriageAttrs,
  }
}
