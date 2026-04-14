import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout as AntLayout, Menu, Avatar, Dropdown, Badge } from 'antd'
import {
  DashboardOutlined,
  ProjectOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  DatabaseOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AccountBookOutlined,
  StockOutlined,
  RobotOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'

const { Header, Sider, Content } = AntLayout

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '工作台' },
  { key: '/stockpool', icon: <StockOutlined />, label: '股票池' },
  { key: '/strategies', icon: <ProjectOutlined />, label: '策略管理' },
  { key: '/auto-trade', icon: <ThunderboltOutlined />, label: '自动交易' },
  { key: '/backtest', icon: <ExperimentOutlined />, label: '回测验证' },
  { key: '/sim-trade', icon: <AccountBookOutlined />, label: '模拟交易' },
  { key: '/live-trade', icon: <ThunderboltOutlined />, label: '实盘交易' },
  { key: '/transactions', icon: <AccountBookOutlined />, label: '交易管理' },
  { key: '/risk', icon: <SafetyOutlined />, label: '风险监控' },
  { key: '/data', icon: <DatabaseOutlined />, label: '数据中心' },
  { key: '/ai', icon: <RobotOutlined />, label: 'AI助手' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
]

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
    { key: 'settings', icon: <SettingOutlined />, label: '设置' },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
  ]

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {collapsed ? (
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>QM</span>
          ) : (
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>QuantMaster</span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <AntLayout>
        <Header style={{ padding: '0 16px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {collapsed ? (
              <MenuUnfoldOutlined style={{ fontSize: 18 }} onClick={() => setCollapsed(true)} />
            ) : (
              <MenuFoldOutlined style={{ fontSize: 18 }} onClick={() => setCollapsed(false)} />
            )}
            <span style={{ fontSize: 14, color: '#666' }}>新一代股票量化交易平台</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge count={3}>
              <span style={{ fontSize: 18, cursor: 'pointer' }}>🔔</span>
            </Badge>
            <Dropdown menu={{ items: userMenuItems, onClick: ({ key }) => key === 'logout' ? handleLogout() : null }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                <span>{user?.username || '用户'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: 16, padding: 24, background: '#fff', borderRadius: 8, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}
