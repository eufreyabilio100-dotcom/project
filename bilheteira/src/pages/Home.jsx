import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import EventCard from '../components/EventCard'

export default function Home() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    const { data } = await supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(6)
    setEvents(data || [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen">
      {/* Hero com imagem de fundo */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/inicio.jpg')" }}
        />
        <div className="absolute inset-0 bg-gray-950/80" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto text-center px-4">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-8">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
              Eventos ao vivo em Moçambique
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-slide-up">
            <span className="text-white">A sua entrada</span>
            <br />
            <span className="gradient-text">digital</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto animate-slide-up">
            Descubra e compre bilhetes para os melhores eventos em Moçambique.
            Rápido, seguro e 100% digital.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link
              to="/eventos"
              className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 hover:scale-105"
            >
              Explorar Eventos
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            {!user && (
              <Link
                to="/registo"
                className="inline-flex items-center justify-center px-8 py-4 border border-gray-700 text-gray-300 rounded-xl font-semibold text-lg hover:border-indigo-500 hover:text-white hover:bg-indigo-500/10 transition-all duration-200"
              >
                Criar Conta
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12 mt-16 animate-slide-up">
            {[
              { value: '10K+', label: 'Bilhetes vendidos' },
              { value: '50+', label: 'Eventos realizados' },
              { value: '4.9', label: 'Avaliação média' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Próximos eventos */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
            <div>
              <span className="text-indigo-400 text-sm font-medium tracking-wider uppercase">Não perca</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">Próximos Eventos</h2>
            </div>
            <Link to="/eventos" className="group flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Ver todos os eventos
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-800/50 rounded-2xl h-80 animate-pulse border border-gray-700/50" />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass rounded-2xl">
              <div className="text-5xl mb-4">🎭</div>
              <p className="text-gray-400 text-lg">Nenhum evento disponível no momento</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-4 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-indigo-400 text-sm font-medium tracking-wider uppercase">Porquê escolher-nos</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">A melhor experiência</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Compra Segura',
                desc: 'Pagamentos protegidos com encriptação de ponta a ponta.'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Instantâneo',
                desc: 'Receba o seu bilhete digital imediatamente após a compra.'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
                title: '100% Digital',
                desc: 'Apresente o bilhete no telemóvel. Sem papel, sem filas.'
              }
            ].map((feature, i) => (
              <div key={i} className="glass rounded-2xl p-8 hover-lift">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-indigo-400 text-sm font-medium tracking-wider uppercase">Testemunhos</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">O que dizem sobre nós</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Ana Macamo',
                role: 'Estudante universitária',
                avatar: 'A',
                text: 'Comprei bilhetes para o festival de música e foi super fácil! Recebi na hora no telemóvel. Recomendo!',
                rating: 5
              },
              {
                name: 'Carlos Mondlane',
                role: 'Empresário',
                avatar: 'C',
                text: 'Organizei um evento corporativo e a plataforma facilitou imenso a venda de bilhetes. Excelente!',
                rating: 5
              },
              {
                name: 'Fatima Nhaca',
                role: 'Professora',
                avatar: 'F',
                text: 'Agora não preciso mais de fazer filas para comprar bilhetes. Compro tudo pelo telemóvel em segundos!',
                rating: 5
              }
            ].map((testimonial, i) => (
              <div key={i} className="glass rounded-2xl p-8 hover-lift">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <svg key={j} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.text}"</p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-white font-medium">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - só aparece para utilizadores não logados */}
      {!user && (
        <section className="relative py-24 px-4 bg-gradient-to-b from-gray-950 to-gray-900">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass rounded-3xl p-12 md:p-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pronto para começar?</h2>
              <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                Junte-se a milhares de utilizadores que já descobriram a forma mais fácil de comprar bilhetes.
              </p>
              <Link
                to="/registo"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 hover:scale-105"
              >
                Criar Conta Gratuita
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
