import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function MyTickets() {
  const { user } = useAuth()
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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(price)
  }

  const getEventStatus = (dateStr) => {
    const now = new Date()
    const eventDate = new Date(dateStr)
    if (eventDate < now) return { label: 'Realizado', color: 'gray' }
    const diff = eventDate - now
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return { label: 'Hoje', color: 'green' }
    if (days === 1) return { label: 'Amanhã', color: 'yellow' }
    if (days <= 7) return { label: `Em ${days} dias`, color: 'blue' }
    return { label: 'Confirmado', color: 'indigo' }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  const totalSpent = tickets.reduce((sum, t) => sum + Number(t.total_price), 0)
  const totalTickets = tickets.reduce((sum, t) => sum + t.quantity, 0)

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/meusbilhetes.png')" }}
      />
      <div className="absolute inset-0 bg-gray-950/90" />

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <span className="text-indigo-400 text-sm font-medium tracking-wider uppercase">A sua conta</span>
          <h1 className="text-4xl font-bold text-white mt-2">Meus Bilhetes</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de Bilhetes</p>
                <p className="text-xl font-bold text-white">{totalTickets}</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Eventos</p>
                <p className="text-xl font-bold text-white">{tickets.length}</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Gasto</p>
                <p className="text-xl font-bold text-indigo-400">{formatPrice(totalSpent)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets list */}
        {tickets.length > 0 ? (
          <div className="space-y-4">
            {tickets.map((ticket, index) => {
              const status = getEventStatus(ticket.events?.date)
              return (
                <div key={ticket.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="glass rounded-2xl overflow-hidden hover-lift">
                    <div className="flex flex-col sm:flex-row">
                      {/* Event image */}
                      <div className="sm:w-32 h-24 sm:h-auto bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                        {ticket.events?.image_url ? (
                          <img src={ticket.events.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl opacity-50">🎫</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-5">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {ticket.events?.title}
                            </h3>
                            <div className="flex flex-wrap gap-3">
                              <span className="flex items-center gap-1.5 text-sm text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {ticket.events?.date ? formatDate(ticket.events.date) : 'Data não disponível'}
                              </span>
                              {ticket.events?.location && (
                                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
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
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                status.color === 'green' ? 'bg-green-400 animate-pulse' :
                                status.color === 'yellow' ? 'bg-yellow-400' :
                                'bg-gray-400'
                              }`} />
                              {status.label}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                          <span className="text-xs text-gray-600">
                            Comprado em {formatDate(ticket.purchased_at)}
                          </span>
                          <Link
                            to={`/eventos/${ticket.event_id}`}
                            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                          >
                            Ver evento
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20 glass rounded-2xl">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Ainda não tem bilhetes</h3>
            <p className="text-gray-500 mb-6">Explore os eventos disponíveis e compre o seu primeiro bilhete!</p>
            <Link
              to="/eventos"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-500 hover:to-purple-500 transition-all duration-300"
            >
              Explorar Eventos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
