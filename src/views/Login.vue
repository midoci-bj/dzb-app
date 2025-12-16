<template>
  <div class="login-container">
    <h1>定制宝 - 登录</h1>
    <button @click="handleLogin" class="login-btn">
      点击登录（跳转到浏览器）
    </button>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { redirectToMainApp } from '../router'; // 导入跳转方法

// 打开浏览器登录页
const handleLogin = async () => {
  await window.electronAPI.openLoginPage();
};

// 监听登录成功事件（来自 Electron 主进程）
const handleLoginSuccess = () => {
  // 登录成功后跳转到主页面
  redirectToMainApp();
};

onMounted(() => {
  // 注册监听
  window.electronAPI.onLoginSuccess(handleLoginSuccess);
});

</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.login-btn {
  padding: 12px 24px;
  font-size: 16px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>