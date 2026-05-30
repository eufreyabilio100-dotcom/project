import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import EventCard from '../components/EventCard'

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    const { data } = await supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
    setEvents(data || [])
    setLoading(false)
  }

  const filtered = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location?.toLowerCase().includes(search.toLowerCase())

    if (activeFilter === 'all') return matchesSearch
    if (activeFilter === 'soon') {
      const daysUntil = Math.ceil((new Date(e.date) - new Date()) / (1000 * 60 * 60 * 24))
      return matchesSearch && daysUntil <= 7
    }
    if (activeFilter === 'available') return matchesSearch && e.available_tickets > 0
    return matchesSearch
  })

  const filters = [
    { id: 'all', label: 'Todos' },
    { id: 'soon', label: 'Esta semana' },
    { id: 'available', label: 'Disponíveis' },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/image_eventos.jpg')" }}
      />
      <div className="absolute inset-0 bg-gray-950/85" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <span className="text-indigo-400 text-sm font-medium tracking-wider uppercase">Descubra</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">Eventos Disponíveis</h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            Encontre os melhores eventos em Moçambique. Filtre por categoria, data ou disponibilidade.
          </p>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Pesquisar por nome ou local..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder-gray-500 transition-all duration-300"
            />
          </div>

          <div className="flex gap-2">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeFilter === filter.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:text-white hover:border-gray-600'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            {filtered.length} evento{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Events grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((event, index) => (
              <div key={event.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <EventCard event={event} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass rounded-2xl">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum evento encontrado</h3>
            <p className="text-gray-500">Tente ajustar os filtros ou pesquisar por outro termo</p>
          </div>
        )}
      </div>
    </div>
  )
}
