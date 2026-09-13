import { useEffect, useState } from 'react';
import { Bell, ImagePlus, Pencil, Plus, Save, Store, Trash2, X } from 'lucide-react';

const API_URL = 'http://localhost:5131/api/vendor-content';
const FILE_URL = 'http://localhost:5131';
const categories = ['Photography', 'Decorations', 'Catering', 'Music'];
const emptyService = { serviceName: '', category: 'Photography', description: '', price: '' };
const emptyPerformance = { title: '', category: 'Photography', description: '', customerName: '', customerFeedback: '', eventDate: '' };

function useVendorContent(endpoint, token) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const reload = async () => {
    try {
      const response = await fetch(`${API_URL}/${endpoint}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error('Unable to load data.');
      setItems(await response.json());
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  };
  useEffect(() => { if (token) reload(); }, [endpoint, token]);
  return { items, error, reload };
}

function PageShell({ title, description, icon: Icon, children }) {
  return <div className="mx-auto w-full max-w-6xl space-y-6"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F]"><Icon size={20} /></div><div><h1 className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h1><p className="text-sm text-[#737373]">{description}</p></div></div>{children}</div>;
}

function Field({ label, children }) { return <label className="block space-y-1.5 text-sm font-medium text-[#555]"><span>{label}</span>{children}</label>; }
function Input({ value, onChange, ...props }) { return <input {...props} value={value ?? ''} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-[#E8DDE4] bg-white px-3 py-2 text-sm text-[#333] outline-none focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15" />; }
function CategorySelect({ value, onChange }) { return <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-[#E8DDE4] bg-white px-3 py-2 text-sm text-[#333] outline-none focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15">{categories.map((category) => <option key={category}>{category}</option>)}</select>; }
function ActionButton({ children, onClick, danger = false }) { return <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${danger ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-[#E8DDE4] text-[#8E406F] hover:bg-[#FDF0F4]'}`}>{children}</button>; }

export default function VendorContentPage({ type }) {
  const token = localStorage.getItem('token');
  if (type === 'notifications') return <NotificationsPage token={token} />;
  const isServices = type === 'services';
  const endpoint = isServices ? 'services' : 'performances';
  const { items, error, reload } = useVendorContent(endpoint, token);
  const [form, setForm] = useState(isServices ? emptyService : emptyPerformance);
  const [editingId, setEditingId] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const reset = () => { setForm(isServices ? emptyService : emptyPerformance); setPhoto(null); setEditingId(null); setMessage(''); };

  const editItem = (item) => {
    setEditingId(isServices ? item.serviceId : item.performanceId);
    setForm(isServices ? { serviceName: item.serviceName, category: item.category, description: item.description || '', price: item.price ?? '' } : { title: item.title, category: item.category, description: item.description || '', customerName: item.customerName || '', customerFeedback: item.customerFeedback || '', eventDate: item.eventDate ? item.eventDate.slice(0, 10) : '' });
    setPhoto(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    const response = await fetch(`${API_URL}/${endpoint}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) { setMessage('Delete failed.'); return; }
    await reload();
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      let body;
      const headers = { Authorization: `Bearer ${token}` };
      let requestUrl = `${API_URL}/${endpoint}`;
      let method = editingId ? 'PUT' : 'POST';
      if (editingId) requestUrl += `/${editingId}`;
      if (isServices) {
        body = JSON.stringify({ ...form, price: form.price === '' ? null : Number(form.price) });
        headers['Content-Type'] = 'application/json';
      } else {
        body = new FormData();
        Object.entries({ ...form, eventDate: form.eventDate || '' }).forEach(([key, value]) => body.append(key, value));
        if (photo) body.append('photo', photo);
      }
      const response = await fetch(requestUrl, { method, headers, body });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'Could not save this item.');
      reset();
      setMessage(editingId ? 'Updated successfully.' : 'Saved successfully.');
      await reload();
    } catch (saveError) {
      setMessage(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  return <PageShell title={isServices ? 'Business Services' : 'Vendor Performance'} description={isServices ? 'Manage the services your business offers.' : 'Add past work, photos, and customer testimonials.'} icon={isServices ? Store : ImagePlus}>
    <section className="rounded-2xl border border-[#F1E5EC] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-base font-semibold text-[#1E293B]"><Plus size={17} className="text-[#8E406F]" />{editingId ? 'Edit item' : `Add ${isServices ? 'service' : 'performance'}`}</h2>{editingId && <ActionButton onClick={reset}><X size={14} />Cancel</ActionButton>}</div>
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        {isServices ? <><Field label="Service name"><Input required value={form.serviceName} onChange={(value) => update('serviceName', value)} placeholder="e.g. Full Wedding Coverage" /></Field><Field label="Category"><CategorySelect value={form.category} onChange={(value) => update('category', value)} /></Field><Field label="Price"><Input type="number" min="0" value={form.price} onChange={(value) => update('price', value)} placeholder="Optional" /></Field><div /><Field label="Description"><textarea value={form.description} onChange={(event) => update('description', event.target.value)} className="min-h-24 w-full rounded-lg border border-[#E8DDE4] px-3 py-2 text-sm outline-none focus:border-[#8E406F] md:col-span-2" /></Field></> : <><Field label="Performance title"><Input required value={form.title} onChange={(value) => update('title', value)} placeholder="e.g. Smith Wedding" /></Field><Field label="Category"><CategorySelect value={form.category} onChange={(value) => update('category', value)} /></Field><Field label="Event date"><Input type="date" value={form.eventDate} onChange={(value) => update('eventDate', value)} /></Field><Field label="Photo"><input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(event) => setPhoto(event.target.files?.[0] || null)} className="block w-full rounded-lg border border-[#E8DDE4] bg-white px-3 py-2 text-sm" /></Field><Field label="Customer name"><Input value={form.customerName} onChange={(value) => update('customerName', value)} /></Field><Field label="Customer feedback"><Input value={form.customerFeedback} onChange={(value) => update('customerFeedback', value)} /></Field><Field label="Description"><textarea value={form.description} onChange={(event) => update('description', event.target.value)} className="min-h-24 w-full rounded-lg border border-[#E8DDE4] px-3 py-2 text-sm outline-none focus:border-[#8E406F] md:col-span-2" /></Field></>}
        <div className="flex items-center gap-3 md:col-span-2"><button disabled={saving} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[#8E406F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#73325A] disabled:opacity-60"><Save size={15} />{saving ? 'Saving...' : editingId ? 'Update' : 'Save'}</button>{message && <span className="text-sm text-[#737373]">{message}</span>}</div>
      </form>
    </section>
    <section className="space-y-3"><h2 className="text-base font-semibold text-[#1E293B]">Saved {isServices ? 'services' : 'performances'}</h2>{error && <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}{items.length === 0 ? <p className="rounded-2xl border border-dashed border-[#E8DDE4] bg-white p-6 text-sm text-[#737373]">Nothing added yet.</p> : <div className="grid gap-3 md:grid-cols-2">{items.map((item) => { const id = isServices ? item.serviceId : item.performanceId; return <article key={id} className="rounded-xl border border-[#F1E5EC] bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-[#1E293B]">{isServices ? item.serviceName : item.title}</h3><span className="text-xs text-[#8E406F]">{item.category}</span></div><div className="flex gap-2"><ActionButton onClick={() => editItem(item)}><Pencil size={13} />Edit</ActionButton><ActionButton danger onClick={() => removeItem(id)}><Trash2 size={13} />Delete</ActionButton></div></div><p className="mt-2 text-sm text-[#737373]">{item.description || item.customerFeedback || 'No description provided.'}</p>{!isServices && item.photoUrl && <img src={`${FILE_URL}${item.photoUrl}`} alt={item.title} className="mt-3 h-40 w-full rounded-lg object-cover" />}</article>; })}</div>}</section>
  </PageShell>;
}

function NotificationsPage({ token }) {
  const { items, error } = useVendorContent('notifications', token);
  return <PageShell title="Notifications" description="Messages connected to your vendor account." icon={Bell}>{error ? <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : items.length === 0 ? <p className="rounded-2xl border border-dashed border-[#E8DDE4] bg-white p-6 text-sm text-[#737373]">No notifications yet.</p> : <div className="space-y-3">{items.map((item) => <article key={item.notificationId} className="rounded-xl border border-[#F1E5EC] bg-white p-4 shadow-sm"><h2 className="font-semibold text-[#1E293B]">{item.title}</h2><p className="mt-1 text-sm text-[#737373]">{item.message}</p></article>)}</div>}</PageShell>;
}
