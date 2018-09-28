import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { Row, Col, Card, Form, Button, DatePicker, InputNumber, Popconfirm, Alert } from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from '../TableList.less';
import { MERCHANT } from '../../constant';

moment.locale('zh-cn');

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const text = '您确定提现么';
const reg = /^(-)*(\d+)\.(\d\d).*$/;
const disabledDate = current => current && current > moment().subtract(1, 'days');

@connect(({ fund, loading }) => ({
  receiptsList: fund.receiptsList,
  accountInfo: fund.accountInfo,
  loading: loading.effects['fund/fetchReceiptsList'],
}))
@Form.create()
class Receipts extends PureComponent {
  state = {
    selectedRows: [],
    pageNum: 1,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'fund/fetchReceiptsList',
      payload: {
        pageNum: 1,
        pageSize: 10,
      },
    });
    dispatch({
      type: 'fund/fetchAccount',
    });
  }

  handleStandardTableChange = pagination => {
    const { dispatch } = this.props;

    const params = {
      pageNum: pagination.current,
      ...this.searchCondition,
    };
    this.setState(
      {
        pageNum: pagination.current,
      },
      () => {
        dispatch({
          type: 'fund/fetchReceiptsList',
          payload: params,
        });
      }
    );
  };

  confirm = () => {
    const { form, dispatch } = this.props;
    const { pageNum } = this.state;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const { withDrawNumber } = fieldsValue;
      if (withDrawNumber === '' || withDrawNumber === undefined || withDrawNumber <= 0) {
        return;
      }
      const params = {
        amount: withDrawNumber,
      };

      dispatch({
        type: 'fund/fetchWithDraw',
        payload: params,
        current: pageNum,
      });
      form.resetFields();
    });
  };

  limitDecimals = value => {
    if (typeof value === 'string') {
      return !Number.isNaN(Number(value)) ? value.replace(reg, '$1$2.$3') : '';
    }
    if (typeof value === 'number') {
      return !Number.isNaN(value) ? String(value).replace(reg, '$1$2.$3') : '';
    }
    return '';
  };

  handleSearch = event => {
    event.preventDefault();

    const { dispatch, form } = this.props;
    const { pageNum } = this.state;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // date 没有值时可能为 undefined 或者 空数组[]，undefined 时统一为空数组
      let { date } = fieldsValue;
      date = date || [];
      const startTime =
        date.length !== 0 ? Number(new Date(date[0].format('YYYY-MM-DD 00:00:00'))) : '';
      const endTime =
        date.length !== 0 ? Number(new Date(date[1].format('YYYY-MM-DD 23:59:59'))) : '';
      const params = {
        pageNum,
        pageSize: 10,
        startTime,
        endTime,
      };
      this.searchCondition = {
        startTime,
        endTime,
      };
      dispatch({
        type: 'fund/fetchReceiptsList',
        payload: params,
      });
    });
  };

  renderWithDrawForm() {
    const { form, accountInfo } = this.props;
    const { assets, frozenAssets } = accountInfo;
    const { getFieldDecorator } = form;
    const userRole = localStorage.getItem('ID_USER_ROLE');
    if (userRole === MERCHANT) {
      return (
        <Form layout="inline">
          <Row>
            <Col md={8} sm={24}>
              <FormItem>
                <div>
                  <Alert message={`总金额：${assets}`} type="success" />
                  <Alert
                    style={{ marginTop: '20px' }}
                    message={`冻结金额：${frozenAssets}`}
                    type="success"
                  />
                </div>
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
            <Col md={8} sm={24}>
              <FormItem>
                {getFieldDecorator('withDrawNumber')(
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={this.limitDecimals}
                    parser={this.limitDecimals}
                    placeholder="提现金额"
                  />
                )}
              </FormItem>
            </Col>
            <Col md={6} sm={24}>
              <Popconfirm
                placement="bottom"
                title={text}
                onConfirm={this.confirm}
                okText="确认"
                cancelText="取消"
              >
                <Button type="primary" htmlType="submit">
                  提现
                </Button>
              </Popconfirm>
            </Col>
          </Row>
        </Form>
      );
    }
    return null;
  }

  renderSearchForm() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem>
              {getFieldDecorator('date')(
                <RangePicker
                  style={{ width: '100%' }}
                  allowClear
                  disabledDate={disabledDate}
                  format="YYYY-MM-DD"
                />
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { loading, receiptsList } = this.props;
    const { selectedRows } = this.state;
    const userRole = localStorage.getItem('ID_USER_ROLE');
    const columns = [
      {
        title: '商户ID',
        dataIndex: 'merchantId',
      },
      {
        title: '日期',
        dataIndex: 'createTime',
      },
      {
        title: '充值总金额(元)',
        dataIndex: 'amount',
      },
    ];
    const columnSec = [
      {
        title: '日期',
        dataIndex: 'createTime',
      },
      {
        title: '充值总金额(元)',
        dataIndex: 'amount',
      },
    ];

    return (
      <PageHeaderWrapper title="资金进账列表">
        <Card>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderWithDrawForm()}</div>
            <div className={styles.tableListForm}>{this.renderSearchForm()}</div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={receiptsList}
              rowKey={record => record.txId || 'key'}
              columns={userRole === 'admin' ? columns : columnSec}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Receipts;
