import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Form, Button, Input } from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from '../TableList.less';

const FormItem = Form.Item;

@connect(({ fund, loading }) => ({
  merchantInfo: fund.merchantInfo,
  loading: loading.effects['fund/fetchMerchantInfo'],
}))
@Form.create()
class MerchantBalance extends PureComponent {
  state = {
    selectedRows: [],
    pageNum: 1,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'fund/fetchMerchantInfo',
      payload: {
        pageNum: 1,
        pageSize: 10,
      },
    });
  }

  handleStandardTableChange = pagination => {
    const { dispatch } = this.props;

    const params = {
      pageNum: pagination.current,
    };
    this.setState(
      {
        pageNum: pagination.current,
      },
      () => {
        dispatch({
          type: 'fund/fetchMerchantInfo',
          payload: params,
        });
      }
    );
  };

  handleSearch = event => {
    event.preventDefault();

    const { dispatch, form } = this.props;
    const { pageNum } = this.state;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // date 没有值时可能为 undefined 或者 空数组[]，undefined 时统一为空数组
      const { txId } = fieldsValue;
      const params = {
        pageNum,
        pageSize: 10,
        merchantId: txId,
      };
      dispatch({
        type: 'fund/fetchMerchantInfo',
        payload: params,
      });
    });
  };

  renderSearchForm() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 6, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem>{getFieldDecorator('txId')(<Input placeholder="商户ID" />)}</FormItem>
          </Col>
          <Col md={6} sm={24}>
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
    const { loading, merchantInfo } = this.props;
    const { selectedRows } = this.state;
    const columns = [
      {
        title: '商户ID',
        dataIndex: 'uid',
      },
      {
        title: '冻结金额',
        dataIndex: 'frozenAssets',
      },
      {
        title: '可提现金额(元)',
        dataIndex: 'assets',
      },
    ];

    return (
      <PageHeaderWrapper title="商户余额列表">
        <Card>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSearchForm()}</div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={merchantInfo}
              rowKey={record => record.uid || 'key'}
              columns={columns}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default MerchantBalance;
