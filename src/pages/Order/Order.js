import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Form, Input, Select, Button, DatePicker } from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { MERCHANT, ADMIN } from '../../constant';
import styles from '../TableList.less';

moment.locale('zh-cn');

const { Option } = Select;
const FormItem = Form.Item;
const disabledDate = current => current && current > moment().subtract(1, 'days');
@connect(({ order, loading }) => ({
  orderList: order.orderList,
  loadingOfAdmin: loading.effects['order/fetchOrderListOfAdmin'],
  loadingOfMerchant: loading.effects['order/fetchOrderListOfMerchant'],
}))
@Form.create()
class OrderManage extends PureComponent {
  state = {
    selectedRows: [],
  };

  constructor(props) {
    super(props);

    this.role = localStorage.getItem('ID_USER_ROLE');
    this.actionType = '';
    if (this.role === ADMIN) {
      this.actionType = 'order/fetchOrderListOfAdmin';
    }
    if (this.role === MERCHANT) {
      this.actionType = 'order/fetchOrderListOfMerchant';
    }
  }

  componentDidMount() {
    const { dispatch, orderList } = this.props;
    if (orderList.list && orderList.list.length > 0) {
      return;
    }
    dispatch({
      type: this.actionType,
      payload: {
        pageSize: 10,
        pageNum: 1,
      },
    });
  }

  checkLimitAmount = (rule, value, callback) => {
    if (value && Number.isNaN(Number(value))) {
      callback(rule.message);
      return;
    }
    callback();
  };

  handleStandardTableChange = pagination => {
    const { dispatch } = this.props;

    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      ...this.searchCondition,
    };
    dispatch({
      type: this.actionType,
      payload: params,
    });
  };

  handleSearch = event => {
    event.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const { payStatus } = fieldsValue;
      const { minLimitAmount, maxLimitAmount } = fieldsValue;
      if (minLimitAmount && Number.isNaN(Number(minLimitAmount))) {
        return;
      }
      if (maxLimitAmount && Number.isNaN(Number(maxLimitAmount))) {
        return;
      }

      // date 没有值时可能为 undefined 或者 空数组[]，undefined 时统一为空数组
      let { merchantOrderId, date } = fieldsValue;
      date = date || [];
      const startTime =
        date.length !== 0 ? Number(new Date(date[0].format('YYYY-MM-DD 00:00:00'))) : '';
      const endTime =
        date.length !== 0 ? Number(new Date(date[1].format('YYYY-MM-DD 23:59:59'))) : '';
      merchantOrderId = merchantOrderId ? merchantOrderId.trim() : '';

      const params = {
        startTime,
        endTime,
        merchantOrderId,
        payStatus,
        minLimitAmount,
        maxLimitAmount,
        pageNum: 1,
        pageSize: 10,
      };
      this.searchCondition = {
        startTime,
        endTime,
        merchantOrderId,
        payStatus,
        minLimitAmount,
        maxLimitAmount,
      };
      dispatch({
        type: this.actionType,
        payload: params,
      });
    });
  };

  renderSearchForm() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ xs: 8, sm: 16, md: 24 }}>
          <Col span={4}>
            <FormItem>
              {getFieldDecorator('merchantOrderId')(<Input placeholder="商品订单编号" />)}
            </FormItem>
          </Col>
          <Col md={4} sm={12}>
            <FormItem>
              {getFieldDecorator('payStatus', { initialValue: '-1' })(
                <Select style={{ width: '100%' }}>
                  <Option value="-1">全部支付状态</Option>
                  <Option value="0">已创建</Option>
                  <Option value="1">未支付</Option>
                  <Option value="2">待放币</Option>
                  <Option value="3">已完成</Option>
                  <Option value="4">申诉中</Option>
                  <Option value="5">已仲裁</Option>
                  <Option value="6">已取消</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={20}>
            <FormItem>
              {getFieldDecorator('date')(
                <DatePicker.RangePicker
                  style={{ width: '100%' }}
                  allowClear
                  disabledDate={disabledDate}
                  format="YYYY-MM-DD"
                />
              )}
            </FormItem>
          </Col>
          <Col md={7} sm={24}>
            <Col span={10}>
              <FormItem>
                {getFieldDecorator('maxLimitAmount', {
                  rules: [{ message: '请输入有效数字', validator: this.checkLimitAmount }],
                })(<Input style={{ width: '100%', textAlign: 'center' }} placeholder="充值上限" />)}
              </FormItem>
            </Col>
            <Col span={2}>
              <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>~</span>
            </Col>
            <Col span={10}>
              <FormItem>
                {getFieldDecorator('minLimitAmount', {
                  rules: [{ message: '请输入有效数字', validator: this.checkLimitAmount }],
                })(<Input style={{ width: '100%', textAlign: 'center' }} placeholder="充值下限" />)}
              </FormItem>
            </Col>
          </Col>
          <Col md={3} sm={6}>
            <span>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { orderList, loadingOfAdmin, loadingOfMerchant } = this.props;
    const { selectedRows } = this.state;
    // 管理员： 商品订单编号: merchantOrderId, 支付方式: payMethod, 金额: amount, 创建时间: createTime, 回调时间: notifyTime, 支付状态: payStatus, OTC订单号码: otcOrderId, 货币种类: currency, 数量: count, 法币价格: price
    // 商户: 商户订单编号, 支付方式, 金额, 创建时间，回调时间，支付状态
    const columnsOfAdmin = [
      {
        title: '商品订单编号',
        dataIndex: 'merchantOrderId',
      },
      {
        title: '支付方式',
        dataIndex: 'payMethod',
      },
      {
        title: '金额',
        dataIndex: 'amount',
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
      },
      {
        title: '回调时间',
        dataIndex: 'notifyTime',
      },
      {
        title: '支付状态',
        dataIndex: 'payStatus',
      },
      {
        title: 'OTC订单号码',
        dataIndex: 'otcOrderId',
      },
      {
        title: '货币种类',
        dataIndex: 'currency',
      },
      {
        title: '数量',
        dataIndex: 'count',
      },
      {
        title: '法币价格',
        dataIndex: 'price',
      },
    ];
    const columnsOfMerchant = [
      {
        title: '商品订单编号',
        dataIndex: 'merchantOrderId',
      },
      {
        title: '支付方式',
        dataIndex: 'payMethod',
      },
      {
        title: '金额',
        dataIndex: 'amount',
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
      },
      {
        title: '回调时间',
        dataIndex: 'notifyTime',
      },
      {
        title: '支付状态',
        dataIndex: 'payStatus',
      },
    ];
    const columns = this.role === ADMIN ? columnsOfAdmin : columnsOfMerchant;
    const loading = loadingOfAdmin || loadingOfMerchant;

    return (
      <PageHeaderWrapper title="订单管理">
        <Card>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSearchForm()}</div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={orderList}
              rowKey={record => record.merchantOrderId || 'key'}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default OrderManage;
