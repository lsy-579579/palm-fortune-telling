<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('掌纹算命小程序启动')
})
</script>

<style>
/* 全局样式 */
page {
  background: linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a0a2e 100%);
  color: #e8d5f0;
  font-family: -apple-system, "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif;
}

/* 所有页面默认背景 */
view, text {
  box-sizing: border-box;
}
</style>
