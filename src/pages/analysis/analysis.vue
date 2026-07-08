<template>
  <view class="container">
    <!-- 隐藏的 Canvas，用于图像分析 -->
    <canvas
      canvas-id="analysisCanvas"
      id="analysisCanvas"
      style="width: 256px; height: 256px; position: fixed; left: -9999px; top: -9999px;"
    ></canvas>

    <!-- Loading 动画区域 -->
    <view class="loading-section">
      <view class="spinner-ring">
        <view class="spinner-inner"></view>
      </view>
      <text class="loading-title">正在分析掌纹</text>
      <text class="loading-desc">{{ currentStep }}</text>
    </view>

    <!-- 分析进度条 -->
    <view class="progress-section">
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progress + '%' }"></view>
      </view>
      <text class="progress-text">{{ progress }}%</text>
    </view>

    <!-- 分析步骤列表 -->
    <view class="steps-section">
      <view class="step-item" v-for="(step, index) in steps" :key="index">
        <text class="step-icon">{{ step.done ? '✅' : step.active ? '⏳' : '⬜' }}</text>
        <text class="step-text" :class="{ active: step.active, done: step.done }">{{ step.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { appStore } from '@/store/app'
import {
  getImageInfo,
  getCanvasImageData,
  analyzePalmImage,
  generateLineAttributes,
} from '@/utils/imageAnalysis'
import { generatePalmReading } from '@/utils/palmReading'
import type { LineType, LineAttributes } from '@/utils/palmData'
import type { AnalysisResult } from '@/utils/imageAnalysis'

const instance = getCurrentInstance()
const progress = ref(0)
const currentStep = ref('正在初始化分析引擎...')

const steps = ref([
  { label: '加载图像数据', done: false, active: false },
  { label: '检测手掌区域', done: false, active: false },
  { label: '评估图像质量', done: false, active: false },
  { label: '提取掌纹纹路', done: false, active: false },
  { label: '生成解读结果', done: false, active: false },
])

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function updateProgress(value: number, stepText: string) {
  progress.value = value
  currentStep.value = stepText
}

async function runAnalysis() {
  const imagePath = appStore.capturedImagePath
  if (!imagePath) {
    showFailAndReturn('未获取到照片，请重新拍摄')
    return
  }

  try {
    // 步骤1：加载图像数据
    steps.value[0].active = true
    updateProgress(15, '正在加载图像数据...')
    await delay(500)

    const imgInfo = await getImageInfo(imagePath)
    steps.value[0].done = true
    steps.value[0].active = false
    updateProgress(30, '图像加载完成')

    // 步骤2：检测手掌区域（通过 Canvas 像素分析）
    steps.value[1].active = true
    updateProgress(40, '正在检测手掌区域...')
    await delay(600)

    // 获取 Canvas 像素数据
    const targetW = 256
    const targetH = 256
    const imageData = await getCanvasImageData(
      'analysisCanvas',
      instance?.proxy,
      imagePath,
      targetW,
      targetH
    )

    steps.value[1].done = true
    steps.value[1].active = false
    updateProgress(55, '手掌区域检测完成')

    // 步骤3：评估图像质量
    steps.value[2].active = true
    updateProgress(65, '正在评估图像质量...')
    await delay(500)

    const analysisResult = analyzePalmImage(imageData, targetW, targetH, imgInfo.width, imgInfo.height)

    steps.value[2].done = true
    steps.value[2].active = false
    updateProgress(75, '图像质量评估完成')

    // 检查是否通过验证
    if (!analysisResult.isValid) {
      await delay(300)
      showFailAndReturn(analysisResult.reason)
      return
    }

    // 步骤4：提取掌纹纹路
    steps.value[3].active = true
    updateProgress(85, '正在提取掌纹纹路...')
    await delay(800)

    const lineAttrs = generateLineAttributes(analysisResult) as Record<LineType, LineAttributes>

    steps.value[3].done = true
    steps.value[3].active = false
    updateProgress(90, `检测到 ${analysisResult.detectedLines.length} 条纹路`)

    // 步骤5：生成解读结果
    steps.value[4].active = true
    updateProgress(95, '正在生成解读结果...')
    await delay(600)

    const readingResult = generatePalmReading(lineAttrs, analysisResult)

    steps.value[4].done = true
    steps.value[4].active = false
    updateProgress(100, '解读完成！')

    // 保存结果并跳转
    appStore.setAnalysisResult(analysisResult)
    appStore.setReadingResult(readingResult)

    await delay(500)
    uni.redirectTo({ url: '/pages/result/result' })

  } catch (error) {
    console.error('分析失败:', error)
    showFailAndReturn('分析过程中出现错误，请重新拍摄')
  }
}

function showFailAndReturn(reason: string) {
  uni.showModal({
    title: '照片不符合要求',
    content: reason + '\n\n请按照提示重新拍摄一张清晰的手掌照片。',
    confirmText: '重新拍摄',
    showCancel: false,
    success() {
      uni.reLaunch({ url: '/pages/index/index' })
    },
  })
}

onMounted(() => {
  setTimeout(() => {
    runAnalysis()
  }, 500)
})
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
  min-height: 100vh;
}

/* Loading 动画 */
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
}

.spinner-ring {
  width: 140rpx;
  height: 140rpx;
  border: 8rpx solid rgba(255, 215, 0, 0.15);
  border-top-color: #ffd700;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 40rpx;
  position: relative;
}

.spinner-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 50rpx;
}

.loading-title {
  font-size: 40rpx;
  color: #ffd700;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.loading-desc {
  font-size: 28rpx;
  color: #b8a0d0;
}

/* 进度条 */
.progress-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
}

.progress-bar {
  width: 100%;
  height: 16rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ff8c00);
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 26rpx;
  color: #ffd700;
  font-weight: bold;
}

/* 分析步骤 */
.steps-section {
  width: 100%;
  background: rgba(45, 27, 78, 0.4);
  border-radius: 16rpx;
  padding: 30rpx 28rpx;
}

.step-item {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.step-item:last-child {
  margin-bottom: 0;
}

.step-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.step-text {
  font-size: 28rpx;
  color: #8060a0;
}

.step-text.active {
  color: #ffd700;
  font-weight: bold;
}

.step-text.done {
  color: #d0c0e0;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
