import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import MpesaIcon from '../components/MpesaIcon'

export default function EventDetail() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [mpesaNumber, setMpesaNumber] = useState('')
  const [paymentStep, setPaymentStep] = useState('form') // form, processing, success

  useEffect(() => {
    fetchEvent()
  }, [id])

  useEffect(() => {
    if (profile?.phone) {
      setMpesaNumber(profile.phone)
    }
  }, [profile])

  async function fetchEvent() {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
    setEvent(data)
    setLoading(false)
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('pt-PT', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('pt-PT', {
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

  const getTimeLeft = () => {
    if (!event) return null
    const now = new Date()
    const eventDate = new Date(event.date)
    const diff = eventDate - now
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    if (days < 0) return null
    if (days === 0 && hours <= 0) return 'Começa em breve!'
    if (days === 0) return `Começa em ${hours}h`
    if (days === 1) return 'Amanhã'
    return `Faltam ${days} dias`
  }

  function handleBuyClick() {
    if (!user) {
      navigate('/login')
      return
    }
    setShowPaymentModal(true)
    setPaymentStep('form')
    setMessage('')
  }

  function validateMpesaNumber(num) {
    // Mozambique M-Pesa numbers: 84/85 + 7 digits
    const cleaned = num.replace(/\s/g, '')
    return /^(84|85)\d{7}$/.test(cleaned) || /^(\+258)?(84|85)\d{7}$/.test(cleaned)
  }

  async function handlePayment(e) {
    e.preventDefault()

    if (!validateMpesaNumber(mpesaNumber)) {
      setMessage('Número M-Pesa inválido. Use o formato 84 XXX XXXX ou 85 XXX XXXX')
      setMessageType('error')
      return
    }

    // Demo: processamento instantâneo
    setPaymentStep('processing')
    setMessage('')

    try {
      const totalPrice = event.price * quantity
      const cleanNumber = mpesaNumber.replace(/\s/g, '').replace('+258', '')

      const { error } = await supabase.from('tickets').insert({
        event_id: event.id,
        user_id: user.id,
        quantity,
        total_price: totalPrice,
        payment_method: 'mpesa',
        payment_phone: cleanNumber
      })

      if (error) throw error

      await supabase
        .from('events')
        .update({ available_tickets: event.available_tickets - quantity })
        .eq('id', event.id)

      // Guardar telefone no perfil se não tiver
      if (!profile?.phone) {
        await supabase
          .from('profiles')
          .update({ phone: cleanNumber })
          .eq('id', user.id)
      }

      // Sucesso imediato
      setPaymentStep('success')
      fetchEvent()
    } catch (err) {
      setPaymentStep('form')
      setMessage('Erro ao processar pagamento. Tente novamente.')
      setMessageType('error')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-white mb-2">Evento não encontrado</h2>
          <p className="text-gray-400 mb-6">O evento que procura não existe ou foi removido.</p>
          <Link to="/eventos" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar aos eventos
          </Link>
        </div>
      </div>
    )
  }

  const timeLeft = getTimeLeft()

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-gray-300 transition-colors">Início</Link>
          <span>/</span>
          <Link to="/eventos" className="hover:text-gray-300 transition-colors">Eventos</Link>
          <span>/</span>
          <span className="text-gray-300">{event.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden">
              {event.image_url ? (
                <img src={event.image_url} alt={event.title} className="w-full h-64 md:h-80 object-cover" />
              ) : (
                <div className="w-full h-64 md:h-80 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
                  <span className="text-8xl opacity-50">🎫</span>
                </div>
              )}

              {/* Overlay badges */}
              <div className="absolute top-4 left-4">
                {timeLeft && (
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    timeLeft === 'Hoje' || timeLeft.includes('breve')
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-gray-900/80 text-gray-300 border border-gray-700/50 backdrop-blur-sm'
                  }`}>
                    {timeLeft}
                  </span>
                )}
              </div>
            </div>

            {/* Title and info */}
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">{event.title}</h1>

              <div className="flex flex-wrap gap-4 mb-6">
                <span className="flex items-center gap-2 text-gray-300">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Data</div>
                    <div className="font-medium">{formatDate(event.date)}</div>
                  </div>
                </span>

                <span className="flex items-center gap-2 text-gray-300">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Hora</div>
                    <div className="font-medium">{formatTime(event.date)}</div>
                  </div>
                </span>

                {event.location && (
                  <span className="flex items-center gap-2 text-gray-300">
                    <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Local</div>
                      <div className="font-medium">{event.location}</div>
                    </div>
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Sobre o evento</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>
          </div>

          {/* Sidebar - Purchase */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <span className="text-2xl md:text-3xl font-bold text-white">{formatPrice(event.price)}</span>
                <span className="text-sm text-gray-500">por bilhete</span>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-3 mb-6 p-4 bg-gray-800/50 rounded-xl">
                {event.available_tickets > 0 ? (
                  <>
                    <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <div>
                      <div className="text-sm font-medium text-white">{event.available_tickets} bilhetes disponíveis</div>
                      <div className="text-xs text-gray-500">Venda rápida</div>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="w-3 h-3 bg-red-400 rounded-full" />
                    <div>
                      <div className="text-sm font-medium text-red-400">Esgotado</div>
                      <div className="text-xs text-gray-500">Sem bilhetes disponíveis</div>
                    </div>
                  </>
                )}
              </div>

              {event.available_tickets > 0 && (
                <>
                  {/* Quantity selector */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-3">Quantidade</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-12 text-center text-xl font-bold text-white">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(10, event.available_tickets, quantity + 1))}
                        className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                    <span className="text-gray-300 font-medium">Total</span>
                    <span className="text-xl md:text-2xl font-bold text-white">{formatPrice(event.price * quantity)}</span>
                  </div>

                  {/* Buy button */}
                  <button
                    onClick={handleBuyClick}
                    className="w-full py-4 bg-gradient-to-r from-[#E3002B] to-[#FF6B00] text-white rounded-xl font-semibold text-lg hover:from-[#CC0027] hover:to-[#E65F00] transition-all duration-300 flex items-center justify-center gap-3 btn-glow"
                  >
                    <MpesaIcon className="h-6 w-auto" />
                    <span>Pagar com M-Pesa</span>
                  </button>
                </>
              )}

              {/* Info */}
              <div className="mt-6 pt-6 border-t border-gray-800 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Compra 100% segura
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <MpesaIcon className="h-5 w-auto" />
                  Pagamento via M-Pesa
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#E3002B] to-[#FF6B00] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MpesaIcon className="h-8 w-auto" />
                  <div>
                    <h3 className="text-white font-bold">Pagamento M-Pesa</h3>
                    <p className="text-white/80 text-sm">Rápido e seguro</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {paymentStep === 'form' && (
                <form onSubmit={handlePayment}>
                  {/* Order summary */}
                  <div className="mb-6 p-4 bg-gray-800/50 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">{event.title}</span>
                      <span className="text-white text-sm">{quantity}x</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                      <span className="text-gray-300 font-medium">Total</span>
                      <span className="text-xl font-bold text-white">{formatPrice(event.price * quantity)}</span>
                    </div>
                  </div>

                  {/* M-Pesa number */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Número M-Pesa</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <MpesaIcon className="h-5 w-auto" />
                      </div>
                      <input
                        type="tel"
                        value={mpesaNumber}
                        onChange={e => setMpesaNumber(e.target.value)}
                        className="w-full pl-20 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl focus:ring-2 focus:ring-[#E3002B] focus:border-[#E3002B] outline-none placeholder-gray-500 transition-all duration-300"
                        placeholder="84 123 4567"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Introduza o número registado no M-Pesa</p>
                  </div>

                  {message && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-[#E3002B] to-[#FF6B00] text-white rounded-xl font-semibold hover:from-[#CC0027] hover:to-[#E65F00] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Confirmar Pagamento
                  </button>
                </form>
              )}

              {paymentStep === 'processing' && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-[#E3002B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MpesaIcon className="h-10 w-auto" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">A processar pagamento</h3>
                  <p className="text-gray-400 mb-6">Aguarde enquanto confirmamos o seu pagamento...</p>
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E3002B]"></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-6">Não feche esta janela</p>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Pagamento Confirmado!</h3>
                  <p className="text-gray-400 mb-6">Os seus bilhetes foram enviados para o seu perfil.</p>

                  <div className="p-4 bg-gray-800/50 rounded-xl mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Bilhetes</span>
                      <span className="text-white">{quantity}x</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-400 text-sm">Total pago</span>
                      <span className="text-green-400 font-bold">{formatPrice(event.price * quantity)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      to="/meus-bilhetes"
                      className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-center"
                    >
                      Ver Bilhetes
                    </Link>
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 py-3 border border-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
