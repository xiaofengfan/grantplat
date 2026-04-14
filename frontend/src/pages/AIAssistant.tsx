import { useState, useEffect, useRef } from 'react'
import { Card, Input, Button, List, Space, Modal, Form, Select, message, Tag, Typography, Row, Col, Statistic } from 'antd'
import { SendOutlined, SettingOutlined, DeleteOutlined, RobotOutlined, UserOutlined, StockOutlined, ThunderboltOutlined, BarChartOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { useAuthStore } from '../stores/authStore'

const { Text } = Typography

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  symbol?: string
  analysis_data?: any
}

interface AIConfig {
  id?: number
  provider: string
  api_key?: string
  endpoint?: string
  model: string
  enabled: boolean
}

interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  change_pct: number
  volume: number
  high: number
  low: number
  open: number
  prev_close: number
}

export default function AIAssistant() {
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [configVisible, setConfigVisible] = useState(false)
  const [analyzeSymbol, setAnalyzeSymbol] = useState('')
  const [analyzeName, setAnalyzeName] = useState('')
  const [stockQuote, setStockQuote] = useState<StockQuote | null>(null)
  const [form] = Form.useForm()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const symbol = searchParams.get('symbol')
    const name = searchParams.get('name')
    if (symbol) {
      setAnalyzeSymbol(symbol)
      setAnalyzeName(name || symbol)
      loadStockQuote(symbol)
    }
    loadConversations()
    loadConfig()
  }, [searchParams])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadStockQuote = async (symbol: string) => {
    try {
      const res = await api.get('/stockpool/quotes')
      const quotes = res.data
      const quote = quotes.find((q: any) => q.symbol === symbol)
      if (quote) {
        setStockQuote(quote)
      }
    } catch (error) {
      console.error('加载股票行情失败', error)
    }
  }

  const loadConversations = async () => {
    try {
      const res = await api.get('/ai/conversations', { params: { limit: 50 } })
      const msgs = res.data.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        symbol: m.symbol,
        analysis_data: m.analysis_data
      }))
      setMessages(msgs.reverse())
    } catch (error) {
      console.error('加载对话失败', error)
    }
  }

  const loadConfig = async () => {
    try {
      const res = await api.get('/ai/config')
      if (res.data) {
        form.setFieldsValue(res.data)
      } else {
        form.setFieldsValue({ provider: 'deepseek', model: 'deepseek-chat' })
      }
    } catch (error) {
      form.setFieldsValue({ provider: 'deepseek', model: 'deepseek-chat' })
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const userMessage = { id: Date.now(), role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await api.post('/ai/chat', { message: input, symbol: analyzeSymbol || undefined })
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: res.data.message,
        symbol: analyzeSymbol || undefined
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: '抱歉，AI服务暂时不可用，请检查AI配置或稍后重试。'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!analyzeSymbol.trim()) return
    setLoading(true)

    const userMsg = {
      id: Date.now(),
      role: 'user' as const,
      content: `请分析 ${analyzeSymbol} ${analyzeName} 的股票`,
      symbol: analyzeSymbol
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const res = await api.post('/ai/analyze', {
        symbol: analyzeSymbol,
        analysis_type: 'comprehensive',
        include_quote: true
      })

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: res.data.analysis || res.data.message,
        symbol: analyzeSymbol,
        analysis_data: stockQuote ? {
          price: stockQuote.price,
          change: stockQuote.change,
          change_pct: stockQuote.change_pct,
          volume: stockQuote.volume,
          high: stockQuote.high,
          low: stockQuote.low
        } : undefined
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: `抱歉，分析 ${analyzeSymbol} 时出现问题，请检查AI配置或网络连接。`
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAnalyze = async (type: string) => {
    if (!analyzeSymbol) {
      message.warning('请先在股票池选择一个股票')
      return
    }
    setLoading(true)

    const prompts: Record<string, string> = {
      'technical': `技术分析 ${analyzeSymbol} ${analyzeName}，包括支撑位、压力位、均线系统、MACD、KDJ等指标`,
      'fundamental': `基本面分析 ${analyzeSymbol} ${analyzeName}，包括财务指标、行业地位、估值水平等`,
      'risk': `风险评估 ${analyzeSymbol} ${analyzeName}，包括市场风险、经营风险、政策风险等`,
      'advice': `投资建议 ${analyzeSymbol} ${analyzeName}，给出买入、卖出或持有的建议及理由`
    }

    const userMsg = {
      id: Date.now(),
      role: 'user' as const,
      content: prompts[type] || `分析 ${analyzeSymbol}`,
      symbol: analyzeSymbol
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const res = await api.post('/ai/analyze', {
        symbol: analyzeSymbol,
        analysis_type: type,
        message: prompts[type]
      })
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: res.data.analysis || res.data.message,
        symbol: analyzeSymbol
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      message.error('分析失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      if (!values.api_key) {
        values.api_key = undefined
      }
      await api.post('/ai/config', values)
      message.success('配置保存成功')
      setConfigVisible(false)
    } catch (error) {
      message.error('保存配置失败')
    }
  }

  const handleClear = async () => {
    try {
      await api.delete('/ai/conversations')
      setMessages([])
      message.success('对话已清除')
    } catch (error) {
      message.error('清除失败')
    }
  }

  const handleChangeStock = () => {
    setStockQuote(null)
    setAnalyzeSymbol('')
    setAnalyzeName('')
  }

  return (
    <div style={{ height: 'calc(100vh - 200px)' }}>
      {analyzeSymbol && stockQuote && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col>
              <Space>
                <Tag color="blue" icon={<StockOutlined />} style={{ fontSize: 14, padding: '4px 12px' }}>
                  {analyzeSymbol} {analyzeName}
                </Tag>
                {stockQuote && (
                  <>
                    <Text strong style={{ fontSize: 18 }}>{stockQuote.price.toFixed(2)}</Text>
                    <Text style={{ color: stockQuote.change >= 0 ? '#f5222d' : '#52c41a' }}>
                      {stockQuote.change >= 0 ? '+' : ''}{stockQuote.change.toFixed(2)} ({stockQuote.change_pct.toFixed(2)}%)
                    </Text>
                    <Text type="secondary">开盘: {stockQuote.open} | 最高: {stockQuote.high} | 最低: {stockQuote.low}</Text>
                  </>
                )}
              </Space>
            </Col>
            <Col flex="auto">
              <Space style={{ float: 'right' }}>
                <Button size="small" onClick={() => handleQuickAnalyze('technical')} icon={<BarChartOutlined />}>技术分析</Button>
                <Button size="small" onClick={() => handleQuickAnalyze('fundamental')} icon={<StockOutlined />}>基本面</Button>
                <Button size="small" onClick={() => handleQuickAnalyze('risk')} icon={<ThunderboltOutlined />}>风险评估</Button>
                <Button size="small" onClick={() => handleQuickAnalyze('advice')} type="primary" icon={<RobotOutlined />}>投资建议</Button>
                <Button size="small" onClick={handleChangeStock}>切换股票</Button>
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      <div style={{ display: 'flex', gap: 16, height: analyzeSymbol ? 'calc(100% - 70px)' : '100%' }}>
        <Card
          title="AI 智能助手"
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          extra={
            <Space>
              <Button icon={<SettingOutlined />} onClick={() => setConfigVisible(true)}>设置</Button>
              <Button icon={<DeleteOutlined />} onClick={handleClear}>清空</Button>
            </Space>
          }
        >
          <div style={{ flex: 1, overflow: 'auto', marginBottom: 16 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                <RobotOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <p>还没有任何对话</p>
                <p>输入股票代码进行AI分析，或直接向我提问</p>
              </div>
            )}
            <List
              dataSource={messages}
              renderItem={(item) => (
                <List.Item style={{ justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start', border: 'none' }}>
                  <div style={{
                    maxWidth: '75%',
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: item.role === 'user' ? '#1890ff' : '#f5f5f5',
                    color: item.role === 'user' ? '#fff' : '#333'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      {item.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                      <span style={{ fontSize: 12, opacity: 0.7 }}>{item.role === 'user' ? user?.username : 'AI助手'}</span>
                      {item.symbol && <Tag color="blue" style={{ margin: 0, fontSize: 10 }}>{item.symbol}</Tag>}
                    </div>
                    {item.analysis_data && (
                      <div style={{ background: 'rgba(0,0,0,0.05)', padding: 8, borderRadius: 8, marginBottom: 8, fontSize: 12 }}>
                        <Row gutter={12}>
                          <Col><Text type="secondary">现价:</Text> <Text strong>{item.analysis_data.price?.toFixed(2)}</Text></Col>
                          <Col><Text type="secondary">涨跌:</Text> <Text style={{ color: item.analysis_data.change >= 0 ? '#f5222d' : '#52c41a' }}>{item.analysis_data.change >= 0 ? '+' : ''}{item.analysis_data.change?.toFixed(2)}%</Text></Col>
                          <Col><Text type="secondary">成交量:</Text> {(item.analysis_data.volume / 10000).toFixed(0)}万</Col>
                        </Row>
                      </div>
                    )}
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{item.content}</div>
                  </div>
                </List.Item>
              )}
            />
            <div ref={messagesEndRef} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={handleSend}
              placeholder={analyzeSymbol ? `关于 ${analyzeSymbol} 的问题...` : '输入问题，AI助手为你解答...'}
              style={{ flex: 1 }}
              disabled={loading}
            />
            <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={loading}>发送</Button>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <Input
              value={analyzeSymbol}
              onChange={(e) => setAnalyzeSymbol(e.target.value.toUpperCase())}
              placeholder="股票代码"
              style={{ width: 100 }}
              disabled={loading}
            />
            <Button onClick={handleAnalyze} disabled={loading || !analyzeSymbol.trim()} type="primary" icon={<RobotOutlined />}>
              AI分析
            </Button>
            <Text type="secondary" style={{ marginLeft: 8 }}>输入股票代码，获取AI分析报告</Text>
          </div>
        </Card>

        <Card title="快捷功能" style={{ width: 260 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button block icon={<BarChartOutlined />} onClick={() => setInput('分析当前市场趋势')}>📊 市场趋势分析</Button>
            <Button block icon={<StockOutlined />} onClick={() => setInput('推荐一些优质的白马股')}>🏆 白马股推荐</Button>
            <Button block icon={<BarChartOutlined />} onClick={() => setInput('解释什么是MACD金叉')}>📈 技术指标解释</Button>
            <Button block icon={<ThunderboltOutlined />} onClick={() => setInput('帮我分析量化策略的风险')}>🛡️ 策略风险分析</Button>
            <Button block icon={<RobotOutlined />} onClick={() => setInput('解释最近的监管政策')}>📜 政策解读</Button>
          </Space>

          <div style={{ marginTop: 16 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>提示：</Text>
            <ul style={{ fontSize: 12, color: '#999', paddingLeft: 16, marginTop: 4 }}>
              <li>从股票池点击"AI分析"可直接分析</li>
              <li>输入股票代码可快速获取分析</li>
              <li>支持技术面、基本面、风险评估</li>
            </ul>
          </div>
        </Card>
      </div>

      <Modal title="AI 配置" open={configVisible} onCancel={() => setConfigVisible(false)} onOk={handleSaveConfig}>
        <Form form={form} layout="vertical">
          <Form.Item name="provider" label="AI服务商" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="deepseek">DeepSeek</Select.Option>
              <Select.Option value="openai">OpenAI</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="api_key" label="API密钥" rules={[{ required: true, message: '请输入API密钥' }]}>
            <Input.Password placeholder="请输入API密钥" />
          </Form.Item>
          <Form.Item name="endpoint" label="自定义Endpoint">
            <Input placeholder="可选，不填则使用默认地址" />
          </Form.Item>
          <Form.Item name="model" label="模型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="deepseek-chat">DeepSeek Chat</Select.Option>
              <Select.Option value="deepseek-coder">DeepSeek Coder</Select.Option>
              <Select.Option value="gpt-4">GPT-4</Select.Option>
              <Select.Option value="gpt-3.5-turbo">GPT-3.5</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="enabled" label="启用AI" valuePropName="checked" initialValue={true}>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}