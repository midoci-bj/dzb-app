// preload.js
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // 原有方法
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
  getDefaultPath: () => ipcRenderer.invoke('get-default-path'),
  setAutoStart: (enable) => ipcRenderer.invoke('set-auto-start', enable),
    // 打开浏览器登录页
  openLoginPage: () => ipcRenderer.invoke('open-login-page'),
  // 获取本地登录凭证
  getLoginToken: () => ipcRenderer.invoke('get-login-token'),
  // 监听登录成功事件
  onLoginSuccess: (callback) => ipcRenderer.on('login-success', (event, data) => callback(data)),
    logout: () => ipcRenderer.invoke('logout'),
})