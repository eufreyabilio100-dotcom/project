import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import InstallPrompt from './components/InstallPrompt'
import Home from './pages/Home'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import MyTickets from './pages/MyTickets'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-950 text-white">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/eventos" element={<Events />} />
              <Route path="/eventos/:id" element={<EventDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registo" element={<Register />} />
              <Route
                path="/meus-bilhetes"
                element={
                  <ProtectedRoute>
                    <MyTickets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <Admin />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="relative border-t border-gray-800/50">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-950 to-gray-900" />
            <div className="relative max-w-7xl mx-auto px-4 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Brand */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    </div>
                    <span className="text-xl font-bold gradient-text">Bilheteira</span>
                  </div>
                  <p className="text-gray-500 text-sm max-w-sm">
                    A plataforma líder de venda de bilhetes digitais em Moçambique.
                    Rápido, seguro e 100% digital.
                  </p>
                </div>

                {/* Links */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-4">Navegação</h4>
                  <ul className="space-y-2">
                    <li><a href="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Início</a></li>
                    <li><a href="/eventos" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Eventos</a></li>
                    <li><a href="/login" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Entrar</a></li>
                    <li><a href="/registo" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Registar</a></li>
                  </ul>
                </div>

                {/* Contact */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-4">Contacto</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-500 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      info@bilheteira.mz
                    </li>
                    <li className="flex items-center gap-2 text-gray-500 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      +258 84 123 4567
                    </li>
                    <li className="flex items-center gap-2 text-gray-500 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Maputo, Moçambique
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-gray-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-gray-600 text-sm">
                  © {new Date().getFullYear()} Bilheteira. Todos os direitos reservados.
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600 text-sm">Feito com ❤️ em Moçambique</span>
                </div>
              </div>
            </div>
          </footer>
          <InstallPrompt />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
