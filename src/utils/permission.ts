/**
 * 权限管理工具
 * 处理小程序中的相机权限和相册权限
 * 兼容微信小程序和抖音小程序
 */

/**
 * 检查并请求相机权限
 */
export function checkCameraPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    uni.getSetting({
      success(res) {
        const cameraAuth = res.authSetting['scope.camera']
        if (cameraAuth === true) {
          resolve(true)
        } else if (cameraAuth === false) {
          // 曾经拒绝，需要引导用户去设置
          uni.showModal({
            title: '需要相机权限',
            content: '掌纹算命需要使用相机拍摄手掌照片，是否前往设置开启权限？',
            confirmText: '去设置',
            cancelText: '取消',
            success(modalRes) {
              if (modalRes.confirm) {
                uni.openSetting({
                  success(settingRes) {
                    resolve(!!settingRes.authSetting['scope.camera'])
                  },
                  fail() {
                    resolve(false)
                  },
                })
              } else {
                resolve(false)
              }
            },
          })
        } else {
          // 首次使用，发起授权
          uni.authorize({
            scope: 'scope.camera',
            success() {
              resolve(true)
            },
            fail() {
              resolve(false)
            },
          })
        }
      },
      fail() {
        resolve(false)
      },
    })
  })
}

/**
 * 保存图片到相册（带权限处理）
 * 注意：抖音平台的相册权限 scope 为 scope.album，其他平台为 scope.writePhotosAlbum
 */
export function saveImageToAlbum(filePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    uni.saveImageToPhotosAlbum({
      filePath,
      success() {
        resolve(true)
      },
      fail(err) {
        // 如果是权限问题，引导用户去设置
        if (err.errMsg && err.errMsg.indexOf('auth deny') > -1) {
          uni.showModal({
            title: '需要相册权限',
            content: '保存图片需要相册写入权限，是否前往设置开启？',
            confirmText: '去设置',
            cancelText: '取消',
            success(modalRes) {
              if (modalRes.confirm) {
                uni.openSetting({
                  success(settingRes) {
                    // 抖音用 scope.album，其他用 scope.writePhotosAlbum
                    const albumScope =
                      settingRes.authSetting['scope.writePhotosAlbum'] ||
                      settingRes.authSetting['scope.album']
                    if (albumScope) {
                      // 重新保存
                      uni.saveImageToPhotosAlbum({
                        filePath,
                        success() {
                          resolve(true)
                        },
                        fail() {
                          resolve(false)
                        },
                      })
                    } else {
                      resolve(false)
                    }
                  },
                })
              } else {
                resolve(false)
              }
            },
          })
        } else {
          resolve(false)
        }
      },
    })
  })
}
