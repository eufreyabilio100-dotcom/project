import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [events, setEvents] = useState([])
  const [users, setUsers] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const [stats, setStats] = useState({ totalEvents: 0, totalTickets: 0, totalRevenue: 0, totalUsers: 0 })
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '', price: '', available_tickets: '', image_url: '' })

  // User management state
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [userTickets, setUserTickets] = useState([])
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [userForm, setUserForm] = useState({ full_name: '', phone: '', role: '' })
  const [showUserEditModal, setShowUserEditModal] = useState(false)

  // Notifications
  const [notification, setNotification] = useState(null)

  // Dashboard period filter
  const [dashboardPeriod, setDashboardPeriod] = useState('all')

  useEffect(() => { fetchData() }, [])

  function showNotif(message, type = 'success') {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  async function fetchData() {
    const { data: eventsData, error: eventsError } = await supabase.from('events').select('*').order('date', { ascending: false })
    const { data: ticketsData, error: ticketsError } = await supabase.from('tickets').select('*, events(title), profiles(full_name, phone, id)')
    const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })

    if (eventsError) console.error('Erro eventos:', eventsError)
    if (ticketsError) console.error('Erro bilhetes:', ticketsError)
    if (profilesError) console.error('Erro perfis:', profilesError)

    const totalTickets = ticketsData?.reduce((sum, t) => sum + t.quantity, 0) || 0
    const totalRevenue = ticketsData?.reduce((sum, t) => sum + Number(t.total_price), 0) || 0

    setEvents(eventsData || [])
    setTickets(ticketsData || [])
    setUsers(profilesData || [])
    setStats({ totalEvents: eventsData?.length || 0, totalTickets, totalRevenue, totalUsers: profilesData?.length || 0 })
    setLoading(false)
  }

  const formatPrice = (p) => new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(p)
  const formatDate = (d) => new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const formatDateShort = (d) => new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })

  // Filter tickets by period
  function filterByPeriod(data, dateField = 'purchased_at') {
    if (dashboardPeriod === 'all') return data
    const now = new Date()
    const days = dashboardPeriod === '7d' ? 7 : 30
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return data.filter(d => new Date(d[dateField]) >= cutoff)
  }

  // Dashboard computed stats
  const periodTickets = filterByPeriod(tickets)
  const periodRevenue = periodTickets.reduce((sum, t) => sum + Number(t.total_price), 0)
  const periodTicketsCount = periodTickets.reduce((sum, t) => sum + t.quantity, 0)
  const avgTicketPrice = periodTicketsCount > 0 ? periodRevenue / periodTicketsCount : 0

  // Sales by event
  const salesByEvent = events.map(e => {
    const eventTickets = tickets.filter(t => t.event_id === e.id)
    const sold = eventTickets.reduce((s, t) => s + t.quantity, 0)
    const revenue = eventTickets.reduce((s, t) => s + Number(t.total_price), 0)
    return { ...e, sold, revenue }
  }).filter(e => e.sold > 0).sort((a, b) => b.sold - a.sold)

  const bestSeller = salesByEvent[0] || null

  // Top customers
  const customerStats = {}
  tickets.forEach(t => {
    if (!t.user_id) return
    if (!customerStats[t.user_id]) {
      customerStats[t.user_id] = { id: t.user_id, name: t.profiles?.full_name || 'N/A', email: t.profiles?.email || '', tickets: 0, spent: 0 }
    }
    customerStats[t.user_id].tickets += t.quantity
    customerStats[t.user_id].spent += Number(t.total_price)
  })
  const topCustomers = Object.values(customerStats).sort((a, b) => b.spent - a.spent).slice(0, 5)

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch = !userSearch ||
      u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone?.includes(userSearch)
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter
    return matchesSearch && matchesRole
  })

  // User stats
  const userStats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    regular: users.filter(u => u.role === 'user').length,
    withPhone: users.filter(u => u.phone).length,
    withEmail: users.filter(u => u.email).length
  }

  // Recent activity (last 10 actions)
  const recentActivity = [...tickets]
    .sort((a, b) => new Date(b.purchased_at) - new Date(a.purchased_at))
    .slice(0, 10)

  function resetForm() {
    setForm({ title: '', description: '', date: '', location: '', price: '', available_tickets: '', image_url: '' })
    setEditingId(null)
    setShowForm(false)
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleEdit(event) {
    setForm({ title: event.title, description: event.description || '', date: event.date?.slice(0, 16) || '', location: event.location || '', price: String(event.price), available_tickets: String(event.available_tickets), image_url: event.image_url || '' })
    setImagePreview(event.image_url || null)
    setEditingId(event.id)
    setShowForm(true)
  }

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleRemoveImage() {
    setImageFile(null)
    setImagePreview(null)
    setForm({ ...form, image_url: '' })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function uploadImage() {
    if (!imageFile) return form.image_url || null
    setUploading(true)
    const ext = imageFile.name.split('.').pop()
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('event-images').upload(`events/${name}`, imageFile)
    if (error) { showNotif('Erro ao enviar imagem: ' + error.message, 'error'); setUploading(false); return null }
    const { data } = supabase.storage.from('event-images').getPublicUrl(`events/${name}`)
    setUploading(false)
    return data.publicUrl
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const imageUrl = await uploadImage()
    const payload = { title: form.title, description: form.description, date: form.date, location: form.location, price: Number(form.price), available_tickets: Number(form.available_tickets), image_url: imageUrl }
    if (editingId) await supabase.from('events').update(payload).eq('id', editingId)
    else await supabase.from('events').insert(payload)
    resetForm()
    fetchData()
    showNotif(editingId ? 'Evento actualizado!' : 'Evento criado!')
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja eliminar este evento?')) return
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) { showNotif('Erro: ' + error.message, 'error'); return }
    fetchData()
    showNotif('Evento eliminado!')
  }

  async function handleRoleChange(userId, newRole) {
    if (!confirm(`Alterar cargo deste utilizador para "${newRole}"?`)) return
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (error) { showNotif('Erro: ' + error.message, 'error'); return }
    fetchData()
    showNotif('Cargo actualizado!')
  }

  // View user details
  async function handleViewUser(user) {
    setSelectedUser(user)
    const { data } = await supabase.from('tickets').select('*, events(title, date, price)').eq('user_id', user.id).order('purchased_at', { ascending: false })
    setUserTickets(data || [])
    setShowUserModal(true)
  }

  // Edit user
  function handleEditUser(user) {
    setEditingUser(user)
    setUserForm({ full_name: user.full_name || '', phone: user.phone || '', role: user.role || 'user' })
    setShowUserEditModal(true)
  }

  async function handleSaveUser(e) {
    e.preventDefault()
    const { error } = await supabase.from('profiles').update({ full_name: userForm.full_name, phone: userForm.phone, role: userForm.role }).eq('id', editingUser.id)
    if (error) { showNotif('Erro: ' + error.message, 'error'); return }
    setShowUserEditModal(false)
    fetchData()
    showNotif('Perfil actualizado!')
  }

  // Export users to CSV
  function exportUsersCSV() {
    const headers = ['Nome', 'Email', 'Telefone', 'Cargo', 'Registado']
    const rows = users.map(u => [u.full_name, u.email || '', u.phone || '', u.role, u.created_at ? formatDateShort(u.created_at) : ''])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'utilizadores.csv'
    a.click()
    URL.revokeObjectURL(url)
    showNotif('CSV exportado!')
  }

  // Export tickets to CSV
  function exportTicketsCSV() {
    const headers = ['Cliente', 'Evento', 'Quantidade', 'Total', 'Método', 'Data']
    const rows = tickets.map(t => [t.profiles?.full_name || '', t.events?.title || '', t.quantity, t.total_price, t.payment_method || 'mpesa', t.purchased_at ? formatDate(t.purchased_at) : ''])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vendas.csv'
    a.click()
    URL.revokeObjectURL(url)
    showNotif('CSV exportado!')
  }

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div></div>

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'events', label: 'Eventos', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'users', label: 'Utilizadores', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
    { id: 'sales', label: 'Vendas', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-24 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg animate-fade-in ${notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
            {notification.message}
          </div>
        )}

        <h1 className="text-3xl font-bold text-white mb-6">Painel de Administração</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} /></svg>
              {tab.label}
            </button>
          ))}
        </div>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Period filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Período:</span>
              {['7d', '30d', 'all'].map(p => (
                <button key={p} onClick={() => setDashboardPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${dashboardPeriod === p ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                  {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : 'Total'}
                </button>
              ))}
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass rounded-xl p-5">
                <p className="text-sm text-gray-400">Eventos</p>
                <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
              </div>
              <div className="glass rounded-xl p-5">
                <p className="text-sm text-gray-400">Bilhetes Vendidos</p>
                <p className="text-2xl font-bold text-white">{dashboardPeriod === 'all' ? stats.totalTickets : periodTicketsCount}</p>
              </div>
              <div className="glass rounded-xl p-5">
                <p className="text-sm text-gray-400">Receita</p>
                <p className="text-2xl font-bold text-indigo-400">{formatPrice(dashboardPeriod === 'all' ? stats.totalRevenue : periodRevenue)}</p>
              </div>
              <div className="glass rounded-xl p-5">
                <p className="text-sm text-gray-400">Utilizadores</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
            </div>

            {/* Extra stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="glass rounded-xl p-5">
                <p className="text-sm text-gray-400">Preço Médio/Bilhete</p>
                <p className="text-xl font-bold text-purple-400">{formatPrice(avgTicketPrice)}</p>
              </div>
              <div className="glass rounded-xl p-5">
                <p className="text-sm text-gray-400">Bilhetes/Evento</p>
                <p className="text-xl font-bold text-cyan-400">{stats.totalEvents > 0 ? Math.round(stats.totalTickets / stats.totalEvents) : 0}</p>
              </div>
              <div className="glass rounded-xl p-5">
                <p className="text-sm text-gray-400">Receita/Evento</p>
                <p className="text-xl font-bold text-amber-400">{formatPrice(stats.totalEvents > 0 ? stats.totalRevenue / stats.totalEvents : 0)}</p>
              </div>
            </div>

            {/* Best seller + Top customers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Best seller */}
              {bestSeller && (
                <div className="glass rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Bilhete Mais Vendido</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">{bestSeller.title}</p>
                      <p className="text-gray-400">{bestSeller.sold} bilhetes vendidos</p>
                      <p className="text-indigo-400 font-medium">{formatPrice(bestSeller.revenue)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Top customers */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Top Clientes</h3>
                <div className="space-y-3">
                  {topCustomers.map((c, i) => (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-500 text-black' : i === 1 ? 'bg-gray-400 text-black' : i === 2 ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-white text-sm font-medium">{c.name}</p>
                          <p className="text-gray-500 text-xs">{c.tickets} bilhetes</p>
                        </div>
                      </div>
                      <span className="text-indigo-400 font-medium text-sm">{formatPrice(c.spent)}</span>
                    </div>
                  ))}
                  {topCustomers.length === 0 && <p className="text-gray-500 text-sm">Nenhuma compra</p>}
                </div>
              </div>
            </div>

            {/* Recent activity */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Actividade Recente</h3>
              <div className="space-y-3">
                {recentActivity.map(t => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                      </div>
                      <div>
                        <p className="text-white text-sm">{t.profiles?.full_name || 'Utilizador'} comprou {t.quantity}x {t.events?.title || 'Evento'}</p>
                        <p className="text-gray-500 text-xs">{formatDate(t.purchased_at)}</p>
                      </div>
                    </div>
                    <span className="text-indigo-400 font-medium text-sm">{formatPrice(t.total_price)}</span>
                  </div>
                ))}
                {recentActivity.length === 0 && <p className="text-gray-500 text-sm">Nenhuma actividade recente</p>}
              </div>
            </div>
          </div>
        )}

        {/* EVENTOS */}
        {activeTab === 'events' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Gerir Eventos</h2>
              <button onClick={() => { resetForm(); setShowForm(true) }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">+ Novo Evento</button>
            </div>

            {showForm && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-700">
                  <h2 className="text-xl font-bold text-white mb-4">{editingId ? 'Editar Evento' : 'Novo Evento'}</h2>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Título</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required /></div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Descrição</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" rows="3" /></div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Imagem</label>
                      {imagePreview ? (
                        <div className="relative"><img src={imagePreview} alt="" className="w-full h-40 object-cover rounded-lg" /><button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 bg-red-600 text-white w-7 h-7 rounded-full text-sm flex items-center justify-center">X</button></div>
                      ) : (
                        <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors"><span className="text-sm text-gray-400">Clique para selecionar</span></div>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-sm font-medium text-gray-300 mb-1">Data</label><input type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required /></div>
                      <div><label className="block text-sm font-medium text-gray-300 mb-1">Local</label><input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-sm font-medium text-gray-300 mb-1">Preço (MZN)</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" min="0" required /></div>
                      <div><label className="block text-sm font-medium text-gray-300 mb-1">Bilhetes</label><input type="number" value={form.available_tickets} onChange={e => setForm({ ...form, available_tickets: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" min="0" required /></div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={uploading} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition">{uploading ? 'A enviar...' : editingId ? 'Guardar' : 'Criar'}</button>
                      <button type="button" onClick={resetForm} className="px-4 py-2.5 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition">Cancelar</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="glass rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-900"><tr><th className="text-left px-4 py-3 text-gray-400">Evento</th><th className="text-left px-4 py-3 text-gray-400">Data</th><th className="text-left px-4 py-3 text-gray-400">Preço</th><th className="text-left px-4 py-3 text-gray-400">Disponíveis</th><th className="text-right px-4 py-3 text-gray-400">Ações</th></tr></thead>
                  <tbody className="divide-y divide-gray-800">
                    {events.map(e => (
                      <tr key={e.id} className="hover:bg-gray-800/50">
                        <td className="px-4 py-3 font-medium text-white">{e.title}</td>
                        <td className="px-4 py-3 text-gray-400">{new Date(e.date).toLocaleDateString('pt-PT')}</td>
                        <td className="px-4 py-3 text-gray-400">{formatPrice(e.price)}</td>
                        <td className="px-4 py-3 text-gray-400">{e.available_tickets}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button onClick={() => handleEdit(e)} className="text-indigo-400 hover:text-indigo-300 transition">Editar</button>
                          <button onClick={() => handleDelete(e.id)} className="text-red-400 hover:text-red-300 transition">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {events.length === 0 && <p className="text-center text-gray-500 py-8">Nenhum evento</p>}
            </div>
          </div>
        )}

        {/* UTILIZADORES */}
        {activeTab === 'users' && (
          <div>
            {/* Header with stats */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Gestão de Utilizadores</h2>
                <p className="text-sm text-gray-400 mt-1">{userStats.total} utilizadores registados</p>
              </div>
              <button onClick={exportUsersCSV} className="flex items-center gap-2 bg-gray-800 text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-700 border border-gray-700 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Exportar CSV
              </button>
            </div>

            {/* User stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="glass rounded-xl p-4">
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-xl font-bold text-white">{userStats.total}</p>
              </div>
              <div className="glass rounded-xl p-4">
                <p className="text-xs text-gray-400">Admins</p>
                <p className="text-xl font-bold text-indigo-400">{userStats.admins}</p>
              </div>
              <div className="glass rounded-xl p-4">
                <p className="text-xs text-gray-400">Com Telefone</p>
                <p className="text-xl font-bold text-emerald-400">{userStats.withPhone}</p>
              </div>
              <div className="glass rounded-xl p-4">
                <p className="text-xs text-gray-400">Com Email</p>
                <p className="text-xl font-bold text-cyan-400">{userStats.withEmail}</p>
              </div>
            </div>

            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Pesquisar por nome, email ou telefone..." className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="flex gap-2">
                {['all', 'user', 'admin'].map(role => (
                  <button key={role} onClick={() => setUserRoleFilter(role)} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${userRoleFilter === role ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'}`}>
                    {role === 'all' ? 'Todos' : role === 'user' ? 'Utilizadores' : 'Admins'}
                  </button>
                ))}
              </div>
            </div>

            {/* Users table */}
            <div className="glass rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-400">Nome</th>
                      <th className="text-left px-4 py-3 text-gray-400">Email</th>
                      <th className="text-left px-4 py-3 text-gray-400">Telefone</th>
                      <th className="text-left px-4 py-3 text-gray-400">Cargo</th>
                      <th className="text-left px-4 py-3 text-gray-400">Registado</th>
                      <th className="text-right px-4 py-3 text-gray-400">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-white font-medium">{u.full_name}</td>
                        <td className="px-4 py-3 text-gray-400">{u.email || 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-400">{u.phone ? `+258 ${u.phone}` : 'N/A'}</td>
                        <td className="px-4 py-3">
                          <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)} className={`px-2 py-1 rounded text-xs font-medium bg-gray-700 border border-gray-600 ${u.role === 'admin' ? 'text-indigo-400' : 'text-gray-300'}`}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{u.created_at ? formatDateShort(u.created_at) : 'N/A'}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button onClick={() => handleViewUser(u)} className="text-cyan-400 hover:text-cyan-300 transition text-xs">Ver</button>
                          <button onClick={() => handleEditUser(u)} className="text-indigo-400 hover:text-indigo-300 transition text-xs">Editar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum utilizador encontrado</p>
                  {userSearch && <button onClick={() => setUserSearch('')} className="text-indigo-400 text-sm mt-2 hover:underline">Limpar pesquisa</button>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VENDAS / RELATÓRIO */}
        {activeTab === 'sales' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Relatório de Vendas</h2>
              <button onClick={exportTicketsCSV} className="flex items-center gap-2 bg-gray-800 text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-700 border border-gray-700 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Exportar CSV
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass rounded-xl p-6"><p className="text-sm text-gray-400">Receita Total</p><p className="text-3xl font-bold text-indigo-400">{formatPrice(stats.totalRevenue)}</p></div>
              <div className="glass rounded-xl p-6"><p className="text-sm text-gray-400">Total de Itens Vendidos</p><p className="text-3xl font-bold text-white">{stats.totalTickets}</p></div>
              <div className="glass rounded-xl p-6"><p className="text-sm text-gray-400">Bilhete Mais Vendido</p><p className="text-xl font-bold text-white mt-1">{bestSeller?.title || 'N/A'}</p>{bestSeller && <p className="text-gray-500 text-sm">{bestSeller.sold} vendidos</p>}</div>
            </div>

            {/* Sales by event */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Vendas por Evento</h3>
              <div className="space-y-4">
                {salesByEvent.map(e => (
                  <div key={e.id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-white text-sm font-medium">{e.title}</span>
                        <span className="text-gray-400 text-sm">{e.sold} vendidos · {formatPrice(e.revenue)}</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full" style={{ width: `${Math.min(100, (e.sold / (bestSeller?.sold || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
                {salesByEvent.length === 0 && <p className="text-gray-500 text-sm">Nenhuma venda registada</p>}
              </div>
            </div>

            {/* Purchase history */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Histórico de Compras</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-900"><tr><th className="text-left px-4 py-3 text-gray-400">Cliente</th><th className="text-left px-4 py-3 text-gray-400">Evento</th><th className="text-left px-4 py-3 text-gray-400">Qtd</th><th className="text-left px-4 py-3 text-gray-400">Total</th><th className="text-left px-4 py-3 text-gray-400">Data</th></tr></thead>
                  <tbody className="divide-y divide-gray-800">
                    {tickets.map(t => (
                      <tr key={t.id} className="hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-white">{t.profiles?.full_name || 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-400">{t.events?.title || 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-400">{t.quantity}</td>
                        <td className="px-4 py-3 text-indigo-400 font-medium">{formatPrice(t.total_price)}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(t.purchased_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {tickets.length === 0 && <p className="text-center text-gray-500 py-8">Nenhuma compra</p>}
            </div>
          </div>
        )}

        {/* User Detail Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowUserModal(false)}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedUser.full_name}</h2>
                  <p className="text-gray-400 text-sm">{selectedUser.email || 'Sem email'}</p>
                </div>
                <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-white transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* User info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-gray-400">Telefone</p>
                  <p className="text-white font-medium">{selectedUser.phone ? `+258 ${selectedUser.phone}` : 'N/A'}</p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-gray-400">Cargo</p>
                  <p className={`font-medium ${selectedUser.role === 'admin' ? 'text-indigo-400' : 'text-white'}`}>{selectedUser.role === 'admin' ? 'Administrador' : 'Utilizador'}</p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-gray-400">Registado</p>
                  <p className="text-white font-medium">{selectedUser.created_at ? formatDateShort(selectedUser.created_at) : 'N/A'}</p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-gray-400">Total Gasto</p>
                  <p className="text-indigo-400 font-bold">{formatPrice(userTickets.reduce((s, t) => s + Number(t.total_price), 0))}</p>
                </div>
              </div>

              {/* User tickets */}
              <h3 className="text-lg font-semibold text-white mb-3">Histórico de Compras</h3>
              {userTickets.length > 0 ? (
                <div className="space-y-2">
                  {userTickets.map(t => (
                    <div key={t.id} className="flex items-center justify-between py-3 px-4 bg-gray-900/50 rounded-xl">
                      <div>
                        <p className="text-white text-sm font-medium">{t.events?.title || 'Evento'}</p>
                        <p className="text-gray-500 text-xs">{t.quantity} bilhete(s) · {formatDate(t.purchased_at)}</p>
                      </div>
                      <span className="text-indigo-400 font-medium">{formatPrice(t.total_price)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-4">Nenhuma compra registada</p>
              )}
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showUserEditModal && editingUser && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowUserEditModal(false)}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-white mb-4">Editar Utilizador</h2>
              <form onSubmit={handleSaveUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
                  <input type="text" value={userForm.full_name} onChange={e => setUserForm({ ...userForm, full_name: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Telefone</label>
                  <input type="text" value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="84/85..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Cargo</label>
                  <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="user">Utilizador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition">Guardar</button>
                  <button type="button" onClick={() => setShowUserEditModal(false)} className="px-4 py-2.5 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
