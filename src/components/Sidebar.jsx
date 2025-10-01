import { Layout, Menu } from 'antd';
import { CalendarOutlined, UserOutlined } from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = ({ selectedKey, onMenuClick }) => {
  const menuItems = [
    {
      key: 'schedule',
      icon: <CalendarOutlined />,
      label: '일정관리',
    },
    {
      key: 'members',
      icon: <UserOutlined />,
      label: '회원관리',
    },
  ];

  return (
    <Sider
      width={200}
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
      }}
    >
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #f0f0f0',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#1890ff',
        }}
      >
        BHC 관리자
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={onMenuClick}
        style={{ border: 'none' }}
      />
    </Sider>
  );
};

export default Sidebar;
