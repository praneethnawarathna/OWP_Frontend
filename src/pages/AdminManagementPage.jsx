import { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  Users,
  UserCog,
  Eye,
  EyeOff,
} from 'lucide-react';
import { admins as initialAdmins, adminMetrics, adminRoles, adminPermissions } from '../mock/adminData';

// ── Role Badge ───────────────────────────────────────────────────────────────
const roleBadgeStyles = {
  'Super Admin': 'bg-[#8E406F]/12 text-[#8E406F] border border-[#8E406F]/25',
  'Moderator':   'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Editor':      'bg-gray-100 text-gray-600 border border-gray-200',
};

function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleBadgeStyles[role] ?? 'bg-gray-100 text-gray-500'}`}>
      {role}
    </span>
  );
}

// ── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, iconColor }) {
  return (
    <div className="flex-1 min-w-[160px] bg-[#FDF0F4] rounded-2xl px-6 py-5 flex items-center gap-4 shadow-sm border border-[#F1E5EC]">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-sm`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#8E406F]">{value}</p>
        <p className="text-xs text-[#737373] mt-0.5 font-medium leading-tight">{label}</p>
      </div>
    </div>
  );
}

// ── Delete Confirm Dialog ────────────────────────────────────────────────────
function DeleteConfirmDialog({ admin, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm z-10">
        <div className="flex items-center justify-center h-14 w-14 rounded-full bg-red-50 border border-red-100 mx-auto mb-4">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <h3 className="text-center text-[#1a1a2e] font-bold text-lg mb-1">Remove Administrator</h3>
        <p className="text-center text-[#737373] text-sm mb-6">
          Are you sure you want to remove <span className="font-semibold text-[#333]">{admin.name}</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg border border-[#e8c4d8] text-[#8E406F] text-sm font-medium hover:bg-[#FDF0F4] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 active:scale-95 transition-all"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add / Edit Modal ─────────────────────────────────────────────────────────
const EMPTY_FORM = { name: '', email: '', role: 'Moderator', pin: '' };

function AdminModal({ editAdmin, onSave, onClose }) {
  const [form, setForm] = useState(
    editAdmin
      ? { name: editAdmin.name, email: editAdmin.email, role: editAdmin.role, pin: '' }
      : EMPTY_FORM
  );
  const [showPin, setShowPin] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Full name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    if (!editAdmin && !form.pin.trim()) e.pin = 'PIN / Temporary password is required.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }

    const initials = form.name.trim().split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
    onSave({ name: form.name.trim(), email: form.email.trim(), role: form.role, initials });
  };

  const field = (key, value) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1E5EC]">
          <div>
            <h2 className="text-[#1a1a2e] font-bold text-lg">
              {editAdmin ? 'Edit Administrator' : 'Create New Admin'}
            </h2>
            <p className="text-[#737373] text-xs mt-0.5">
              {editAdmin ? 'Update account details and role.' : 'Set up a new administrator account.'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="h-8 w-8 rounded-full flex items-center justify-center text-[#999] hover:bg-[#FDF0F4] hover:text-[#8E406F] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => field('name', e.target.value)}
              placeholder="e.g. Alex Chen"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${errors.name ? 'border-red-400 focus:ring-red-300' : 'border-[#e8c4d8] focus:ring-[#8E406F]/20 focus:border-[#8E406F]'} text-[#333] placeholder:text-[#bbb] focus:outline-none focus:ring-2 transition-all`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1.5">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={e => field('email', e.target.value)}
              placeholder="e.g. alex@owp.admin"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${errors.email ? 'border-red-400 focus:ring-red-300' : 'border-[#e8c4d8] focus:ring-[#8E406F]/20 focus:border-[#8E406F]'} text-[#333] placeholder:text-[#bbb] focus:outline-none focus:ring-2 transition-all`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={e => field('role', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#e8c4d8] text-[#333] bg-white focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all"
            >
              {adminRoles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <p className="text-[#aaa] text-[11px] mt-1">
              Auto-assigned permission: <span className="text-[#8E406F] font-medium">{adminPermissions[form.role]}</span>
            </p>
          </div>

          {/* PIN / Temp Password */}
          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1.5">
              {editAdmin ? 'New PIN / Password (leave blank to keep current)' : 'PIN / Temporary Password'}
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={form.pin}
                onChange={e => field('pin', e.target.value)}
                placeholder={editAdmin ? '••••••••' : 'Set temporary access PIN'}
                className={`w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border ${errors.pin ? 'border-red-400 focus:ring-red-300' : 'border-[#e8c4d8] focus:ring-[#8E406F]/20 focus:border-[#8E406F]'} text-[#333] placeholder:text-[#bbb] focus:outline-none focus:ring-2 transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPin(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#8E406F]"
                aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.pin && <p className="text-red-500 text-xs mt-1">{errors.pin}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#e8c4d8] text-[#8E406F] text-sm font-medium hover:bg-[#FDF0F4] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#8E406F] text-white text-sm font-semibold hover:bg-[#73325A] active:scale-95 transition-all shadow-sm"
            >
              {editAdmin ? 'Save Changes' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Avatar Background Pool ───────────────────────────────────────────────────
const avatarBgPool = ['#8E406F','#4A7C6B','#C07D3A','#5A6FA8','#7A5C8E','#3B7A8E'];
let nextBgIdx = 0;
const pickBg = () => { const bg = avatarBgPool[nextBgIdx % avatarBgPool.length]; nextBgIdx++; return bg; };

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdminManagementPage() {
  const [adminList, setAdminList] = useState(initialAdmins);
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);   // null = Add mode
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Derived metrics
  const totalAdmins   = adminList.length;
  const superAdmins   = adminList.filter(a => a.role === 'Super Admin' && a.status === 'Active').length;
  const modEditors    = adminList.filter(a => a.role !== 'Super Admin').length;

  // ── CRUD handlers ──
  const handleOpenAdd  = ()        => { setEditTarget(null); setShowModal(true); };
  const handleOpenEdit = (admin)   => { setEditTarget(admin); setShowModal(true); };
  const handleClose    = ()        => { setShowModal(false); setEditTarget(null); };

  const handleSave = ({ name, email, role, initials }) => {
    if (editTarget) {
      setAdminList(list =>
        list.map(a => a.id === editTarget.id
          ? { ...a, name, email, role, initials, permission: adminPermissions[role] }
          : a)
      );
    } else {
      const newAdmin = {
        id: Date.now(),
        name, email, role, initials,
        permission: adminPermissions[role],
        lastActive: 'Just now',
        status: 'Active',
        avatarBg: pickBg(),
      };
      setAdminList(list => [newAdmin, ...list]);
    }
    handleClose();
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) setAdminList(list => list.filter(a => a.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e] tracking-tight">
            Administrator Management
          </h1>
          <p className="text-[#737373] text-sm mt-1">
            Create, update, view permissions, and remove administrator accounts.
          </p>
        </div>
        <button
          id="create-admin-btn"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8E406F] text-white text-sm font-semibold hover:bg-[#73325A] active:scale-95 transition-all shadow-sm"
        >
          <Plus size={15} />
          Create New Admin
        </button>
      </div>

      {/* ── Metric Cards ── */}
      <div className="flex flex-wrap gap-4">
        <MetricCard icon={Users}     label="Total Administrators"       value={totalAdmins} iconColor="text-[#8E406F]" />
        <MetricCard icon={ShieldCheck} label="Active Super Admins"      value={superAdmins} iconColor="text-emerald-600" />
        <MetricCard icon={UserCog}   label="Moderator / Reviewer Roles" value={modEditors}  iconColor="text-[#5A6FA8]" />
      </div>

      {/* ── Admin Table ── */}
      <div className="bg-[#FDF0F4] rounded-2xl border border-[#F1E5EC] overflow-hidden shadow-sm">

        {/* Table Header */}
        <div className="px-6 py-4 border-b border-[#F1E5EC] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#8E406F]">
            All Administrators <span className="text-[#aaa] font-normal">({totalAdmins})</span>
          </h2>
        </div>

        {/* Scrollable table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F1E5EC] bg-[#FDF0F4]">
                {['ADMIN NAME', 'ROLE', 'ASSIGNED PERMISSION', 'LAST ACTIVE', 'ACTIONS'].map(col => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-[10px] font-bold text-[#8E406F] tracking-widest uppercase whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {adminList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#aaa] text-sm">
                    No administrators found. Click "Create New Admin" to get started.
                  </td>
                </tr>
              )}
              {adminList.map((admin, idx) => (
                <tr
                  key={admin.id}
                  className={`border-b border-[#F1E5EC] hover:bg-white/60 transition-colors ${idx % 2 === 0 ? 'bg-white/30' : 'bg-transparent'}`}
                >
                  {/* Admin Name */}
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-sm"
                        style={{ backgroundColor: admin.avatarBg }}
                      >
                        {admin.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-[#1a1a2e] text-sm leading-tight">{admin.name}</p>
                        <p className="text-[#999] text-xs leading-tight">{admin.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="px-6 py-3.5">
                    <RoleBadge role={admin.role} />
                  </td>

                  {/* Permission */}
                  <td className="px-6 py-3.5 text-[#555] text-xs whitespace-nowrap">
                    {admin.permission}
                  </td>

                  {/* Last Active */}
                  <td className="px-6 py-3.5 text-[#737373] text-xs whitespace-nowrap">
                    {admin.lastActive}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        id={`edit-admin-${admin.id}`}
                        onClick={() => handleOpenEdit(admin)}
                        aria-label={`Edit ${admin.name}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e8c4d8] text-[#8E406F] text-xs font-medium hover:bg-[#8E406F] hover:text-white hover:border-[#8E406F] transition-all"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                      <button
                        id={`delete-admin-${admin.id}`}
                        onClick={() => setDeleteTarget(admin)}
                        aria-label={`Remove ${admin.name}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-medium hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                      >
                        <Trash2 size={12} />
                        Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ── */}
      {showModal && (
        <AdminModal
          editAdmin={editTarget}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmDialog
          admin={deleteTarget}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
