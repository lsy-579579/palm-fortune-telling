<template>
  <view class="container">
    <view class="result-header">
      <text class="result-icon">📜</text>
      <text class="result-title">你的掌纹解读</text>
    </view>

    <view v-for="line in lineKeys" :key="line" class="result-section">
      <text class="result-section-title">{{ lineIcons[line] }} {{ readings[line].title }}</text>
      <text class="result-section-desc">{{ readings[line].desc }}</text>
    </view>

    <view class="fortune-score">
      <text class="score-title">综合运势</text>
      <view class="score-bar">
        <view class="score-fill" :style="{ width: scorePercent + '%' }"></view>
      </view>
      <text class="score-text">{{ avgScore }} 分 · {{ fortune.label }}</text>
      <text class="score-desc">{{ fortune.desc }}</text>
    </view>

    <button class="btn-primary" @tap="goRestart">重新算命</button>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { palmReadings, lineIcons, getFortune, type LineReading } from '@/utils/palmData'
import { selectionStore } from '@/store/selection'

const lineKeys = ['life', 'head', 'heart'] as const

const readings = computed(() => {
  const result: Record<string, LineReading> = {}
  lineKeys.forEach((key) => {
    const selected = selectionStore.get(key)
    if (selected && palmReadings[key] && palmReadings[key][selected]) {
      result[key] = palmReadings[key][selected]
    }
  })
  return result
})

const avgScore = computed(() => {
  const scores = lineKeys.map((key) => {
    const selected = selectionStore.get(key)
    return selected && palmReadings[key][selected] ? palmReadings[key][selected].score : 0
  })
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
})

const scorePercent = computed(() => avgScore.value)

const fortune = computed(() => getFortune(avgScore.value))

function goRestart() {
  selectionStore.reset()
  uni.reLaunch({ url: '/pages/index/index' })
}
</script>

<style scoped>
.container {
  padding: 30rpx 25rpx 60rpx;
}

.result-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;
}

.result-icon {
  font-size: 64rpx;
  margin-bottom: 10rpx;
}

.result-title {
  font-size: 40rpx;
  color: #ffd700;
  font-weight: bold;
}

.result-section {
  margin-bottom: 24rpx;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.04);
  border-left: 6rpx solid #ffd700;
  border-radius: 12rpx;
}

.result-section-title {
  display: block;
  font-size: 30rpx;
  color: #ffd700;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.result-section-desc {
  display: block;
  font-size: 26rpx;
  color: #d0c0e0;
  line-height: 1.6;
}

.fortune-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16rpx;
}

.score-title {
  font-size: 32rpx;
  color: #ffd700;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.score-bar {
  width: 100%;
  height: 36rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 18rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff4444, #ffd700, #44ff44);
  border-radius: 18rpx;
  transition: width 1s ease;
}

.score-text {
  font-size: 34rpx;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 8rpx;
}

.score-desc {
  font-size: 26rpx;
  color: #d0c0e0;
}

.btn-primary {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  color: #1a0a2e;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  border-radius: 16rpx;
}
</style>
