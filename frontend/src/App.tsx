import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import StrategyList from './pages/StrategyList'
import StrategyEditor from './pages/StrategyEditor'
import Backtest from './pages/Backtest'
import SimTrade from './pages/SimTrade'
import LiveTrade from './pages/LiveTrade'
import Transactions from './pages/Transactions'
import RiskMonitor from './pages/RiskMonitor'
import DataCenter from './pages/DataCenter'
import StockPool from './pages/StockPool'
import AIAssistant from './pages/AIAssistant'
import Settings from './pages/Settings'
import AutoTrade from './pages/AutoTrade'
import { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="stockpool" element={<StockPool />} />
        <Route path="strategies" element={<StrategyList />} />
        <Route path="strategies/new" element={<StrategyEditor />} />
        <Route path="strategies/:id" element={<StrategyEditor />} />
        <Route path="auto-trade" element={<AutoTrade />} />
        <Route path="backtest" element={<Backtest />} />
        <Route path="sim-trade" element={<SimTrade />} />
        <Route path="live-trade" element={<LiveTrade />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="risk" element={<RiskMonitor />} />
        <Route path="data" element={<DataCenter />} />
        <Route path="ai" element={<AIAssistant />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App