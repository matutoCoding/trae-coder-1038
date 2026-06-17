import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useStore } from '@/store'

export default function Login() {
  const navigate = useNavigate()
  const login = useStore((s) => s.login)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    if (!phone || !password) {
      setError('请输入手机号和密码')
      return
    }
    const success = login(phone, password)
    if (success) {
      navigate('/')
    } else {
      setError('手机号或密码错误')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-800 to-primary-900">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">电梯维保管理系统</h1>
          <p className="mt-1 text-sm text-gray-500">专业电梯维保管理平台</p>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="tel"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError('') }}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {error && (
            <p className="text-center text-sm text-danger-500">{error}</p>
          )}

          <button
            onClick={handleLogin}
            className="w-full rounded-md bg-primary-500 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-600 active:bg-primary-700"
          >
            登录
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          © 2026 电梯维保管理系统 版权所有
        </p>
      </div>
    </div>
  )
}
