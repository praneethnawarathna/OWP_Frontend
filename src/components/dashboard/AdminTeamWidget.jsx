import { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';

const API_BASE = 'http://localhost:5131/api/admin-management';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
});

export default function AdminTeamWidget({ onNavigate }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAdmins = async () => {
      try {
        const res = await fetch(API_BASE, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setAdmins(data);
        }
      } catch (err) {
        console.error('Failed to load admin team:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAdmins();
    return () => {
      isMounted = false;
    };
  }, []);

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getAvatarStyle = (admin, index) => {
    if (admin.accessLevel === 'SuperAdmin') {
      return { bg: 'bg-[#8E406F]/10 text-[#8E406F] border-[#e8c4d8]' };
    }
    const colorStyles = [
      { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      { bg: 'bg-blue-50 text-blue-700 border-blue-200' },
      { bg: 'bg-amber-50 text-amber-700 border-amber-200' },
      { bg: 'bg-purple-50 text-purple-700 border-purple-200' },
    ];
    return colorStyles[index % colorStyles.length];
  };

  return (
    <section aria-label="Admin team" className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#F1E5EC] flex items-center justify-between">
        <h2
          className="text-base font-semibold text-[#1E293B]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Admin Team
        </h2>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#8E406F]/10 text-[#8E406F]">
          {loading ? '...' : `${admins.length} Total`}
        </span>
      </div>

      {/* Team members */}
      <div className="flex-1 overflow-y-auto max-h-[280px]">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-[#999] text-xs gap-2">
            <RefreshCw size={14} className="animate-spin text-[#8E406F]" />
            Loading admin team...
          </div>
        ) : admins.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-[#999] text-xs">
            No administrators found.
          </div>
        ) : (
          <ul className="divide-y divide-[#F9F0F5]" role="list">
            {admins.map((admin, index) => {
              const avatarStyle = getAvatarStyle(admin, index);
              const isSuper = admin.accessLevel === 'SuperAdmin';
              return (
                <li key={admin.adminId} className="flex items-center gap-3 px-6 py-3.5 hover:bg-[#FDF0F4]/30 transition-colors">
                  {/* Avatar + active dot */}
                  <div className="relative shrink-0">
                    <div
                      className={`h-9 w-9 rounded-full border flex items-center justify-center text-xs font-bold ${avatarStyle.bg}`}
                      aria-hidden="true"
                    >
                      {getInitials(admin.fullName)}
                    </div>
                    {admin.isActive && (
                      <span
                        className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white"
                        role="status"
                        title="Active"
                        aria-label={`${admin.fullName} is active`}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1E293B] leading-tight truncate">
                      {admin.fullName}
                    </p>
                    <p className="text-xs text-[#999] leading-tight mt-0.5 flex items-center gap-1">
                      {isSuper ? (
                        <>
                          <ShieldCheck size={11} className="text-[#8E406F]" />
                          Super Admin
                        </>
                      ) : (
                        admin.accessLevel || 'Admin'
                      )}
                    </p>
                  </div>

                  {/* Access Level Badge */}
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isSuper
                        ? 'bg-[#8E406F]/10 text-[#8E406F]'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {isSuper ? 'Super Admin' : 'Admin'}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Manage Admins button */}
      <div className="px-6 py-4 border-t border-[#F1E5EC]">
        <button
          id="dashboard-manage-admins-btn"
          onClick={() => onNavigate?.('admin-management')}
          aria-label="Manage admin team"
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-[#8E406F] text-[#8E406F] text-xs font-semibold hover:bg-[#8E406F] hover:text-white active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          Manage Admins
        </button>
      </div>
    </section>
  );
}
