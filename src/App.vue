<template>
  <div class="dzb-box">
    <router-view />
  </div>

</template>

<script>
export default {
  data() {
    return {
      // type: "",
      // size: 23,
      // color: "#333",
      className: "",
    };
  },
  created() {
    // console.log('type',this.type)
  },
  methods: {
    async handleLogout (){
      // 通知主进程删除 token 文件（需在主进程新增 logout IPC 处理）
      await window.electronAPI.logout();
      // 跳转到登录页
      router.push({ name: 'Login' });
    },
    // 最小化窗口（Electron原生实现）
    minimizeWindow() {
      if (window.electronAPI) {
        window.electronAPI.minimizeWindow()
      } else {
        alert('窗口已最小化（开发环境模拟）')
      }
    },

    // 关闭窗口
    closeWindow() {
      if (confirm('确定要关闭吗？')) {
        if (window.electronAPI) {
          window.electronAPI.closeWindow()
        } else {
          installWindow.value.style.display = 'none'
        }
      }
    }
  }
};


</script>

<style scoped>
/* 原有样式保持不变 */
.dzb-box {
  width: 100vw;
  height: 100vh;
  background: #fff;
}
</style>