import React, { Fragment } from 'react';
import { Layout, Icon } from 'antd';
import GlobalFooter from '@/components/GlobalFooter';

const { Footer } = Layout;
const FooterView = () => (
  <Footer style={{ padding: 0 }}>
    <GlobalFooter
      links={[
        {
          key: 'StormPay',
          title: 'StormPay',
        },
      ]}
      copyright={
        <Fragment>
          Copyright <Icon type="copyright" /> 2018 风暴支付平台出品
        </Fragment>
      }
    />
  </Footer>
);
export default FooterView;
