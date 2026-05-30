import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const { user, profile, signOut } = useAuth()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [stats, setStats] = useState({ tickets: 0, events: 0, spent: 0 })

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setPhone(profile.phone || '')
    }
    if (user) fetchStats()
  }, [profile, user])

  async function fetchStats() {
    const { data: tickets } = await supabase
      .from('tickets')
      .select('quantity, total_price, event_id')
      .eq('user_id', user.id)

    const totalTickets = tickets?.reduce((sum, t) => sum + t.quantity, 0) || 0
    const uniqueEvents = new Set(tickets?.map(t => t.event_id)).size
    const totalSpent = tickets?.reduce((sum, t) => sum + Number(t.total_price), 0) || 0

    setStats({ tickets: totalTickets, events: uniqueEvents, spent: totalSpent })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(price)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone })
      .eq('id', user.id)

    if (error) {
      setMessage('Erro ao guardar. Tente novamente.')
    } else {
      setMessage('Perfil atualizado com sucesso!')
    }
    setSaving(false)
  }

  const getInitial = () => {
    return (fullName || user?.email || '?').charAt(0).toUpperCase()
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <span className="text-indigo-400 text-sm font-medium tracking-wider uppercase">Conta</span>
          <h1 className="text-4xl font-bold text-white mt-2">Meu Perfil</h1>
        </div>

        {/* Profile card */}
        <div className="glass rounded-2xl overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative">
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Avatar */}
          <div className="px-6 -mt-12 relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold border-4 border-gray-900 shadow-xl">
              {getInitial()}
            </div>
          </div>

          {/* Info */}
          <div className="px-6 pb-6 pt-4">
            <h2 className="text-2xl font-bold text-white">{profile?.full_name || 'Utilizador'}</h2>
            <p className="text-gray-400">{user?.email}</p>
            {profile?.role === 'admin' && (
              <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-400 font-medium">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                Administrador
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.tickets}</div>
            <div className="text-xs text-gray-500 mt-1">Bilhetes</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.events}</div>
            <div className="text-xs text-gray-500 mt-1">Eventos</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-indigo-400">{formatPrice(stats.spent)}</div>
            <div className="text-xs text-gray-500 mt-1">Total Gasto</div>
          </div>
        </div>

        {/* Edit form */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Editar Perfil</h3>

          {message && (
            <div className={`mb-6 p-4 rounded-xl text-sm ${
              message.includes('sucesso')
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nome completo</label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder-gray-500 transition-all duration-300"
                  placeholder="Seu nome"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/30 border border-gray-700/30 text-gray-500 rounded-xl cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">O email não pode ser alterado</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Número de telefone (M-Pesa)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="18" r="1" fill="currentColor"/>
                    <line x1="9" y1="6" x2="15" y2="6" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder-gray-500 transition-all duration-300"
                  placeholder="84 123 4567"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Número para receber pagamentos M-Pesa</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 disabled:opacity-50 btn-glow"
              >
                {saving ? 'A guardar...' : 'Guardar Alterações'}
              </button>
            </div>
          </form>
        </div>

        {/* Danger zone */}
        <div className="glass rounded-2xl p-6 mt-6 border border-red-500/10">
          <h3 className="text-lg font-semibold text-white mb-4">Zona de Perigo</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Terminar sessão</p>
              <p className="text-sm text-gray-500">Sair da sua conta neste dispositivo</p>
            </div>
            <button
              onClick={signOut}
              className="px-6 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-all duration-300"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
