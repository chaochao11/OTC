import { message } from 'antd';
import {
  getReceiptsList,
  getWithdraw,
  getAccountInfo,
  getMerchantInfo,
  getMerchantWithdrawInfo,
  getWithdrawSuccessOrLose,
  getWithdrawInfo,
} from '../services/api';

/**
 * 资金管理
 */
export default {
  namespace: 'fund',

  state: {
    receiptsList: {
      list: [],
      pagination: {},
    },
    accountInfo: {
      frozenAssets: '--',
      assets: '--',
    },
    merchantInfo: {
      list: [],
      pagination: {},
    },
    withdrawList: {
      list: [],
      pagination: {},
    },
    merchantWithdrawInfo: {
      list: [],
      pagination: {},
    },
  },
  effects: {
    *fetchReceiptsList({ payload }, { put, call }) {
      const response = yield call(getReceiptsList, payload);
      if (response.status === 1) {
        yield put({
          type: 'saveReceiptsList',
          payload: response.data,
        });
      } else {
        message.error(response.message);
      }
    },
    *fetchWithDraw({ payload, current }, { put, call }) {
      const response = yield call(getWithdraw, payload);
      if (response.status === 1) {
        message.success('提现成功');
        yield put({
          type: 'fetchReceiptsList',
          payload: { pageNum: current, pageSize: 10 },
        });
        yield put({
          type: 'fetchAccount',
          payload: response.data,
        });
        yield put({
          type: 'saveWithDrawInfo',
          payload: response.data,
        });
      } else {
        message.error('提现失败');
      }
    },
    *fetchAccount(_, { put, call }) {
      const response = yield call(getAccountInfo);
      if (response.status === 1) {
        yield put({
          type: 'saveAccountInfo',
          payload: response.data,
        });
      } else {
        message.error(response.message);
      }
    },
    *fetchMerchantInfo({ payload }, { put, call }) {
      const response = yield call(getMerchantInfo, payload);
      if (response.status === 1) {
        yield put({
          type: 'saveMerchantInfo',
          payload: response.data,
        });
      } else {
        message.error(response.message);
      }
    },
    *fetchWithdrawInfo({ payload }, { put, call }) {
      const response = yield call(getWithdrawInfo, payload);
      if (response.status === 1) {
        yield put({
          type: 'saveWithdrawList',
          payload: response.data,
        });
      } else {
        message.error(response.message);
      }
    },
    *fetchMerchantWithdrawInfo({ payload }, { put, call }) {
      const response = yield call(getMerchantWithdrawInfo, payload);
      if (response.status === 1) {
        yield put({
          type: 'saveMerchantWithdrawInfo',
          payload: response.data,
        });
      } else {
        message.error(response.message);
      }
    },
    *fetchMerchantWithdrawSuccessOrLose({ payload, current }, { put, call }) {
      const response = yield call(getWithdrawSuccessOrLose, payload);
      if (response.status === 1) {
        message.success('审核成功');
        yield put({
          type: 'fetchMerchantWithdrawInfo',
          payload: {
            pageNum: current,
            pageSize: 10,
          },
        });
        yield put({
          type: 'saveMerchantWithdrawSuccessOrLose',
          payload: response.data,
        });
      } else {
        message.error('审核失败');
      }
    },
  },

  reducers: {
    saveReceiptsList(state, action) {
      return {
        ...state,
        receiptsList: {
          list: action.payload.pageList,
          pagination: {
            current: action.payload.currentPage,
            total: action.payload.rowCount,
            pageSize: action.payload.pageSize,
          },
        },
      };
    },
    saveAccountInfo(state, action) {
      return {
        ...state,
        accountInfo: {
          frozenAssets: action.payload.frozenAssets,
          assets: action.payload.assets,
        },
      };
    },
    saveMerchantInfo(state, action) {
      return {
        ...state,
        merchantInfo: {
          list: action.payload.pageList,
          pagination: {
            current: action.payload.currentPage,
            total: action.payload.rowCount,
            pageSize: action.payload.pageSize,
          },
        },
      };
    },
    saveWithdrawList(state, action) {
      return {
        ...state,
        withdrawList: {
          list: action.payload.pageList,
          pagination: {
            current: action.payload.currentPage,
            total: action.payload.rowCount,
            pageSize: action.payload.pageSize,
          },
        },
      };
    },
    saveMerchantWithdrawInfo(state, action) {
      return {
        ...state,
        merchantWithdrawInfo: {
          list: action.payload.pageList,
          pagination: {
            current: action.payload.currentPage,
            total: action.payload.rowCount,
            pageSize: action.payload.pageSize,
          },
        },
      };
    },
  },
};
