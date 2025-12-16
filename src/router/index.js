import { createRouter, createWebHashHistory } from 'vue-router'
import MainApp from '../views/MainApp.vue'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresGuest: true // 标记：仅未登录用户可访问
    }
  },
  {
    path: '/',
    name: 'MainApp',
    component: MainApp,
    meta: {
      requiresAuth: true // 标记：需登录才能访问
    }
  },
  // 兜底路由：匹配不到的路径跳转到登录页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 封装：获取并校验登录状态（同步/异步都兼容）
async function checkLoginStatus() {
  try {
    // 调用 Electron 主进程的 API 获取本地 token
    const tokenData = await window.electronAPI.getLoginToken();
    // 校验：token 存在 + 未过期
    return !!tokenData && tokenData.expireTime > new Date().getTime();
  } catch (error) {
    console.error('校验登录状态失败：', error);
    return false;
  }
}

// 全局前置路由守卫
router.beforeEach(async (to, from, next) => {
  // 1. 获取登录状态
  const isLoggedIn = await checkLoginStatus();

  // 2. 处理「需要登录」的路由（如主页面）
  if (to.meta.requiresAuth) {
    if (isLoggedIn) {
      // 已登录 → 放行
      next();
    } else {
      // 未登录 → 跳转到登录页
      next({ name: 'Login' });
    }
  } 
  // 3. 处理「仅未登录可访问」的路由（如登录页）
  else if (to.meta.requiresGuest) {
    if (isLoggedIn) {
      // 已登录 → 跳转到主页面
      next({ name: 'MainApp' });
    } else {
      // 未登录 → 放行
      next();
    }
  } 
  // 4. 其他路由（兜底）
  else {
    next(isLoggedIn ? { name: 'MainApp' } : { name: 'Login' });
  }
});

// 可选：登录成功后主动跳转的辅助方法（可在 Login.vue 中调用）
export function redirectToMainApp() {
  router.push({ name: 'MainApp' });
}

export default router