import { useEffect } from 'react';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Spin } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { UserOutlined, LogoutOutlined, CheckSquareOutlined, DashboardOutlined, TeamOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/services';

const { Header, Content } = AntLayout;

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, setAuth, logout } = useAuthStore();

  // 如果有 token 但没有 user，获取用户信息
  const { data: userData, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.getMe,
    enabled: !!token && !user,
    retry: false,
  });

  useEffect(() => {
    if (userData && token) {
      setAuth(userData, token);
    }
  }, [userData, token, setAuth]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      onClick: () => navigate('/'),
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: '任务管理',
      onClick: () => navigate('/tasks'),
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: '用户管理',
      onClick: () => navigate('/users'),
    },
  ];

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <AntLayout className="min-h-screen">
      <Header className="flex items-center justify-between bg-white shadow">
        <div className="flex items-center">
          <div className="text-xl font-bold mr-8">AI Mission</div>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ flex: 1, minWidth: 0, border: 'none' }}
          />
        </div>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div className="flex items-center cursor-pointer">
            <Avatar icon={<UserOutlined />} />
            <span className="ml-2">
              {isLoading ? <Spin size="small" /> : (user?.fullName || user?.username)}
            </span>
          </div>
        </Dropdown>
      </Header>

      <Content className="bg-gray-50 p-6">
        <Outlet />
      </Content>
    </AntLayout>
  );
}
