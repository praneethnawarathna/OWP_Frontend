import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, ImagePlus, Pencil, Plus, Save, Store, Trash2, Upload, X } from 'lucide-react';

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
  const [photoPreview, setPhotoPreview] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const photoInputRef = useRef(null);
  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    // Clear validation error when user starts filling a field
    if (validationErrors[key]) {
      setValidationErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
    }
  };
  const reset = () => { setForm(isServices ? emptyService : emptyPerformance); setPhoto(null); setPhotoPreview(null); setEditingId(null); setMessage(''); setValidationErrors({}); if (photoInputRef.current) photoInputRef.current.value = ''; };

  const editItem = (item) => {
    setEditingId(isServices ? item.serviceId : item.performanceId);
    setForm(isServices ? { serviceName: item.serviceName, category: item.category, description: item.description || '', price: item.price ?? '' } : { title: item.title, category: item.category, description: item.description || '', customerName: item.customerName || '', customerFeedback: item.customerFeedback || '', eventDate: item.eventDate ? item.eventDate.slice(0, 10) : '' });
    setPhoto(null);
    setPhotoPreview(null);
    setValidationErrors({});
    setMessage('');
    if (photoInputRef.current) photoInputRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    const response = await fetch(`${API_URL}/${endpoint}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) { setMessage('Delete failed.'); return; }
    await reload();
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0] || null;
    setPhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const validate = () => {
    const errors = {};
    if (!isServices) {
      if (!form.title.trim()) errors.title = 'Performance title is required.';
      if (!form.customerName.trim()) errors.customerName = 'Customer name is required.';
      if (!form.eventDate) errors.eventDate = 'Event date is required.';
      if (!editingId && !photo) errors.photo = 'Please select a photo.';
    } else {
      if (!form.serviceName.trim()) errors.serviceName = 'Service name is required.';
    }
    return errors;
  };

  const submit = async (event) => {
    event.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setMessage('Please fill in all required fields.');
      return;
    }
    setValidationErrors({});
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
        Object.entries(form).forEach(([key, value]) => {
          // Skip eventDate if empty — backend expects DateTime? (null), not an empty string
          if (key === 'eventDate' && !value) return;
          body.append(key, value);
        });
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

  const errClass = (field) => validationErrors[field] ? 'border-rose-400 bg-rose-50/30' : '';

  return <PageShell title={isServices ? 'Business Services' : 'Add Ratings & Performance'} description={isServices ? 'Manage the services your business offers.' : 'Add past work, photos, and customer testimonials. Fields marked * are required.'} icon={isServices ? Store : ImagePlus}>
    <section className="rounded-2xl border border-[#F1E5EC] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-base font-semibold text-[#1E293B]"><Plus size={17} className="text-[#8E406F]" />{editingId ? 'Edit item' : `Add ${isServices ? 'service' : 'rating / performance'}`}</h2>{editingId && <ActionButton onClick={reset}><X size={14} />Cancel</ActionButton>}</div>
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2" noValidate>
        {isServices ? (
          <>
            <Field label={<>Service name <span className="text-rose-500">*</span></>}>
              <input required value={form.serviceName ?? ''} onChange={(e) => update('serviceName', e.target.value)} placeholder="e.g. Full Wedding Coverage" className={`w-full rounded-lg border px-3 py-2 text-sm text-[#333] outline-none focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15 ${errClass('serviceName') || 'border-[#E8DDE4] bg-white'}`} />
              {validationErrors.serviceName && <p className="mt-1 text-xs text-rose-600">{validationErrors.serviceName}</p>}
            </Field>
            <Field label="Category"><CategorySelect value={form.category} onChange={(value) => update('category', value)} /></Field>
            <Field label="Price"><Input type="number" min="0" value={form.price} onChange={(value) => update('price', value)} placeholder="Optional" /></Field>
            <div />
            <Field label="Description"><textarea value={form.description} onChange={(event) => update('description', event.target.value)} className="min-h-24 w-full rounded-lg border border-[#E8DDE4] px-3 py-2 text-sm outline-none focus:border-[#8E406F] md:col-span-2" /></Field>
          </>
        ) : (
          <>
            {/* Performance Title */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#555]">Performance title <span className="text-rose-500">*</span></label>
              <input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. Smith Wedding" className={`w-full rounded-lg border px-3 py-2 text-sm text-[#333] outline-none focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15 ${errClass('title') || 'border-[#E8DDE4] bg-white'}`} />
              {validationErrors.title && <p className="text-xs text-rose-600">{validationErrors.title}</p>}
            </div>

            {/* Category */}
            <Field label="Category"><CategorySelect value={form.category} onChange={(value) => update('category', value)} /></Field>

            {/* Event Date */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#555]">Event date <span className="text-rose-500">*</span></label>
              <input type="date" value={form.eventDate} onChange={(e) => update('eventDate', e.target.value)} className={`w-full rounded-lg border px-3 py-2 text-sm text-[#333] outline-none focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15 ${errClass('eventDate') || 'border-[#E8DDE4] bg-white'}`} />
              {validationErrors.eventDate && <p className="text-xs text-rose-600">{validationErrors.eventDate}</p>}
            </div>

            {/* Photo Upload with Preview */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#555]">Photo {!editingId && <span className="text-rose-500">*</span>}</label>
              <div className={`rounded-lg border-2 border-dashed p-3 transition ${validationErrors.photo ? 'border-rose-400 bg-rose-50/30' : 'border-[#E8DDE4] hover:border-[#8E406F]/40'}`}>
                {photoPreview ? (
                  <div className="relative">
                    <img src={photoPreview} alt="Preview" className="h-32 w-full rounded-md object-cover" />
                    <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(null); if (photoInputRef.current) photoInputRef.current.value = ''; }} className="absolute top-1 right-1 rounded-full bg-rose-600 p-1 text-white hover:bg-rose-700 transition">
                      <X size={12} />
                    </button>
                    <p className="mt-1.5 text-[11px] text-[#555] truncate">{photo?.name}</p>
                  </div>
                ) : (
                  <button type="button" onClick={() => photoInputRef.current?.click()} className="flex flex-col items-center justify-center w-full gap-2 py-4 text-[#8E406F]/70 hover:text-[#8E406F] transition cursor-pointer">
                    <Upload size={22} strokeWidth={1.5} />
                    <span className="text-xs font-semibold">Click to choose photo</span>
                    <span className="text-[11px] text-[#999]">JPG, PNG, WEBP accepted</span>
                  </button>
                )}
                <input ref={photoInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handlePhotoChange} className="hidden" />
              </div>
              {validationErrors.photo && <p className="text-xs text-rose-600">{validationErrors.photo}</p>}
            </div>

            {/* Customer Name */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#555]">Customer name <span className="text-rose-500">*</span></label>
              <input value={form.customerName} onChange={(e) => update('customerName', e.target.value)} placeholder="e.g. Nimasha & Asel" className={`w-full rounded-lg border px-3 py-2 text-sm text-[#333] outline-none focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15 ${errClass('customerName') || 'border-[#E8DDE4] bg-white'}`} />
              {validationErrors.customerName && <p className="text-xs text-rose-600">{validationErrors.customerName}</p>}
            </div>

            {/* Customer Feedback */}
            <Field label="Customer feedback / rating note">
              <Input value={form.customerFeedback} onChange={(value) => update('customerFeedback', value)} placeholder="e.g. Excellent service, very professional" />
            </Field>

            {/* Description */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-[#555]">Description</label>
              <textarea value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Describe the event, services provided, or any special highlights..." className="min-h-24 w-full rounded-lg border border-[#E8DDE4] px-3 py-2 text-sm outline-none focus:border-[#8E406F]" />
            </div>
          </>
        )}
        <div className="flex flex-col gap-2 md:col-span-2">
          {message && (
            <p className={`text-sm font-medium rounded-lg px-3 py-2 ${Object.keys(validationErrors).length > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>{message}</p>
          )}
          <div className="flex items-center gap-3">
            <button disabled={saving} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[#8E406F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#73325A] disabled:opacity-60"><Save size={15} />{saving ? 'Saving...' : editingId ? 'Update' : 'Save'}</button>
            {editingId && <ActionButton onClick={reset}><X size={14} />Cancel Edit</ActionButton>}
          </div>
        </div>
      </form>
    </section>
    <section className="space-y-3"><h2 className="text-base font-semibold text-[#1E293B]">Saved {isServices ? 'services' : 'performances'}</h2>{error && <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}{items.length === 0 ? <p className="rounded-2xl border border-dashed border-[#E8DDE4] bg-white p-6 text-sm text-[#737373]">Nothing added yet.</p> : <div className="grid gap-3 md:grid-cols-2">{items.map((item) => { const id = isServices ? item.serviceId : item.performanceId; return <article key={id} className="rounded-xl border border-[#F1E5EC] bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-[#1E293B]">{isServices ? item.serviceName : item.title}</h3><span className="text-xs text-[#8E406F]">{item.category}</span></div><div className="flex gap-2"><ActionButton onClick={() => editItem(item)}><Pencil size={13} />Edit</ActionButton><ActionButton danger onClick={() => removeItem(id)}><Trash2 size={13} />Delete</ActionButton></div></div><p className="mt-2 text-sm text-[#737373]">{item.description || item.customerFeedback || 'No description provided.'}</p>{!isServices && item.photoUrl && <img src={`${FILE_URL}${item.photoUrl}`} alt={item.title} className="mt-3 h-40 w-full rounded-lg object-cover" />}</article>; })}</div>}</section>
  </PageShell>;
}

const NOTIFICATIONS_API_URL = 'http://localhost:5131/api/notifications';

function NotificationsPage({ token }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(NOTIFICATIONS_API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Unable to load notifications.');
      const data = await res.json();
      setNotifications(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadNotifications();
  }, [token]);

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
    );
    try {
      await fetch(`${NOTIFICATIONS_API_URL}/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch(`${NOTIFICATIONS_API_URL}/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    // Optimistic update
    setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
    try {
      await fetch(`${NOTIFICATIONS_API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <PageShell
      title="Notifications"
      description="Messages and activity updates connected to your vendor account."
      icon={Bell}
    >
      <div className="space-y-4">
        {/* Top actions bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#737373]">
              {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
            </span>
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-[#FDF0F4] px-2 py-0.5 text-xs font-semibold text-[#8E406F]">
                {unreadCount} unread
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <ActionButton onClick={handleMarkAllAsRead}>
              <CheckCheck size={14} />
              Mark all as read
            </ActionButton>
          )}
        </div>

        {/* Content list or states */}
        {error ? (
          <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
        ) : loading ? (
          <div className="rounded-xl border border-[#F1E5EC] bg-white p-8 text-center text-sm text-[#737373]">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#E8DDE4] bg-white p-6 text-sm text-[#737373]">
            No notifications yet.
          </p>
        ) : (
          <div className="space-y-2.5">
            {notifications.map((item) => {
              const isUnread = !item.isRead;
              return (
                <article
                  key={item.notificationId}
                  onClick={() => handleMarkAsRead(item.notificationId, item.isRead)}
                  className={`group relative flex items-start justify-between gap-4 rounded-xl border p-4 shadow-sm transition cursor-pointer ${
                    isUnread
                      ? 'border-[#E8DDE4] border-l-4 border-l-[#8E406F] bg-[#FDF0F4]/25 hover:bg-[#FDF0F4]/40'
                      : 'border-[#F1E5EC] border-l-4 border-l-transparent bg-white hover:bg-[#FAFAFA]'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Unread indicator dot */}
                    <div className="pt-1">
                      <span
                        className={`block h-2 w-2 rounded-full transition ${
                          isUnread ? 'bg-[#8E406F]' : 'bg-transparent'
                        }`}
                      />
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2
                          className={`text-sm ${
                            isUnread ? 'font-bold text-[#1E293B]' : 'font-semibold text-[#475569]'
                          }`}
                        >
                          {item.title}
                        </h2>
                        {item.type && (
                          <span className="rounded bg-[#FDF0F4] px-1.5 py-0.5 text-[10px] font-medium text-[#8E406F]">
                            {item.type}
                          </span>
                        )}
                        <span className="text-[11px] text-[#94A3B8]">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-[#555] leading-relaxed break-words">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  {/* Dismiss / Delete button */}
                  <div className="shrink-0 pt-0.5">
                    <button
                      type="button"
                      title="Dismiss notification"
                      onClick={(e) => handleDelete(e, item.notificationId)}
                      className="rounded-lg p-1.5 text-[#94A3B8] opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
