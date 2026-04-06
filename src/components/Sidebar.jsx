import { Layout, Menu, Tag } from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const isDev = import.meta.env.DEV;

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
    {
      key: 'meetups',
      icon: <TeamOutlined />,
      label: '모임관리',
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
      {isDev && (
        <div style={{ padding: '12px 16px', textAlign: 'center' }}>
          <Tag color="orange" style={{ fontSize: '14px', padding: '2px 12px' }}>
            DEV
          </Tag>
        </div>
      )}
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
