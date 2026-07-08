/**
 * 全局状态管理
 */

import type { PalmReadingResult } from '@/utils/palmData'
import type { AnalysisResult } from '@/utils/imageAnalysis'

// 全局状态
const state = {
  capturedImagePath: '',     // 拍摄的照片路径
  analysisResult: null as AnalysisResult | null,  // 图像分析结果
  readingResult: null as PalmReadingResult | null, // 掌纹解读结果
}

export const appStore = {
  get capturedImagePath(): string {
    return state.capturedImagePath
  },
  setCapturedImage(path: string) {
    state.capturedImagePath = path
  },

  get analysisResult(): AnalysisResult | null {
    return state.analysisResult
  },
  setAnalysisResult(result: AnalysisResult | null) {
    state.analysisResult = result
  },

  get readingResult(): PalmReadingResult | null {
    return state.readingResult
  },
  setReadingResult(result: PalmReadingResult | null) {
    state.readingResult = result
  },

  reset() {
    state.capturedImagePath = ''
    state.analysisResult = null
    state.readingResult = null
  },
}
