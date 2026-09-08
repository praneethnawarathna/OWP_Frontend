import { adminTeam } from '../../mock/dashboardData';

export default function AdminTeamWidget() {
  return (
    <section aria-label="Admin team" className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#F1E5EC]">
        <h2
          className="text-base font-semibold text-[#1E293B]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Admin Team
        </h2>
      </div>

      {/* Team members */}
      <ul className="flex-1 divide-y divide-[#F9F0F5]" role="list">
        {adminTeam.map((admin) => (
          <li key={admin.id} className="flex items-center gap-3 px-6 py-4">
            {/* Avatar + online dot */}
            <div className="relative shrink-0">
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: admin.avatarBg + '20', color: admin.avatarBg }}
                aria-hidden="true"
              >
                {admin.initials}
              </div>
              {admin.status === 'online' && (
                <span
                  className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white"
                  role="status"
                  aria-label={`${admin.name} is online`}
                />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1E293B] leading-tight truncate">{admin.name}</p>
              <p className="text-xs text-[#999] leading-tight">{admin.role}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Manage Admins button */}
      <div className="px-6 py-4 border-t border-[#F1E5EC]">
        <button
          aria-label="Manage admin team"
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-[#8E406F] text-[#8E406F] text-xs font-medium hover:bg-[#8E406F] hover:text-white active:scale-95 transition-all"
        >
          Manage Admins
        </button>
      </div>
    </section>
  );
}
