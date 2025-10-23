import { useState } from 'react';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import Schedule from './Schedule';
import MemberTable from './MemberTable';
import MeetupTable from './MeetupTable';

const { Content } = Layout;

const MainLayout = () => {
  const [selectedKey, setSelectedKey] = useState('schedule');

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
  };

  const renderContent = () => {
    switch (selectedKey) {
      case 'schedule':
        return <Schedule />;
      case 'members':
        return <MemberTable />;
      case 'meetups':
        return <MeetupTable />;
      default:
        return <Schedule />;
    }
  };

  return (
    <Layout style={{ minHeight: '100%' }}>
      <Sidebar selectedKey={selectedKey} onMenuClick={handleMenuClick} />
      <Layout style={{ width: '100%' }}>
        <Content style={{ margin: 0, padding: 0 }}>{renderContent()}</Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
