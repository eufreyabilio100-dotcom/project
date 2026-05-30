export default function MpesaIcon({ className = "w-6 h-6" }) {
  return (
    <img
      src="/mpesa-logo.png"
      alt="M-Pesa"
      className={className}
      style={{ display: 'inline-block' }}
      onError={(e) => {
        // Fallback para SVG se PNG não existir
        e.target.src = '/mpesa-logo.svg'
      }}
    />
  )
}
