import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Popconfirm } from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from '../TableList.less';
import { MERCHANT } from '../../constant';

const textA = '您确认审核通过么';
const textB = '您确认拒绝审核么';

@connect(({ fund, loading }) => ({
  merchantWithdrawInfo: fund.merchantWithdrawInfo,
  withdrawList: fund.withdrawList,
  loadingAdmin: loading.effects['fund/fetchMerchantWithdrawInfo'],
  loadingMerchant: loading.effects['fund/fetchWithdrawInfo'],
}))
@Form.create()
class WithdrawApply extends PureComponent {
  state = {
    selectedRows: [],
    pageNum: 1,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const userRole = localStorage.getItem('ID_USER_ROLE');
    if (userRole === MERCHANT) {
      dispatch({
        type: 'fund/fetchWithdrawInfo',
        payload: {
          pageNum: 1,
          pageSize: 10,
        },
      });
      return;
    }
    dispatch({
      type: 'fund/fetchMerchantWithdrawInfo',
      payload: {
        pageNum: 1,
        pageSize: 10,
      },
    });
  }

  handleStandardTableChange = pagination => {
    const { dispatch } = this.props;
    const userRole = localStorage.getItem('ID_USER_ROLE');
    const params = {
      pageNum: pagination.current,
      pageSize: 10,
    };
    this.setState(
      {
        pageNum: pagination.current,
      },
      () => {
        if (userRole === MERCHANT) {
          dispatch({
            type: 'fund/fetchWithdrawInfo',
            payload: params,
          });
          return;
        }
        dispatch({
          type: 'fund/fetchMerchantWithdrawInfo',
          payload: params,
        });
      }
    );
  };

  confirmSuccess = withdrawId => {
    const { dispatch } = this.props;
    const { pageNum } = this.state;
    const params = {
      withdrawId,
      status: 2,
    };
    dispatch({
      type: 'fund/fetchMerchantWithdrawSuccessOrLose',
      payload: params,
      current: pageNum,
    });
  };

  confirmLose = withdrawId => {
    const { dispatch } = this.props;
    const { pageNum } = this.state;
    const params = {
      withdrawId,
      status: 3,
    };
    dispatch({
      type: 'fund/fetchMerchantWithdrawSuccessOrLose',
      payload: params,
      current: pageNum,
    });
  };

  render() {
    const { loadingMerchant, loadingAdmin, merchantWithdrawInfo, withdrawList } = this.props;
    const { selectedRows } = this.state;
    const userRole = localStorage.getItem('ID_USER_ROLE');
    const columnsA = [
      {
        title: '商户ID',
        dataIndex: 'userId',
      },
      {
        title: '提现金额',
        dataIndex: 'amount',
      },
      {
        title: '申请时间',
        dataIndex: 'createTime',
      },
      {
        title: '处理状态',
        dataIndex: 'statusStr',
      },
      {
        title: '操作',
        dataIndex: 'status',
        render: (status, record) => {
          if (status === 1) {
            return (
              <div>
                <Popconfirm
                  placement="bottom"
                  title={textA}
                  onConfirm={() => this.confirmSuccess(record.withdrawId)}
                  okText="确认"
                  cancelText="取消"
                >
                  <a>处理</a>
                </Popconfirm>
                &nbsp;|&nbsp;
                <Popconfirm
                  placement="bottom"
                  title={textB}
                  onConfirm={() => this.confirmLose(record.withdrawId)}
                  okText="确认"
                  cancelText="取消"
                >
                  <a>拒绝</a>
                </Popconfirm>
              </div>
            );
          }
          if (status === 2) {
            return <span>已处理</span>;
          }
          return <span>已拒绝</span>;
        },
      },
    ];
    const columnsB = [
      {
        title: '提现金额',
        dataIndex: 'amount',
      },
      {
        title: '申请时间',
        dataIndex: 'createTime',
      },
      {
        title: '处理状态',
        dataIndex: 'statusStr',
      },
    ];

    return (
      <PageHeaderWrapper title="提现申请列表">
        <Card>
          <div className={styles.tableList}>
            <StandardTable
              selectedRows={selectedRows}
              loading={MERCHANT === userRole ? loadingMerchant : loadingAdmin}
              data={MERCHANT === userRole ? withdrawList : merchantWithdrawInfo}
              rowKey={record => record.withdrawId || 'key'}
              columns={MERCHANT === userRole ? columnsB : columnsA}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default WithdrawApply;
