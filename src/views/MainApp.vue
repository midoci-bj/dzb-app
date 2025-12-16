<template>
  <div class="main-app-page">
    1111
    <button @click="handleLogout">退出</button>
  </div>
</template>

<script >

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
    this.getToken()
  },
  methods: {
    async getToken(){
    const tokenData = await window.electronAPI.getLoginToken();
      console.log('tokenData',tokenData)
    },
    async handleLogout() {
      // 通知主进程删除 token 文件（需在主进程新增 logout IPC 处理）
      await window.electronAPI.logout();
      // 跳转到登录页
      this.$router.push({ name: 'Login' });
    },
  }
};
</script>

<style scoped></style>