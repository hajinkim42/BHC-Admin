import { useState } from 'react';
import { Layout, Drawer, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import Sidebar from './Sidebar';
import Schedule from './Schedule';
import MemberTable from './MemberTable';
import MeetupTable from './MeetupTable';

const { Content } = Layout;

const MainLayout = () => {
  const [selectedKey, setSelectedKey] = useState('schedule');
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
    setMobileMenuVisible(false); // 모바일에서 메뉴 선택 후 드로어 닫기
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
    <Layout style={{ minHeight: '100vh' }}>
      {/* 데스크톱 사이드바 */}
      <div className="desktop-sidebar">
        <Sidebar selectedKey={selectedKey} onMenuClick={handleMenuClick} />
      </div>

      {/* 모바일 헤더 */}
      <div className="mobile-header">
        <div className="mobile-header-top">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuVisible(true)}
            style={{ fontSize: '18px', color: '#1890ff' }}
          />
        </div>
      </div>

      {/* 모바일 드로어 메뉴 */}
      <Drawer
        placement="left"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={280}
        bodyStyle={{ padding: 0 }}
      >
        <Sidebar selectedKey={selectedKey} onMenuClick={handleMenuClick} />
      </Drawer>

      <Layout style={{ width: '100%' }}>
        <Content style={{ margin: 0, padding: 0 }}>{renderContent()}</Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
