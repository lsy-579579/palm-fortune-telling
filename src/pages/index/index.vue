<template>
  <view class="container">
    <view class="palm-icon">🖐️</view>
    <text class="title">掌纹算命</text>
    <text class="subtitle">解读掌中奥秘，预见未来运势</text>
    <view class="card">
      <text class="card-title">欢迎来到掌纹算命</text>
      <text class="card-desc">掌纹是命运的密码，每一条纹路都藏着你的未来。点击下方按钮，开始你的掌纹解读之旅。</text>
    </view>
    <button class="btn-primary" @tap="goToPalm">开始算命</button>
    <text class="footer">⚠️ 仅供娱乐参考，命运掌握在自己手中</text>
  </view>
</template>

<script setup lang="ts">
import { selectionStore } from '@/store/selection'

function goToPalm() {
  selectionStore.reset()
  uni.navigateTo({ url: '/pages/palm/palm' })
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 30rpx;
  min-height: 100vh;
}

.palm-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.title {
  font-size: 52rpx;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 20rpx rgba(255, 215, 0, 0.5);
  margin-bottom: 12rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #b8a0d0;
  margin-bottom: 50rpx;
}

.card {
  width: 100%;
  background: rgba(45, 27, 78, 0.6);
  border: 1rpx solid rgba(255, 215, 0, 0.2);
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-title {
  font-size: 36rpx;
  color: #ffd700;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.card-desc {
  font-size: 28rpx;
  color: #d0c0e0;
  line-height: 1.7;
  text-align: center;
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
  margin-bottom: 40rpx;
}

.footer {
  font-size: 24rpx;
  color: #8060a0;
  text-align: center;
}
</style>
