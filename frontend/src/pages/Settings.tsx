import { useState, useEffect } from 'react'
import { Card, Tabs, Table, Button, Space, Modal, Form, Input, Select, message, Tag, Popconfirm, Descriptions, InputNumber, Switch, Divider, Alert } from 'antd'
import { UserOutlined, KeyOutlined, ApiOutlined, SettingOutlined, SafetyOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import api from '../services/api'
import { useAuthStore } from '../stores/authStore'

interface User {
  id: number
  username: string
  email: string
  user_type: string
  is_active: boolean
  created_at: string
}

interface ApiConfig {
  id?: number
  name: string
  api_type: string
  api_key?: string
  api_secret?: string
  endpoint?: string
  enabled: boolean
}

interface SystemParam {
  key: string
  value: string
  description: string
  category: string
}

export default function Settings() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState<User[]>([])
  const [userVisible, setUserVisible] = useState(false)
  const [apiVisible, setApiVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editingApi, setEditingApi] = useState<ApiConfig | null>(null)
  const [form] = Form.useForm()
  const [apiForm] = Form.useForm()
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([])
  const [stockDataEnabled, setStockDataEnabled] = useState(true)
  const [stockDataSource, setStockDataSource] = useState('sina')
  const [aiConfigEnabled, setAiConfigEnabled] = useState(false)

  const systemParams: SystemParam[] = [
    { key: 'max_strategies', value: '50', description: '最大策略数量', category: '策略' },
    { key: 'max_backtest_days', value: '365', description: '最大回测天数', category: '回测' },
    { key: 'tick_data_retention', value: '30', description: 'Tick数据保留天数', category: '数据' },
    { key: 'default_margin_ratio', value: '0.5', description: '默认保证金比例', category: '交易' },
    { key: 'max_position_per_stock', value: '0.1', description: '单股最大持仓比例', category: '风控' },
    { key: 'daily_loss_limit', value: '0.05', description: '日亏损限制', category: '风控' },
  ]

  const stockDataSources = [
    { value: 'sina', label: '新浪财经', endpoint: 'https://hq.sinajs.cn/list=' },
    { value: 'tencent', label: '腾讯证券', endpoint: 'https://qt.gtimg.cn/q=' },
    { value: 'eastmoney', label: '东方财富', endpoint: 'https://push2.eastmoney.com/api/qt/stock/get' },
  ]

  const loadUsers = async () => {
    try {
      const res = await api.get('/users')
      setUsers(res.data)
    } catch (error) {
      console.error('加载用户失败', error)
    }
  }

  const loadApiConfigs = async () => {
    try {
      const res = await api.get('/config/apis')
      if (res.data && Array.isArray(res.data)) {
        setApiConfigs(res.data)
      }
    } catch (error) {
      console.error('加载API配置失败', error)
      setApiConfigs([
        { id: 1, name: '新浪行情API', api_type: 'stock_quote', endpoint: 'https://hq.sinajs.cn/list=', enabled: true },
        { id: 2, name: 'DeepSeek AI', api_type: 'ai', endpoint: 'https://api.deepseek.com/v1', enabled: false },
      ])
    }
  }

  useEffect(() => {
    loadUsers()
    loadApiConfigs()
  }, [])

  const handleAddUser = async () => {
    try {
      const values = await form.validateFields()
      await api.post('/users', values)
      message.success('添加成功')
      setUserVisible(false)
      form.resetFields()
      loadUsers()
    } catch (error) {
      message.error('添加失败')
    }
  }

  const handleEditUser = async () => {
    try {
      const values = await form.validateFields()
      await api.put(`/users/${editingUser?.id}`, values)
      message.success('更新成功')
      setUserVisible(false)
      setEditingUser(null)
      form.resetFields()
      loadUsers()
    } catch (error) {
      message.error('更新失败')
    }
  }

  const handleDeleteUser = async (id: number) => {
    try {
      await api.delete(`/users/${id}`)
      message.success('删除成功')
      loadUsers()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSaveApiConfig = async () => {
    try {
      const values = await apiForm.validateFields()
      if (editingApi?.id) {
        await api.put(`/config/apis/${editingApi.id}`, values)
      } else {
        await api.post('/config/apis', values)
      }
      message.success('保存成功')
      setApiVisible(false)
      setEditingApi(null)
      apiForm.resetFields()
      loadApiConfigs()
    } catch (error) {
      message.error('保存失败')
    }
  }

  const handleDeleteApi = async (id: number) => {
    try {
      await api.delete(`/config/apis/${id}`)
      message.success('删除成功')
      loadApiConfigs()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleToggleApi = async (id: number, enabled: boolean) => {
    try {
      await api.put(`/config/apis/${id}`, { enabled })
      message.success(enabled ? '已启用' : '已禁用')
      loadApiConfigs()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleSaveSystemParam = async (key: string, value: string) => {
    try {
      await api.put('/config/params', { key, value })
      message.success('保存成功')
    } catch (error) {
      message.error('保存失败')
    }
  }

  const userColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '角色', dataIndex: 'user_type', key: 'user_type', render: (v: string) => <Tag color={v === 'admin' ? 'red' : 'blue'}>{v}</Tag> },
    { title: '状态', dataIndex: 'is_active', key: 'is_active', render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '启用' : '禁用'}</Tag> },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', render: (v: string) => v?.split('T')[0] || '-' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingUser(record); form.setFieldsValue(record); setUserVisible(true) }} />
          <Popconfirm title="确定删除?" onConfirm={() => handleDeleteUser(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} disabled={record.id === user?.id} />
          </Popconfirm>
        </Space>
      )
    }
  ]

  const apiColumns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'api_type', key: 'api_type', render: (v: string) => <Tag>{v}</Tag> },
    { title: '端点', dataIndex: 'endpoint', key: 'endpoint', ellipsis: true },
    { title: '状态', dataIndex: 'enabled', key: 'enabled', render: (v: boolean, record: ApiConfig) => <Switch checked={v} onChange={(checked) => handleToggleApi(record.id!, checked)} /> },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ApiConfig) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingApi(record); apiForm.setFieldsValue(record); setApiVisible(true) }} />
          <Popconfirm title="确定删除?" onConfirm={() => handleDeleteApi(record.id!)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ]

  const tabItems = [
    {
      key: 'users',
      label: <span><UserOutlined /> 用户管理</span>,
      children: (
        <Card
          extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingUser(null); form.resetFields(); setUserVisible(true) }}>添加用户</Button>}
        >
          <Table columns={userColumns} dataSource={users} rowKey="id" pagination={{ pageSize: 10 }} size="small" />
        </Card>
      )
    },
    {
      key: 'apis',
      label: <span><ApiOutlined /> 接口配置</span>,
      children: (
        <>
          <Alert message="股票数据接口配置" description="配置股票行情数据源，支持新浪、腾讯、东方财富等数据源" type="info" showIcon style={{ marginBottom: 16 }} />
          <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingApi(null); apiForm.resetFields(); setApiVisible(true) }}>添加接口</Button>}>
            <Table columns={apiColumns} dataSource={apiConfigs} rowKey="id" pagination={false} size="small" />
          </Card>
        </>
      )
    },
    {
      key: 'params',
      label: <span><SettingOutlined /> 系统参数</span>,
      children: (
        <Card>
          <Descriptions title="策略参数" bordered column={2}>
            {systemParams.filter(p => p.category === '策略').map(p => (
              <Descriptions.Item key={p.key} label={p.description}>
                <InputNumber value={parseFloat(p.value)} onChange={(v) => handleSaveSystemParam(p.key, String(v))} />
              </Descriptions.Item>
            ))}
          </Descriptions>
          <Divider />
          <Descriptions title="回测参数" bordered column={2}>
            {systemParams.filter(p => p.category === '回测').map(p => (
              <Descriptions.Item key={p.key} label={p.description}>
                <InputNumber value={parseFloat(p.value)} onChange={(v) => handleSaveSystemParam(p.key, String(v))} />
              </Descriptions.Item>
            ))}
          </Descriptions>
          <Divider />
          <Descriptions title="风控参数" bordered column={2}>
            {systemParams.filter(p => p.category === '风控').map(p => (
              <Descriptions.Item key={p.key} label={p.description}>
                <InputNumber value={parseFloat(p.value)} min={0} max={1} step={0.01} onChange={(v) => handleSaveSystemParam(p.key, String(v))} />
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Card>
      )
    },
    {
      key: 'data',
      label: <span><SafetyOutlined /> 数据源设置</span>,
      children: (
        <Card title="股票数据源">
          <Form layout="vertical">
            <Form.Item label="启用实时行情">
              <Switch checked={stockDataEnabled} onChange={setStockDataEnabled} />
            </Form.Item>
            <Form.Item label="数据源">
              <Select value={stockDataSource} onChange={setStockDataSource} style={{ width: 200 }}>
                {stockDataSources.map(s => <Select.Option key={s.value} value={s.value}>{s.label}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item label="接口地址">
              <Input value={stockDataSources.find(s => s.value === stockDataSource)?.endpoint} disabled />
            </Form.Item>
          </Form>
        </Card>
      )
    },
  ]

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={userVisible}
        onCancel={() => { setUserVisible(false); setEditingUser(null); form.resetFields() }}
        onOk={editingUser ? handleEditUser : handleAddUser}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" disabled={!!editingUser} />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="密码" rules={[{ required: true, min: 6, message: '密码至少6位' }]}>
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          <Form.Item name="user_type" label="角色" initialValue="trader">
            <Select>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="trader">交易员</Select.Option>
              <Select.Option value="viewer">查看者</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="is_active" label="状态" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingApi ? '编辑接口' : '添加接口'}
        open={apiVisible}
        onCancel={() => { setApiVisible(false); setEditingApi(null); apiForm.resetFields() }}
        onOk={handleSaveApiConfig}
      >
        <Form form={apiForm} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入接口名称' }]}>
            <Input placeholder="如: 新浪行情API" />
          </Form.Item>
          <Form.Item name="api_type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select>
              <Select.Option value="stock_quote">股票行情</Select.Option>
              <Select.Option value="ai">AI接口</Select.Option>
              <Select.Option value="trade">交易接口</Select.Option>
              <Select.Option value="data">数据接口</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="endpoint" label="接口地址" rules={[{ required: true, message: '请输入接口地址' }]}>
            <Input placeholder="https://api.example.com" />
          </Form.Item>
          <Form.Item name="api_key" label="API Key">
            <Input.Password placeholder="可选" />
          </Form.Item>
          <Form.Item name="api_secret" label="API Secret">
            <Input.Password placeholder="可选" />
          </Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}