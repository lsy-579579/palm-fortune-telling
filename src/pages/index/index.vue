<template>
  <view class="container">
    <!-- 标题区域 -->
    <view class="header">
      <text class="palm-icon">🖐️</text>
      <text class="title">掌纹算命</text>
      <text class="subtitle">拍一张手掌照片，解读你的命运密码</text>
    </view>

    <!-- 功能介绍卡片 -->
    <view class="intro-card">
      <view class="intro-item">
        <text class="intro-icon">📸</text>
        <view class="intro-text">
          <text class="intro-title">拍照识别</text>
          <text class="intro-desc">拍摄手掌照片，AI自动识别掌纹</text>
        </view>
      </view>
      <view class="intro-item">
        <text class="intro-icon">🔮</text>
        <view class="intro-text">
          <text class="intro-title">六大主线解读</text>
          <text class="intro-desc">生命线、智慧线、感情线等全面分析</text>
        </view>
      </view>
      <view class="intro-item">
        <text class="intro-icon">📤</text>
        <view class="intro-text">
          <text class="intro-title">保存与分享</text>
          <text class="intro-desc">结果可保存为图片，分享给好友</text>
        </view>
      </view>
    </view>

    <!-- 拍照按钮 -->
    <button class="btn-camera" @tap="goToCamera">
      <text class="btn-icon">📷</text>
      <text class="btn-text">拍摄手掌</text>
    </button>

    <!-- 底部提示 -->
    <view class="tips">
      <text class="tips-title">拍摄提示</text>
      <text class="tips-item">· 请在光线充足的环境下拍摄</text>
      <text class="tips-item">· 手掌正对摄像头，五指自然展开</text>
      <text class="tips-item">· 确保掌纹纹路清晰可见</text>
    </view>

    <text class="footer">⚠️ 仅供娱乐参考，命运掌握在自己手中</text>
  </view>
</template>

<script setup lang="ts">
import { appStore } from '@/store/app'
import { checkCameraPermission } from '@/utils/permission'

async function goToCamera() {
  appStore.reset()
  // #ifdef H5
  // H5端无需权限检查，直接跳转（浏览器会自行处理摄像头权限）
  uni.navigateTo({ url: '/pages/camera/camera' })
  // #endif
  // #ifndef H5
  // 小程序/App端需要检查相机权限
  const hasPermission = await checkCameraPermission()
  if (hasPermission) {
    uni.navigateTo({ url: '/pages/camera/camera' })
  } else {
    uni.showToast({ title: '需要相机权限才能拍照', icon: 'none' })
  }
  // #endif
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 30rpx 40rpx;
  min-height: 100vh;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 50rpx;
}

.palm-icon {
  font-size: 100rpx;
  margin-bottom: 16rpx;
}

.title {
  font-size: 56rpx;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 20rpx rgba(255, 215, 0, 0.5);
  margin-bottom: 12rpx;
}

.subtitle {
  font-size: 26rpx;
  color: #b8a0d0;
}

.intro-card {
  width: 100%;
  background: rgba(45, 27, 78, 0.6);
  border: 1rpx solid rgba(255, 215, 0, 0.15);
  border-radius: 20rpx;
  padding: 30rpx 28rpx;
  margin-bottom: 50rpx;
}

.intro-item {
  display: flex;
  align-items: center;
  margin-bottom: 28rpx;
}

.intro-item:last-child {
  margin-bottom: 0;
}

.intro-icon {
  font-size: 44rpx;
  margin-right: 20rpx;
}

.intro-text {
  display: flex;
  flex-direction: column;
}

.intro-title {
  font-size: 30rpx;
  color: #ffd700;
  font-weight: bold;
  margin-bottom: 4rpx;
}

.intro-desc {
  font-size: 24rpx;
  color: #a090c0;
}

.btn-camera {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  color: #1a0a2e;
  border: none;
  border-radius: 50rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 215, 0, 0.3);
}

.btn-icon {
  font-size: 40rpx;
  margin-right: 12rpx;
}

.btn-text {
  font-size: 34rpx;
  font-weight: bold;
}

.tips {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  margin-bottom: 30rpx;
}

.tips-title {
  display: block;
  font-size: 26rpx;
  color: #ffd700;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.tips-item {
  display: block;
  font-size: 24rpx;
  color: #a090c0;
  line-height: 1.8;
}

.footer {
  font-size: 22rpx;
  color: #8060a0;
  text-align: center;
}
</style>
