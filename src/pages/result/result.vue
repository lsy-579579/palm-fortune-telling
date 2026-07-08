<template>
  <view class="container">
    <!-- 隐藏 Canvas，用于生成结果图片 -->
    <canvas
      canvas-id="resultCanvas"
      id="resultCanvas"
      style="width: 340px; height: 600px; position: fixed; left: -9999px; top: -9999px;"
    ></canvas>

    <!-- 掌纹照片预览 -->
    <view class="photo-section" v-if="appStore.capturedImagePath">
      <image class="palm-photo" :src="appStore.capturedImagePath" mode="aspectFill"></image>
      <view class="photo-badge">
        <text class="badge-text">📸 已分析</text>
      </view>
    </view>

    <!-- 综合运势 -->
    <view class="overall-section" v-if="result">
      <text class="overall-title">综合运势</text>
      <view class="score-display">
        <text class="score-number">{{ result.overallScore }}</text>
        <text class="score-unit">分</text>
      </view>
      <text class="fortune-level">{{ result.fortuneLevel }}</text>
      <text class="fortune-desc">{{ result.fortuneDesc }}</text>
      <view class="score-bar">
        <view class="score-fill" :style="{ width: result.overallScore + '%' }"></view>
      </view>
    </view>

    <!-- 四维运势 -->
    <view class="dimensions-section" v-if="result">
      <view class="dimension-card">
        <text class="dim-icon">💼</text>
        <text class="dim-title">事业运</text>
        <text class="dim-text">{{ result.career }}</text>
      </view>
      <view class="dimension-card">
        <text class="dim-icon">❤️</text>
        <text class="dim-title">爱情运</text>
        <text class="dim-text">{{ result.love }}</text>
      </view>
      <view class="dimension-card">
        <text class="dim-icon">🏃</text>
        <text class="dim-title">健康运</text>
        <text class="dim-text">{{ result.health }}</text>
      </view>
      <view class="dimension-card">
        <text class="dim-icon">💰</text>
        <text class="dim-title">财运</text>
        <text class="dim-text">{{ result.wealth }}</text>
      </view>
    </view>

    <!-- 六大主线解读 -->
    <view class="lines-section" v-if="result">
      <text class="section-title">📜 六大主线解读</text>
      <view class="line-card" v-for="line in result.lines" :key="line.type">
        <view class="line-header">
          <text class="line-icon">{{ line.icon }}</text>
          <view class="line-info">
            <text class="line-title">{{ line.title }}</text>
            <view class="line-score-bar">
              <view class="line-score-fill" :style="{ width: line.score + '%' }"></view>
            </view>
          </view>
          <text class="line-score-text">{{ line.score }}</text>
        </view>
        <text class="line-desc">{{ line.desc }}</text>
      </view>
    </view>

    <!-- 综合总结 -->
    <view class="summary-section" v-if="result">
      <text class="section-title">🔮 综合总结</text>
      <view class="summary-card">
        <text class="summary-text">{{ result.summary }}</text>
        <text class="summary-date">📅 {{ result.date }}</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="actions-section">
      <button class="btn-save" @tap="saveResultImage">
        <text class="btn-icon">💾</text>
        <text class="btn-text">保存结果图片</text>
      </button>
      <button class="btn-share" open-type="share">
        <text class="btn-icon">📤</text>
        <text class="btn-text">分享给好友</text>
      </button>
      <button class="btn-restart" @tap="goRestart">
        <text class="btn-icon">🔄</text>
        <text class="btn-text">重新算命</text>
      </button>
    </view>

    <text class="footer">⚠️ 仅供娱乐参考，命运掌握在自己手中</text>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { appStore } from '@/store/app'
import { saveImageToAlbum } from '@/utils/permission'
import { onShareAppMessage } from '@dcloudio/uni-app'
import type { PalmReadingResult } from '@/utils/palmData'

const instance = getCurrentInstance()
const result = ref<PalmReadingResult | null>(null)
const isGenerating = ref(false)

onMounted(() => {
  result.value = appStore.readingResult
  if (!result.value) {
    // 如果没有结果，返回首页
    uni.reLaunch({ url: '/pages/index/index' })
  }
})

// 分享配置
onShareAppMessage(() => {
  return {
    title: `我的掌纹运势：${result.value?.overallScore}分 · ${result.value?.fortuneLevel}`,
    path: '/pages/index/index',
  }
})

// 保存结果为图片
async function saveResultImage() {
  if (!result.value || isGenerating.value) return
  isGenerating.value = true
  uni.showLoading({ title: '生成图片中...' })

  try {
    const tempPath = await drawResultToCanvas()
    const success = await saveImageToAlbum(tempPath)
    if (success) {
      uni.showToast({ title: '已保存到相册', icon: 'success' })
    } else {
      uni.showToast({ title: '保存失败，请重试', icon: 'none' })
    }
  } catch (error) {
    console.error('保存失败:', error)
    uni.showToast({ title: '生成图片失败', icon: 'none' })
  } finally {
    isGenerating.value = false
    uni.hideLoading()
  }
}

// 使用 Canvas 绘制结果图片
function drawResultToCanvas(): Promise<string> {
  return new Promise((resolve, reject) => {
    const ctx = uni.createCanvasContext('resultCanvas', instance?.proxy)
    const W = 340
    const H = 600
    const res = result.value!

    // 背景
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, '#1a0a2e')
    grad.addColorStop(0.5, '#2d1b4e')
    grad.addColorStop(1, '#1a0a2e')
    ctx.setFillStyle(grad)
    ctx.fillRect(0, 0, W, H)

    // 标题
    ctx.setFillStyle('#ffd700')
    ctx.setFontSize(28)
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText('🔮 掌纹算命结果', 80, 50)

    // 分隔线
    ctx.setStrokeStyle('rgba(255, 215, 0, 0.3)')
    ctx.setLineWidth(1)
    ctx.beginPath()
    ctx.moveTo(30, 70)
    ctx.lineTo(W - 30, 70)
    ctx.stroke()

    // 综合运势
    ctx.setFillStyle('#ffd700')
    ctx.setFontSize(18)
    ctx.fillText('综合运势', 30, 100)

    ctx.setFillStyle('#ffd700')
    ctx.setFontSize(48)
    ctx.fillText(`${res.overallScore}`, 30, 150)
    ctx.setFontSize(16)
    ctx.setFillStyle('#b8a0d0')
    ctx.fillText('分', 90, 150)

    ctx.setFontSize(16)
    ctx.setFillStyle('#ffd700')
    ctx.fillText(res.fortuneLevel, 130, 150)

    // 进度条
    ctx.setFillStyle('rgba(255, 255, 255, 0.1)')
    ctx.fillRect(30, 165, W - 60, 12)
    const fillGrad = ctx.createLinearGradient(30, 0, W - 30, 0)
    fillGrad.addColorStop(0, '#ff4444')
    fillGrad.addColorStop(0.5, '#ffd700')
    fillGrad.addColorStop(1, '#44ff44')
    ctx.setFillStyle(fillGrad)
    ctx.fillRect(30, 165, (W - 60) * res.overallScore / 100, 12)

    // 四维运势
    let y = 200
    const dimensions = [
      { icon: '💼', title: '事业运', text: res.career },
      { icon: '❤️', title: '爱情运', text: res.love },
      { icon: '🏃', title: '健康运', text: res.health },
      { icon: '💰', title: '财运', text: res.wealth },
    ]

    for (const dim of dimensions) {
      ctx.setFillStyle('#ffd700')
      ctx.setFontSize(16)
      ctx.fillText(`${dim.icon} ${dim.title}`, 30, y)
      y += 22
      ctx.setFillStyle('#d0c0e0')
      ctx.setFontSize(12)
      // 截断长文本
      const text = dim.text.length > 38 ? dim.text.substring(0, 38) + '...' : dim.text
      ctx.fillText(text, 30, y)
      y += 20
      // 第二行
      if (dim.text.length > 38) {
        const text2 = dim.text.substring(38, 76)
        ctx.fillText(text2.length > 38 ? text2.substring(0, 38) + '...' : text2, 30, y)
        y += 20
      }
      y += 8
    }

    // 分隔线
    ctx.setStrokeStyle('rgba(255, 215, 0, 0.3)')
    ctx.beginPath()
    ctx.moveTo(30, y)
    ctx.lineTo(W - 30, y)
    ctx.stroke()
    y += 25

    // 六大主线
    ctx.setFillStyle('#ffd700')
    ctx.setFontSize(18)
    ctx.fillText('📜 六大主线', 30, y)
    y += 25

    for (const line of res.lines) {
      ctx.setFillStyle('#ffd700')
      ctx.setFontSize(14)
      ctx.fillText(`${line.icon} ${line.title}`, 30, y)
      ctx.setFillStyle('#b8a0d0')
      ctx.setFontSize(12)
      ctx.fillText(`${line.score}分`, W - 60, y)
      y += 18
    }

    y += 15
    // 分隔线
    ctx.setStrokeStyle('rgba(255, 215, 0, 0.3)')
    ctx.beginPath()
    ctx.moveTo(30, y)
    ctx.lineTo(W - 30, y)
    ctx.stroke()
    y += 25

    // 总结
    ctx.setFillStyle('#ffd700')
    ctx.setFontSize(16)
    ctx.fillText('🔮 综合总结', 30, y)
    y += 22
    ctx.setFillStyle('#d0c0e0')
    ctx.setFontSize(12)
    const summaryLines = wrapText(res.summary, 42)
    for (const sl of summaryLines) {
      ctx.fillText(sl, 30, y)
      y += 18
    }

    y += 15
    ctx.setFillStyle('#8060a0')
    ctx.setFontSize(11)
    ctx.fillText(`📅 ${res.date}`, 30, y)
    y += 20
    ctx.fillText('⚠️ 仅供娱乐参考，命运掌握在自己手中', 30, y)

    // 绘制并导出
    ctx.draw(false, () => {
      setTimeout(() => {
        uni.canvasToTempFilePath({
          canvasId: 'resultCanvas',
          width: W,
          height: H,
          destWidth: W * 2,
          destHeight: H * 2,
          fileType: 'png',
          quality: 1,
          success: (exportRes) => {
            resolve(exportRes.tempFilePath)
          },
          fail: (err) => {
            console.error('导出图片失败:', err)
            reject(err)
          },
        }, instance?.proxy)
      }, 300)
    })
  })
}

// 文本换行辅助
function wrapText(text: string, maxLen: number): string[] {
  const lines: string[] = []
  let current = ''
  for (const char of text) {
    current += char
    if (current.length >= maxLen) {
      lines.push(current)
      current = ''
    }
  }
  if (current) lines.push(current)
  return lines.slice(0, 5) // 最多5行
}

function goRestart() {
  appStore.reset()
  uni.reLaunch({ url: '/pages/index/index' })
}
</script>

<style scoped>
.container {
  padding: 0 0 60rpx;
  min-height: 100vh;
}

/* 照片预览 */
.photo-section {
  position: relative;
  width: 100%;
  height: 400rpx;
  overflow: hidden;
}

.palm-photo {
  width: 100%;
  height: 100%;
}

.photo-badge {
  position: absolute;
  bottom: 20rpx;
  right: 20rpx;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 20rpx;
  padding: 8rpx 20rpx;
}

.badge-text {
  font-size: 24rpx;
  color: #ffd700;
}

/* 综合运势 */
.overall-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 30rpx;
  background: rgba(45, 27, 78, 0.6);
  margin: 0 20rpx;
  margin-top: -40rpx;
  border-radius: 20rpx;
  position: relative;
  z-index: 1;
}

.overall-title {
  font-size: 30rpx;
  color: #ffd700;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.score-display {
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.score-number {
  font-size: 80rpx;
  color: #ffd700;
  font-weight: bold;
  text-shadow: 0 0 20rpx rgba(255, 215, 0, 0.5);
}

.score-unit {
  font-size: 30rpx;
  color: #b8a0d0;
  margin-left: 8rpx;
}

.fortune-level {
  font-size: 32rpx;
  color: #ffd700;
  font-weight: bold;
  margin: 16rpx 0 8rpx;
}

.fortune-desc {
  font-size: 26rpx;
  color: #d0c0e0;
  text-align: center;
  margin-bottom: 20rpx;
}

.score-bar {
  width: 100%;
  height: 20rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10rpx;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff4444, #ffd700, #44ff44);
  border-radius: 10rpx;
  transition: width 1s ease;
}

/* 四维运势 */
.dimensions-section {
  padding: 0 20rpx;
  margin-top: 30rpx;
}

.dimension-card {
  background: rgba(45, 27, 78, 0.4);
  border-left: 6rpx solid #ffd700;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.dim-icon {
  font-size: 36rpx;
}

.dim-title {
  display: block;
  font-size: 30rpx;
  color: #ffd700;
  font-weight: bold;
  margin: 8rpx 0;
}

.dim-text {
  font-size: 26rpx;
  color: #d0c0e0;
  line-height: 1.6;
}

/* 六大主线 */
.lines-section {
  padding: 0 20rpx;
  margin-top: 30rpx;
}

.section-title {
  display: block;
  font-size: 34rpx;
  color: #ffd700;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.line-card {
  background: rgba(45, 27, 78, 0.4);
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.line-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12rpx;
}

.line-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.line-info {
  flex: 1;
}

.line-title {
  font-size: 28rpx;
  color: #ffd700;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.line-score-bar {
  width: 100%;
  height: 8rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4rpx;
  overflow: hidden;
}

.line-score-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff8c00, #ffd700);
  border-radius: 4rpx;
}

.line-score-text {
  font-size: 28rpx;
  color: #ffd700;
  font-weight: bold;
  margin-left: 16rpx;
}

.line-desc {
  font-size: 25rpx;
  color: #d0c0e0;
  line-height: 1.6;
}

/* 综合总结 */
.summary-section {
  padding: 0 20rpx;
  margin-top: 30rpx;
}

.summary-card {
  background: rgba(45, 27, 78, 0.4);
  border: 1rpx solid rgba(255, 215, 0, 0.2);
  border-radius: 12rpx;
  padding: 24rpx;
}

.summary-text {
  font-size: 26rpx;
  color: #d0c0e0;
  line-height: 1.8;
  margin-bottom: 12rpx;
}

.summary-date {
  font-size: 24rpx;
  color: #8060a0;
}

/* 操作按钮 */
.actions-section {
  padding: 0 20rpx;
  margin-top: 40rpx;
}

.btn-save, .btn-share, .btn-restart {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 90rpx;
  border: none;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.btn-save {
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  color: #1a0a2e;
}

.btn-share {
  background: rgba(255, 215, 0, 0.15);
  color: #ffd700;
  border: 2rpx solid rgba(255, 215, 0, 0.4);
}

.btn-restart {
  background: rgba(255, 255, 255, 0.05);
  color: #b8a0d0;
  border: 2rpx solid rgba(255, 255, 255, 0.1);
}

.btn-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.btn-text {
  font-size: 30rpx;
  font-weight: bold;
}

.footer {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: #8060a0;
  margin-top: 30rpx;
}
</style>
