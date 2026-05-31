import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function MyTickets() {
  const { user, profile } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchTickets()
  }, [user])

  async function fetchTickets() {
    const { data } = await supabase
      .from('tickets')
      .select('*, events(*)')
      .eq('user_id', user.id)
      .order('purchased_at', { ascending: false })
    setTickets(data || [])
    setLoading(false)
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const formatPrice = (p) => new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(p)

  const getStatus = (d) => {
    const diff = new Date(d) - new Date()
    if (diff < 0) return { label: 'Realizado', color: 'gray' }
    const days = Math.floor(diff / 86400000)
    if (days === 0) return { label: 'Hoje', color: 'green' }
    if (days === 1) return { label: 'Amanhã', color: 'yellow' }
    if (days <= 7) return { label: `Em ${days} dias`, color: 'blue' }
    return { label: 'Confirmado', color: 'indigo' }
  }

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div></div>

  const totalSpent = tickets.reduce((s, t) => s + Number(t.total_price), 0)
  const totalTickets = tickets.reduce((s, t) => s + t.quantity, 0)

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/meusbilhetes.png')" }} />
      <div className="absolute inset-0 bg-gray-950/90" />
      <div className="relative max-w-4xl mx-auto">
        <div className="mb-8">
          <span className="text-indigo-400 text-sm font-medium tracking-wider uppercase">A sua conta</span>
          <h1 className="text-4xl font-bold text-white mt-2">Meus Bilhetes</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass rounded-xl p-5"><p className="text-sm text-gray-500">Total de Bilhetes</p><p className="text-xl font-bold text-white">{totalTickets}</p></div>
          <div className="glass rounded-xl p-5"><p className="text-sm text-gray-500">Eventos</p><p className="text-xl font-bold text-white">{tickets.length}</p></div>
          <div className="glass rounded-xl p-5"><p className="text-sm text-gray-500">Total Gasto</p><p className="text-xl font-bold text-indigo-400">{formatPrice(totalSpent)}</p></div>
        </div>

        {tickets.length > 0 ? (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const status = getStatus(ticket.events?.date)
              return (
                <div key={ticket.id} className="glass rounded-2xl overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-32 h-24 sm:h-auto bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                      {ticket.events?.image_url ? <img src={ticket.events.image_url} alt="" className="w-full h-full object-cover" /> : <span className="text-3xl opacity-50">🎫</span>}
                    </div>
                    <div className="flex-1 p-5">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">{ticket.events?.title}</h3>
                          <div className="flex flex-wrap gap-3">
                            <span className="flex items-center gap-1.5 text-sm text-gray-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              {ticket.events?.date ? formatDate(ticket.events.date) : 'N/A'}
                            </span>
                            {ticket.events?.location && (
                              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {ticket.events.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{ticket.quantity}x bilhete(s)</p>
                          <p className="text-xl font-bold text-white">{formatPrice(ticket.total_price)}</p>
                          <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                            status.color === 'green' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            status.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                            status.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            status.color === 'gray' ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20' :
                            'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.color === 'green' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                            {status.label}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-800">
                        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Dados do titular</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            <span className="text-sm text-gray-300">{profile?.full_name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <span className="text-sm text-gray-300">{user?.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            <span className="text-sm text-gray-300">+258 {profile?.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-800/50 flex items-center justify-between">
                        <span className="text-xs text-gray-600">Comprado em {formatDate(ticket.purchased_at)}</span>
                        <Link to={`/eventos/${ticket.event_id}`} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Ver evento <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20 glass rounded-2xl">
            <h3 className="text-xl font-semibold text-white mb-2">Ainda não tem bilhetes</h3>
            <Link to="/eventos" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium mt-4">Explorar Eventos</Link>
          </div>
        )}
      </div>
    </div>
  )
}
