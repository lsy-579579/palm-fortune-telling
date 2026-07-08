// 用户选择状态管理（简单模块模式）

export const selectionStore = {
  life: '' as string,
  head: '' as string,
  heart: '' as string,

  set(line: string, value: string) {
    ;(this as any)[line] = value
  },

  get(line: string): string {
    return (this as any)[line] || ''
  },

  isAllSelected(): boolean {
    return !!(this.life && this.head && this.heart)
  },

  reset() {
    this.life = ''
    this.head = ''
    this.heart = ''
  },
}
