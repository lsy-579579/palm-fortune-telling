<template>
  <view class="container">
    <!-- #ifdef MP-WEIXIN || MP-TOUTIAO || MP-BAIDU || MP-ALIPAY || MP-QQ || MP-KUAISHOU || APP-PLUS -->
    <!-- 小程序/App端：使用 camera 组件 -->
    <camera
      class="camera"
      device-position="back"
      flash="off"
      resolution="high"
      @error="onCameraError"
      @initdone="onCameraInit"
    >
      <cover-view class="guide-overlay">
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
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <!-- H5端：用原生DOM动态创建video，绕过uni-app组件包装 -->
    <view class="h5-camera-page">
      <!-- 摄像头实时预览容器（JS动态注入原生video元素） -->
      <view class="h5-video-wrapper" id="videoContainer">
        <!-- 引导遮罩层 -->
        <view class="h5-guide-overlay" v-if="cameraReady">
          <view class="h5-guide-frame">
            <view class="frame-corner top-left"></view>
            <view class="frame-corner top-right"></view>
            <view class="frame-corner bottom-left"></view>
            <view class="frame-corner bottom-right"></view>
          </view>
          <text class="h5-guide-text">请将手掌放入框内</text>
          <text class="h5-guide-subtext">五指自然展开，掌心朝向摄像头</text>
        </view>

        <!-- 加载中提示 -->
        <view class="h5-loading" v-if="!cameraReady && !cameraError">
          <view class="h5-spinner"></view>
          <text class="h5-loading-text">正在启动摄像头...</text>
        </view>

        <!-- 错误提示 -->
        <view class="h5-error" v-if="cameraError">
          <text class="h5-error-icon">📷</text>
          <text class="h5-error-title">摄像头无法启动</text>
          <text class="h5-error-desc">{{ cameraErrorMsg }}</text>
          <view class="h5-error-btn" @tap="retryCamera">重试</view>
          <view class="h5-error-btn-secondary" @tap="chooseFromAlbum">从相册选择</view>
        </view>
      </view>

      <!-- 底部操作区 -->
      <view class="h5-bottom-bar" v-if="cameraReady">
        <view class="tips-bar">
          <text class="tip-text">💡 确保光线充足 · 掌纹清晰可见</text>
        </view>
        <view class="action-bar">
          <view class="action-btn-secondary" @tap="goBack">
            <text class="action-text">返回</text>
          </view>
          <view class="shutter-btn" @tap="takePhotoH5">
            <view class="shutter-inner"></view>
          </view>
          <view class="action-btn-secondary" @tap="chooseFromAlbum">
            <text class="action-text">相册</text>
          </view>
        </view>
      </view>
    </view>
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import { appStore } from '@/store/app'

const flashMode = ref('off')
const flashIcon = ref('⚡️')

// #ifdef H5
const cameraReady = ref(false)
const cameraError = ref(false)
const cameraErrorMsg = ref('')
let mediaStream: MediaStream | null = null
let videoEl: HTMLVideoElement | null = null

// 启动摄像头
async function startCamera() {
  cameraError.value = false
  cameraReady.value = false
  cameraErrorMsg.value = ''

  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      cameraError.value = true
      cameraErrorMsg.value = '当前浏览器不支持摄像头功能，请使用最新版 Chrome 或 Safari 浏览器'
      return
    }

    // 请求后置摄像头，失败则尝试任意摄像头
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
    } catch (e: any) {
      // 后置不可用，退而求其次
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })
    }

    // 等待 DOM 渲染
    await new Promise(resolve => setTimeout(resolve, 200))

    // 动态创建原生 video 元素，避免 uni-app video 组件包装
    const container = document.getElementById('videoContainer')
    if (!container) {
      cameraError.value = true
      cameraErrorMsg.value = '页面初始化失败，请重试'
      return
    }

    // 清除旧的 video
    const oldVideo = container.querySelector('video')
    if (oldVideo) oldVideo.remove()

    // 创建原生 video 元素
    videoEl = document.createElement('video')
    videoEl.autoplay = true
    videoEl.playsInline = true
    (videoEl as any).webkitPlaysinline = true
    videoEl.muted = true
    videoEl.style.width = '100%'
    videoEl.style.height = '100%'
    videoEl.style.objectFit = 'cover'
    videoEl.style.display = 'block'
    videoEl.style.position = 'absolute'
    videoEl.style.top = '0'
    videoEl.style.left = '0'
    videoEl.srcObject = mediaStream

    // 插入到容器最前面（在引导遮罩之前）
    container.insertBefore(videoEl, container.firstChild)

    // 等待视频开始播放
    videoEl.onloadedmetadata = () => {
      videoEl!.play().then(() => {
        cameraReady.value = true
      }).catch((playErr) => {
        console.error('视频播放失败:', playErr)
        cameraError.value = true
        cameraErrorMsg.value = '视频播放失败，请检查浏览器权限设置'
      })
    }

    videoEl.onerror = () => {
      cameraError.value = true
      cameraErrorMsg.value = '视频加载失败，请重试'
    }

  } catch (err: any) {
    console.error('摄像头启动失败:', err)
    cameraError.value = true
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      cameraErrorMsg.value = '摄像头权限被拒绝，请在浏览器设置中允许使用摄像头后重试'
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      cameraErrorMsg.value = '未检测到摄像头设备'
    } else if (err.name === 'NotReadableError') {
      cameraErrorMsg.value = '摄像头被其他程序占用，请关闭后重试'
    } else {
      cameraErrorMsg.value = '摄像头启动失败：' + (err.message || '未知错误')
    }
  }
}

// H5 拍照：从 video 截取一帧
function takePhotoH5() {
  if (!cameraReady.value || !videoEl) {
    uni.showToast({ title: '摄像头未就绪', icon: 'none' })
    return
  }

  const canvas = document.createElement('canvas')
  canvas.width = videoEl.videoWidth || 1280
  canvas.height = videoEl.videoHeight || 720

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    uni.showToast({ title: '拍照失败', icon: 'none' })
    return
  }

  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)

  uni.showLoading({ title: '拍摄中...' })
  canvas.toBlob((blob) => {
    uni.hideLoading()
    if (blob) {
      const tempPath = URL.createObjectURL(blob)
      appStore.setCapturedImage(tempPath)
      stopCamera()
      uni.navigateTo({ url: '/pages/analysis/analysis' })
    } else {
      uni.showToast({ title: '拍照失败，请重试', icon: 'none' })
    }
  }, 'image/jpeg', 0.92)
}

// 停止摄像头
function stopCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  if (videoEl) {
    videoEl.srcObject = null
    videoEl.remove()
    videoEl = null
  }
  cameraReady.value = false
}

// 重试
function retryCamera() {
  stopCamera()
  setTimeout(() => startCamera(), 300)
}

// 从相册选择
function chooseFromAlbum() {
  stopCamera()
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: any) => {
    const file = e.target.files[0]
    if (file) {
      const tempPath = URL.createObjectURL(file)
      appStore.setCapturedImage(tempPath)
      uni.navigateTo({ url: '/pages/analysis/analysis' })
    }
  }
  input.click()
}

onMounted(() => {
  startCamera()
})

onUnmounted(() => {
  stopCamera()
})
// #endif

// 小程序端
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
  // #ifdef H5
  stopCamera()
  // #endif
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

/* 小程序端 */
.camera {
  width: 100%;
  flex: 1;
}

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

.guide-frame {
  width: 500rpx;
  height: 600rpx;
  position: relative;
  border: 4rpx dashed rgba(255, 215, 0, 0.5);
  border-radius: 20rpx;
}

/* H5 端 */
.h5-camera-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #000;
}

.h5-video-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #000;
}

.h5-guide-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
}

.h5-guide-frame {
  width: 70vw;
  max-width: 320px;
  height: 50vh;
  max-height: 420px;
  position: relative;
  border: 3px dashed rgba(255, 215, 0, 0.5);
  border-radius: 16px;
}

.h5-guide-text {
  margin-top: 20px;
  font-size: 18px;
  color: #ffd700;
  font-weight: bold;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
}

.h5-guide-subtext {
  margin-top: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
}

.h5-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #1a0a2e;
  z-index: 20;
}

.h5-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 215, 0, 0.2);
  border-top-color: #ffd700;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

.h5-loading-text {
  font-size: 15px;
  color: #b8a0d0;
}

.h5-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #1a0a2e;
  padding: 30px;
  z-index: 20;
}

.h5-error-icon {
  font-size: 50px;
  margin-bottom: 16px;
}

.h5-error-title {
  font-size: 20px;
  color: #ffd700;
  font-weight: bold;
  margin-bottom: 10px;
}

.h5-error-desc {
  font-size: 14px;
  color: #b8a0d0;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 24px;
}

.h5-error-btn {
  padding: 12px 40px;
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  color: #1a0a2e;
  font-size: 16px;
  font-weight: bold;
  border-radius: 25px;
  margin-bottom: 12px;
}

.h5-error-btn-secondary {
  padding: 10px 36px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffd700;
  font-size: 15px;
  border-radius: 25px;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

/* 角标 */
.frame-corner {
  position: absolute;
  width: 24px;
  height: 24px;
  border-color: #ffd700;
  border-style: solid;
  border-width: 0;
}

.top-left { top: -3px; left: -3px; border-top-width: 5px; border-left-width: 5px; border-top-left-radius: 8px; }
.top-right { top: -3px; right: -3px; border-top-width: 5px; border-right-width: 5px; border-top-right-radius: 8px; }
.bottom-left { bottom: -3px; left: -3px; border-bottom-width: 5px; border-left-width: 5px; border-bottom-left-radius: 8px; }
.bottom-right { bottom: -3px; right: -3px; border-bottom-width: 5px; border-right-width: 5px; border-bottom-right-radius: 8px; }

/* 底部操作区 */
.bottom-bar, .h5-bottom-bar {
  background: rgba(0, 0, 0, 0.85);
  padding: 16px 24px 40px;
}

.tips-bar { text-align: center; margin-bottom: 24px; }
.tip-text { font-size: 13px; color: rgba(255, 255, 255, 0.5); }

.action-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
}

.action-btn-secondary { width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; }
.action-text { font-size: 14px; color: rgba(255, 255, 255, 0.7); }

.shutter-btn {
  width: 70px; height: 70px; border-radius: 50%;
  border: 4px solid #ffd700;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255, 215, 0, 0.1);
}

.shutter-inner { width: 54px; height: 54px; border-radius: 50%; background: #ffd700; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
