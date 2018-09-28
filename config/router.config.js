export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './User/Login' },
    ],
  },
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    authority: ['admin', 'merchant'],
    routes: [
      // 首页
      { path: '/', redirect: '/home' },
      {
        path: '/home',
        name: '首页',
        icon: 'home',
        component: './Home/index.js',
      },
      /**
       * 订单列表
       */
      {
        path: '/order',
        icon: 'file-text',
        name: '订单管理',
        component: './Order/Order.js',
      },
      /**
       * 资金列表
       */
      {
        path: '/fund',
        icon: 'pay-circle',
        name: '资金管理',
        routes: [
          {
            name: '资金进账列表',
            path: '/fund/receipts',
            component: './Fund/Receipts.js',
          },
          {
            name: '提现申请列表',
            path: '/fund/withdrawApply',
            component: './Fund/WithdrawApply.js',
          },
          {
            name: '商户余额列表',
            path: '/fund/merchantBalance',
            authority: ['admin'],
            component: './Fund/MerchantBalance.js',
          },
        ],
      },
    ],
  },
];
