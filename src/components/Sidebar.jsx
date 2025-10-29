import { Layout, Menu } from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';

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
