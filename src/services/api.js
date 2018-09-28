import { stringify } from 'qs';
import request from '@/utils/request';
import ROOT_URL from './urls';

export async function login(params) {
  return request(`${ROOT_URL}/user/signin`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取订单列表-管理员
 * @param {object} params { pageSize, pageNum, minLimitAmount, maxLimitAmount, merchantOrderId, payStatus, startTime, endTime }
 */
export async function getOrderListOfAdmin(params) {
  return request(`${ROOT_URL}/order_manage/list?${stringify(params)}`);
}

/**
 * 获取订单列表-商户
 * @param {object} params { pageSize, pageNum, minLimitAmount, maxLimitAmount, merchantOrderId, payStatus, startTime, endTime }
 */
export async function getOrderListOfMerchant(params) {
  return request(`${ROOT_URL}/order/list?${stringify(params)}`);
}

// 资金进账
export async function getReceiptsList(params) {
  return request(`${ROOT_URL}/user_manage/assets?${stringify(params)}`);
}

// 商户账户金额
export async function getAccountInfo() {
  return request(`${ROOT_URL}/user/account`);
}

// 资金进账提现
export async function getWithdraw(params) {
  return request(`${ROOT_URL}/user/withdraw`, {
    method: 'POST',
    body: params,
  });
}

// 管理员查看商户余额列表
export async function getMerchantInfo(params) {
  return request(`${ROOT_URL}/user_manage/accounts?${stringify(params)}`);
}

// 管理员查看商户提现列表
export async function getMerchantWithdrawInfo(params) {
  return request(`${ROOT_URL}/user_manage/withdraws?${stringify(params)}`);
}

// 商户提现列表
export async function getWithdrawInfo(params) {
  return request(`${ROOT_URL}/user/withdraws?${stringify(params)}`);
}

// 提现列表的通过或拒绝
export async function getWithdrawSuccessOrLose(params) {
  return request(`${ROOT_URL}/user_manage/withdraw`, {
    method: 'PUT',
    body: params,
  });
}

export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`);
}
