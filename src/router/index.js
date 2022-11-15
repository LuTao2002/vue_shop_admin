import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('@/components/Login')
  },
  {
    path: '/home',
    redirect: '/welcome',
    component: () => import('@/components/Home'),
    children: [
      {
        path: '/welcome',
        component: () => import('@/components/Welcome')
      },
      {
        path: '/users',
        component: () => import('@/components/user/Users')
      },
      {
        path: '/rights',
        component: () => import('@/components/power/Rights')
      },
      {
        path: '/roles',
        component: () => import('@/components/power/Roles')
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 说将要访问的路径
  // from 代表从哪一个路径转来
  // next 是一个函数，表示放行

  if (to.path === '/login') return next()
  // 获取 token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
