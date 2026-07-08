<template>
  <view class="container">
    <!-- 相机预览 -->
    <camera
      class="camera"
      device-position="back"
      flash="off"
      resolution="high"
      @error="onCameraError"
      @initdone="onCameraInit"
    >
      <!-- 引导遮罩层 -->
      <cover-view class="guide-overlay">
        <!-- 手掌轮廓引导框 -->
        <cover-view class="guide-frame">
          <cover-view class="frame-corner top-left"></cover-view>
          <cover-view class="frame-corner top-right"></cover-view>
          <cover-view class="frame-corner bottom-left"></cover-view>
          <cover-view class="frame-corner bottom-right"></cover-view>
        </cover-view>
        <cover-view class="guide-text">请将手掌放入框内</cover-view>
        <cover-view class="guide-subtext">五指自然展开，掌心朝向摄像头</cover-view>
      </cover-view>
    </camera>

    <!-- 底部操作区 -->
    <view class="bottom-bar">
      <view class="tips-bar">
        <text class="tip-text">💡 确保光线充足 · 掌纹清晰可见</text>
      </view>
      <view class="action-bar">
        <view class="action-btn-secondary" @tap="goBack">
          <text class="action-text">返回</text>
        </view>
        <view class="shutter-btn" @tap="takePhoto">
          <view class="shutter-inner"></view>
        </view>
        <view class="action-btn-secondary" @tap="toggleFlash">
          <text class="action-text">{{ flashIcon }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import { appStore } from '@/store/app'
import type { ComponentPublicInstance } from 'vue'

const instance = getCurrentInstance()
const flashMode = ref('off')
const flashIcon = ref('⚡️')

function onCameraError(e: any) {
  console.error('相机错误:', e.detail)
  uni.showModal({
    title: '相机无法启动',
    content: '请检查相机权限是否已开启，或尝试重新进入页面',
    showCancel: false,
    success() {
      uni.navigateBack()
    },
  })
}

function onCameraInit(e: any) {
  console.log('相机初始化完成, maxZoom:', e.detail.maxZoom)
}

function takePhoto() {
  const ctx = uni.createCameraContext()
  uni.showLoading({ title: '拍摄中...' })

  ctx.takePhoto({
    quality: 'high',
    success: (res) => {
      uni.hideLoading()
      appStore.setCapturedImage(res.tempImagePath)
      uni.navigateTo({ url: '/pages/analysis/analysis' })
    },
    fail: (err) => {
      uni.hideLoading()
      console.error('拍照失败:', err)
      uni.showToast({ title: '拍照失败，请重试', icon: 'none' })
    },
  })
}

function toggleFlash() {
  if (flashMode.value === 'off') {
    flashMode.value = 'torch'
    flashIcon.value = '🔦'
  } else {
    flashMode.value = 'off'
    flashIcon.value = '⚡️'
  }
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #000;
}

.camera {
  width: 100%;
  flex: 1;
}

/* 引导遮罩 */
.guide-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 手掌引导框 */
.guide-frame {
  width: 500rpx;
  height: 600rpx;
  position: relative;
  border: 4rpx dashed rgba(255, 215, 0, 0.5);
  border-radius: 20rpx;
}

.frame-corner {
  position: absolute;
  width: 40rpx;
  height: 40rpx;
  border-color: #ffd700;
  border-style: solid;
  border-width: 0;
}

.top-left {
  top: -4rpx;
  left: -4rpx;
  border-top-width: 8rpx;
  border-left-width: 8rpx;
  border-top-left-radius: 12rpx;
}

.top-right {
  top: -4rpx;
  right: -4rpx;
  border-top-width: 8rpx;
  border-right-width: 8rpx;
  border-top-right-radius: 12rpx;
}

.bottom-left {
  bottom: -4rpx;
  left: -4rpx;
  border-bottom-width: 8rpx;
  border-left-width: 8rpx;
  border-bottom-left-radius: 12rpx;
}

.bottom-right {
  bottom: -4rpx;
  right: -4rpx;
  border-bottom-width: 8rpx;
  border-right-width: 8rpx;
  border-bottom-right-radius: 12rpx;
}

.guide-text {
  margin-top: 40rpx;
  font-size: 32rpx;
  color: #ffd700;
  font-weight: bold;
}

.guide-subtext {
  margin-top: 10rpx;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
}

/* 底部操作区 */
.bottom-bar {
  background: rgba(0, 0, 0, 0.85);
  padding: 20rpx 30rpx 50rpx;
}

.tips-bar {
  text-align: center;
  margin-bottom: 30rpx;
}

.tip-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.action-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
}

.action-btn-secondary {
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.shutter-btn {
  width: 130rpx;
  height: 130rpx;
  border-radius: 50%;
  border: 8rpx solid #ffd700;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 215, 0, 0.1);
}

.shutter-inner {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #ffd700;
}
</style>
