import { getOrderListOfAdmin, getOrderListOfMerchant } from '../services/api';

export default {
  namespace: 'order',
  state: {
    orderList: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetchOrderListOfAdmin({ payload }, { put, call }) {
      const response = yield call(getOrderListOfAdmin, payload);
      if (response.status === 1) {
        yield put({
          type: 'saveOrderList',
          payload: response.data,
        });
      }
    },
    *fetchOrderListOfMerchant({ payload }, { put, call }) {
      const response = yield call(getOrderListOfMerchant, payload);
      if (response.status === 1) {
        yield put({
          type: 'saveOrderList',
          payload: response.data,
        });
      }
    },
  },

  reducers: {
    saveOrderList(state, action) {
      return {
        ...state,
        orderList: {
          list: action.payload.pageList,
          pagination: {
            current: action.payload.currentPage,
            total: action.payload.rowCount,
            pageSize: action.payload.pageSize,
          },
        },
      };
    },
    clearOrderList(state) {
      return {
        ...state,
        orderList: {
          list: [],
          pagination: {},
        },
      };
    },
  },
};
