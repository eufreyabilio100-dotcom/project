import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function Admin() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const [stats, setStats] = useState({ totalEvents: 0, totalTickets: 0, totalRevenue: 0 })
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    price: '',
    available_tickets: '',
    image_url: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false })

    const { data: ticketsData } = await supabase
      .from('tickets')
      .select('quantity, total_price')

    const totalTickets = ticketsData?.reduce((sum, t) => sum + t.quantity, 0) || 0
    const totalRevenue = ticketsData?.reduce((sum, t) => sum + Number(t.total_price), 0) || 0

    setEvents(eventsData || [])
    setStats({
      totalEvents: eventsData?.length || 0,
      totalTickets,
      totalRevenue
    })
    setLoading(false)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(price)
  }

  function resetForm() {
    setForm({ title: '', description: '', date: '', location: '', price: '', available_tickets: '', image_url: '' })
    setEditingId(null)
    setShowForm(false)
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleEdit(event) {
    setForm({
      title: event.title,
      description: event.description || '',
      date: event.date?.slice(0, 16) || '',
      location: event.location || '',
      price: String(event.price),
      available_tickets: String(event.available_tickets),
      image_url: event.image_url || ''
    })
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
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
    const filePath = `events/${fileName}`

    const { data: uploadData, error } = await supabase.storage
      .from('event-images')
      .upload(filePath, imageFile)

    if (error) {
      console.error('Upload error:', error)
      alert('Erro ao enviar imagem: ' + error.message)
      setUploading(false)
      return null
    }

    const { data } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath)

    setUploading(false)
    return data.publicUrl
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const imageUrl = await uploadImage()

    const payload = {
      title: form.title,
      description: form.description,
      date: form.date,
      location: form.location,
      price: Number(form.price),
      available_tickets: Number(form.available_tickets),
      image_url: imageUrl
    }

    if (editingId) {
      await supabase.from('events').update(payload).eq('id', editingId)
    } else {
      await supabase.from('events').insert(payload)
    }

    resetForm()
    fetchData()
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja eliminar este evento?')) return
    await supabase.from('events').delete().eq('id', id)
    fetchData()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Painel de Administração</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <p className="text-sm text-gray-400">Total de Eventos</p>
          <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <p className="text-sm text-gray-400">Bilhetes Vendidos</p>
          <p className="text-2xl font-bold text-white">{stats.totalTickets}</p>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <p className="text-sm text-gray-400">Receita Total</p>
          <p className="text-2xl font-bold text-indigo-400">{formatPrice(stats.totalRevenue)}</p>
        </div>
      </div>

      {/* Add button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Gerir Eventos</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
        >
          + Novo Evento
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">{editingId ? 'Editar Evento' : 'Novo Evento'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Título</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Descrição</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400"
                  rows="3"
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Imagem do Evento</label>
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm hover:bg-red-700"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition"
                  >
                    <svg className="w-8 h-8 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-400">Clique para selecionar imagem</span>
                    <span className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP (max 5MB)</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Data</label>
                  <input
                    type="datetime-local"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Local</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Preço (MZN)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Bilhetes Disponíveis</label>
                  <input
                    type="number"
                    value={form.available_tickets}
                    onChange={e => setForm({ ...form, available_tickets: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {uploading ? 'A enviar imagem...' : editingId ? 'Guardar' : 'Criar Evento'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-900">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Evento</th>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Data</th>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Preço</th>
                <th className="text-left px-4 py-3 font-medium text-gray-400">Disponíveis</th>
                <th className="text-right px-4 py-3 font-medium text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {events.map(event => (
                <tr key={event.id} className="hover:bg-gray-750">
                  <td className="px-4 py-3 font-medium text-white">{event.title}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(event.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{formatPrice(event.price)}</td>
                  <td className="px-4 py-3 text-gray-400">{event.available_tickets}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-400 hover:text-red-300 font-medium"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {events.length === 0 && (
          <p className="text-center text-gray-500 py-8">Nenhum evento criado</p>
        )}
      </div>
    </div>
  )
}
