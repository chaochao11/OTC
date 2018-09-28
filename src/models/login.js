import { routerRedux } from 'dva/router';
import { message } from 'antd';
import { login } from '@/services/api';
import { setAuthority } from '@/utils/authority';
import { reloadAuthorized } from '@/utils/Authorized';

export default {
  namespace: 'login',

  state: {
    status: null,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(login, payload);

      if (response.status === 1) {
        // userInfo: { image: string, lastLoginTime: string, role: 'admin' | 'merchant', username: string, token: string }
        const { data: userInfo } = response;

        localStorage.setItem('ID_USER_TOKEN', userInfo.token);
        localStorage.setItem('ID_USER_NAME', userInfo.username);
        localStorage.setItem('ID_USER_ROLE', userInfo.role);

        yield put({
          type: 'changeLoginStatus',
          payload: userInfo,
          status: true,
        });

        reloadAuthorized();
        yield put(routerRedux.replace('/'));
      } else {
        message.error(response.message || '登录失败');
        yield put({
          type: 'changeLoginStatus',
          payload: {
            role: 'guest',
          },
          status: false,
        });
      }
    },

    *logout(_, { put }) {
      yield put({
        type: 'changeLoginStatus',
        payload: {
          role: 'guest',
        },
        status: null,
      });

      /**
       * 用户退出之后清空订单列表 防止管理员/商户登录之后看到的订单列表没有刷新
       */
      yield put({ type: 'order/clearOrderList' });

      localStorage.removeItem('ID_USER_TOKEN');
      localStorage.removeItem('ID_USER_NAME');
      localStorage.removeItem('ID_USER_ROLE');

      reloadAuthorized();
      yield put(
        routerRedux.push({
          pathname: '/user/login',
        })
      );
    },
  },

  reducers: {
    changeLoginStatus(state, { payload, status }) {
      setAuthority(payload.role);
      return {
        ...state,
        status,
      };
    },
  },
};
