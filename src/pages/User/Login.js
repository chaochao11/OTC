import React, { Component } from 'react';
import { connect } from 'dva';
import { Alert } from 'antd';
import Login from '@/components/Login';
import styles from './Login.less';

const { Tab, UserName, Password, Submit } = Login;

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
class LoginPage extends Component {
  componentDidMount() {
    const { history } = this.props;
    if (localStorage.getItem('ID_USER_TOKEN')) {
      history.push('/');
    }
  }

  handleSubmit = (err, values) => {
    if (!err) {
      const { dispatch } = this.props;
      dispatch({
        type: 'login/login',
        payload: {
          ...values,
        },
      });
    }
  };

  renderMessage = content => (
    <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
  );

  render() {
    const { login, submitting } = this.props;
    return (
      <div className={styles.main}>
        <Login
          defaultActiveKey="account"
          onSubmit={this.handleSubmit}
          ref={form => {
            this.loginForm = form;
          }}
        >
          <Tab key="account" tab="账户登录">
            {login.status === 'error' &&
              login.type === 'account' &&
              !submitting &&
              this.renderMessage('账户或密码错误')}
            <UserName name="username" placeholder="请输入账户名称" />
            <Password
              name="password"
              placeholder="请输入密码"
              onPressEnter={() => this.loginForm.validateFields(this.handleSubmit)}
            />
          </Tab>
          <Submit loading={submitting}>登录</Submit>
        </Login>
      </div>
    );
  }
}

export default LoginPage;
