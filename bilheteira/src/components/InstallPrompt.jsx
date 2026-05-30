import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if user dismissed before
    const dismissed = localStorage.getItem('pwa-dismissed')
    if (dismissed) {
      const dismissedDate = new Date(dismissed)
      const now = new Date()
      // Show again after 1 hour
      if ((now - dismissedDate) < 60 * 60 * 1000) {
        return
      }
    }

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Show prompt after 3 seconds
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // For iOS - show manual install instructions
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    if (isIOS && !window.navigator.standalone) {
      setTimeout(() => setShowPrompt(true), 3000)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setIsInstalled(true)
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  function handleDismiss() {
    setShowPrompt(false)
    localStorage.setItem('pwa-dismissed', new Date().toISOString())
  }

  if (!showPrompt || isInstalled) return null

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 z-50 animate-slide-up">
      <div className="glass rounded-2xl p-5 border border-indigo-500/30 shadow-2xl shadow-indigo-500/10">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">Instalar Bilheteira</h3>
            <p className="text-gray-400 text-sm mb-3">
              {isIOS
                ? 'Toque no botão partilhar e depois em "Adicionar ao ecrã inicial"'
                : 'Instale a app para acesso rápido e notificações de eventos'
              }
            </p>

            <div className="flex gap-2">
              {!isIOS && (
                <button
                  onClick={handleInstall}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all duration-200"
                >
                  Instalar
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-gray-400 text-sm hover:text-white transition-colors"
              >
                {isIOS ? 'Entendi' : 'Agora não'}
              </button>
            </div>
          </div>

          {/* Close */}
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-white transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
