<template>
  <view class="container">
    <!-- 生命线 -->
    <view class="section">
      <text class="section-title">请选择你的生命线特征</text>
      <text class="hint">生命线反映你的健康与活力，观察你手掌大拇指下方的弧形纹路：</text>
      <view class="options">
        <view
          v-for="opt in lineOptions.life"
          :key="opt.value"
          class="option"
          :class="{ selected: selections.life === opt.value }"
          @tap="selectOption('life', opt.value)"
        >
          <text class="option-icon">{{ opt.icon }}</text>
          <text class="option-text">{{ opt.text }}</text>
        </view>
      </view>
    </view>

    <!-- 智慧线 -->
    <view class="section">
      <text class="section-title">请选择你的智慧线特征</text>
      <text class="hint">智慧线反映你的思维与才智，观察手掌中央横向的纹路：</text>
      <view class="options">
        <view
          v-for="opt in lineOptions.head"
          :key="opt.value"
          class="option"
          :class="{ selected: selections.head === opt.value }"
          @tap="selectOption('head', opt.value)"
        >
          <text class="option-icon">{{ opt.icon }}</text>
          <text class="option-text">{{ opt.text }}</text>
        </view>
      </view>
    </view>

    <!-- 感情线 -->
    <view class="section">
      <text class="section-title">请选择你的感情线特征</text>
      <text class="hint">感情线反映你的情感与人际关系，观察手掌上方的横向纹路：</text>
      <view class="options">
        <view
          v-for="opt in lineOptions.heart"
          :key="opt.value"
          class="option"
          :class="{ selected: selections.heart === opt.value }"
          @tap="selectOption('heart', opt.value)"
        >
          <text class="option-icon">{{ opt.icon }}</text>
          <text class="option-text">{{ opt.text }}</text>
        </view>
      </view>
    </view>

    <button class="btn-primary" :disabled="!allSelected" @tap="goToResult">解读掌纹</button>
  </view>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { lineOptions } from '@/utils/palmData'
import { selectionStore } from '@/store/selection'

const selections = reactive({
  life: selectionStore.get('life'),
  head: selectionStore.get('head'),
  heart: selectionStore.get('heart'),
})

const allSelected = computed(() => !!(selections.life && selections.head && selections.heart))

function selectOption(line: string, value: string) {
  ;(selections as any)[line] = value
  selectionStore.set(line, value)
}

function goToResult() {
  if (!allSelected.value) return
  uni.navigateTo({ url: '/pages/result/result' })
}
</script>

<style scoped>
.container {
  padding: 30rpx 25rpx 60rpx;
}

.section {
  margin-bottom: 35rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  color: #ffd700;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.hint {
  display: block;
  font-size: 24rpx;
  color: #a090c0;
  margin-bottom: 16rpx;
  line-height: 1.5;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.option {
  display: flex;
  align-items: center;
  padding: 24rpx 28rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 2rpx solid rgba(255, 215, 0, 0.15);
  border-radius: 16rpx;
}

.option.selected {
  background: rgba(255, 215, 0, 0.15);
  border-color: #ffd700;
}

.option-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.option-text {
  font-size: 28rpx;
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
  margin-top: 20rpx;
}

.btn-primary[disabled] {
  opacity: 0.4;
}
</style>
