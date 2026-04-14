import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message, Tabs } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import { authService } from '../services/authService'
import { useAuthStore } from '../stores/authStore'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('login')
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const onLogin = async (values: { email: string; password: string }) => {
    setLoading(true)
    try {
      const res = await authService.login(values)
      login(res.user, res.access_token)
      message.success('登录成功')
      navigate('/')
    } catch (error: any) {
      const detail = error?.response?.data?.detail || '登录失败，请检查邮箱和密码'
      message.error(detail)
    } finally {
      setLoading(false)
    }
  }

  const onRegister = async (values: { username: string; email: string; password: string; phone?: string }) => {
    setLoading(true)
    try {
      const res = await authService.register(values)
      login(res.user, res.access_token)
      message.success('注册成功')
      navigate('/')
    } catch (error: any) {
      const detail = error?.response?.data?.detail || '注册失败，请重试'
      message.error(detail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Card style={{ width: 400, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff', marginBottom: 8 }}>QuantMaster</h1>
          <p style={{ color: '#666' }}>新一代股票量化交易平台</p>
        </div>
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k || 'login')}
          items={[
            {
              key: 'login',
              label: '登录',
              children: (
                <Form onFinish={onLogin} layout="vertical">
                  <Form.Item name="email" rules={[{ required: true, message: '请输入邮箱' }]}>
                    <Input prefix={<MailOutlined />} placeholder="邮箱" size="large" />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                      登录
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'register',
              label: '注册',
              children: (
                <Form onFinish={onRegister} layout="vertical">
                  <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                    <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
                  </Form.Item>
                  <Form.Item name="email" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入有效邮箱' }]}>
                    <Input prefix={<MailOutlined />} placeholder="邮箱" size="large" />
                  </Form.Item>
                  <Form.Item name="phone">
                    <Input prefix={<PhoneOutlined />} placeholder="手机号（可选）" size="large" />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                      注册
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}
