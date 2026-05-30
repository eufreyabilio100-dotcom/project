import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function EventCard({ event }) {
  const [isHovered, setIsHovered] = useState(false)

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(price)
  }

  const getTimeLeft = () => {
    const now = new Date()
    const eventDate = new Date(event.date)
    const diff = eventDate - now
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days < 0) return null
    if (days === 0) return 'Hoje'
    if (days === 1) return 'Amanhã'
    return `em ${days} dias`
  }

  const timeLeft = getTimeLeft()

  return (
    <Link
      to={`/eventos/${event.id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative glass rounded-2xl overflow-hidden hover-lift card-shine transition-all duration-500">
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
              <div className="text-6xl opacity-50 group-hover:scale-125 transition-transform duration-500">🎫</div>
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />

          {/* Price badge */}
          <div className="absolute top-4 right-4">
            <div className="px-3 py-1.5 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700/50">
              <span className="text-sm font-bold text-white">{formatPrice(event.price)}</span>
            </div>
          </div>

          {/* Time badge */}
          {timeLeft && (
            <div className="absolute top-4 left-4">
              <div className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                timeLeft === 'Hoje'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : timeLeft === 'Amanhã'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-gray-900/80 text-gray-300 border border-gray-700/50'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  timeLeft === 'Hoje' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                }`} />
                {timeLeft}
              </div>
            </div>
          )}

          {/* Hover overlay */}
          <div className={`absolute inset-0 bg-indigo-600/20 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">
            {event.title}
          </h3>

          <div className="flex items-center gap-4 mb-3">
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(event.date)}
            </span>
          </div>

          {event.location && (
            <span className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{event.location}</span>
            </span>
          )}

          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{event.description}</p>

          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            <div className="flex items-center gap-2">
              {event.available_tickets > 0 ? (
                <>
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400">{event.available_tickets} disponíveis</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-red-400 rounded-full" />
                  <span className="text-xs text-red-400">Esgotado</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1 text-indigo-400 text-sm font-medium group-hover:gap-2 transition-all duration-300">
              Ver mais
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
