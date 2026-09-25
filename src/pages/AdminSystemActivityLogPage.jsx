import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Download, Trash2, RefreshCw, Filter, ShieldAlert,
  CheckCircle, XCircle, AlertTriangle, Settings, FileText, ChevronLeft, ChevronRight, Activity 
} from 'lucide-react';
import { getLogs, clearLogs, ACTION_TYPES } from '../utils/activityLogger';

const ACTION_COLORS = {
  [ACTION_TYPES.VENDOR_APPROVED]: 'bg-[#E6F4EE] text-[#1A7F4B] border-[#A3D9B8]',
  [ACTION_TYPES.VENDOR_REJECTED]: 'bg-[#FEF3F2] text-[#D92D20] border-[#FECDCA]',
  [ACTION_TYPES.VENDOR_SUSPENDED]: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
  [ACTION_TYPES.VENDOR_BANNED]: 'bg-[#FEF3F2] text-[#D92D20] border-[#FECDCA]',
  [ACTION_TYPES.SETTINGS_CHANGED]: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]',
  [ACTION_TYPES.LISTING_REVIEWED]: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
  [ACTION_TYPES.GENERAL_UPDATE]: 'bg-[#F3F4F6] text-[#4B5563] border-[#D1D5DB]',
};

const ACTION_ICONS = {
  [ACTION_TYPES.VENDOR_APPROVED]: CheckCircle,
  [ACTION_TYPES.VENDOR_REJECTED]: XCircle,
  [ACTION_TYPES.VENDOR_SUSPENDED]: AlertTriangle,
  [ACTION_TYPES.VENDOR_BANNED]: ShieldAlert,
  [ACTION_TYPES.SETTINGS_CHANGED]: Settings,
  [ACTION_TYPES.LISTING_REVIEWED]: FileText,
  [ACTION_TYPES.GENERAL_UPDATE]: Activity,
};

const AVATAR_COLORS = ['#8E406F', '#4A7C6B', '#3B6EA5', '#7C5CBF', '#C8612F', '#2E7D8C'];

function formatRelativeTime(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

function getInitials(name) {
  if (!name) return 'A';
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export default function AdminSystemActivityLogPage() {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const loadLogs = async () => {
    let currentLogs = getLogs();
    
    // Seed with real data from backend if empty
    if (currentLogs.length === 0) {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        const [vendorsRes, customersRes] = await Promise.all([
          fetch('http://localhost:5131/api/admin-management/vendors', { headers }).catch(() => null),
          fetch('http://localhost:5131/api/customer-management', { headers }).catch(() => null)
        ]);

        if (vendorsRes && vendorsRes.ok) {
          const vendors = await vendorsRes.json();
          vendors.forEach(v => {
            logActivity(
              v.status === 'Approved' ? ACTION_TYPES.VENDOR_APPROVED : v.status === 'Suspended' ? ACTION_TYPES.VENDOR_SUSPENDED : ACTION_TYPES.GENERAL_UPDATE,
              'Vendor',
              v.vendorId?.toString() || v.id?.toString(),
              `${v.status} vendor "${v.businessName || v.ownerName}"`,
              'System Auto-Sync'
            );
          });
        }
        
        if (customersRes && customersRes.ok) {
          const customers = await customersRes.json();
          customers.forEach(c => {
             logActivity(
               ACTION_TYPES.GENERAL_UPDATE,
               'Customer',
               c.id?.toString(),
               `Customer account ${c.isActive ? 'activated' : 'deactivated'} for "${c.fullName}"`,
               'System Auto-Sync'
             );
          });
        }
        
        currentLogs = getLogs();
      } catch (err) {
        console.error("Failed to seed real data", err);
      }
    }
    
    setLogs(currentLogs);
  };

  useEffect(() => {
    loadLogs();
    const handleUpdate = () => {
      setLogs(getLogs());
    };
    window.addEventListener('activityLogUpdated', handleUpdate);
    return () => window.removeEventListener('activityLogUpdated', handleUpdate);
  }, []);

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all system logs? This action cannot be undone.")) {
      clearLogs();
      loadLogs();
      setCurrentPage(1);
    }
  };

  const handleExport = () => {
    const headers = ['ID', 'Timestamp', 'Actor', 'Action Type', 'Target Type', 'Target ID', 'Description'];
    const rows = filteredLogs.map(l => 
      [l.id, l.timestamp, `"${l.actorName}"`, l.actionType, l.targetType, l.targetId, `"${l.description}"`].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = useMemo(() => {
    let result = [...logs];

    // Filter by type
    if (filterType !== 'All') {
      result = result.filter(l => l.actionType === filterType);
    }

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => 
        (l.description && l.description.toLowerCase().includes(q)) ||
        (l.actorName && l.actorName.toLowerCase().includes(q)) ||
        (l.targetId && l.targetId.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'Newest' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [logs, searchQuery, filterType, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Stats
  const todayLogsCount = logs.filter(l => (Date.now() - new Date(l.timestamp).getTime()) < 86400000).length;
  const uniqueActors = new Set(logs.map(l => l.actorName)).size;

  return (
    <div className="max-w-[1400px] w-full mx-auto space-y-6">
      {/* ── Page Header & Stats ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "'Playfair Display', serif" }}>
              System Activity Log
            </h1>
            <p className="text-sm text-[#8E406F] mt-0.5 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1A7F4B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1A7F4B]"></span>
              </span>
              Live stream active • Audit trail of all administrative actions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-[#F6DCE6] rounded-xl px-4 py-2 flex flex-col items-center shadow-sm">
              <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider">Today's Logs</span>
              <span className="text-lg font-bold text-[#1E293B] leading-none mt-1">{todayLogsCount}</span>
            </div>
            <div className="bg-white border border-[#F6DCE6] rounded-xl px-4 py-2 flex flex-col items-center shadow-sm">
              <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider">Active Admins</span>
              <span className="text-lg font-bold text-[#8E406F] leading-none mt-1">{uniqueActors}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Feed Container ── */}
      <div className="bg-white border border-[#F6DCE6] rounded-2xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-[#F6DCE6] bg-[#FDF0F4]/30 flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa] pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search descriptions, actors, or IDs..."
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-[#F6DCE6] rounded-lg text-[#333] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm bg-white border border-[#F6DCE6] rounded-lg text-[#333] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all cursor-pointer"
            >
              <option value="All">All Actions</option>
              {Object.values(ACTION_TYPES).map(type => (
                <option key={type} value={type}>{type.replace(/([A-Z])/g, ' $1').trim()}</option>
              ))}
            </select>
            <Filter size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm bg-white border border-[#F6DCE6] rounded-lg text-[#333] focus:outline-none focus:ring-2 focus:ring-[#8E406F]/20 focus:border-[#8E406F] transition-all cursor-pointer"
            >
              <option value="Newest">Newest First</option>
              <option value="Oldest">Oldest First</option>
            </select>
          </div>

          <div className="flex-1 hidden md:block" />

          <div className="flex items-center gap-2">
            <button
              onClick={loadLogs}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#F6DCE6] text-[#737373] hover:bg-[#FDF0F4] hover:text-[#8E406F] transition-colors"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#8E406F] text-[#8E406F] text-sm font-medium hover:bg-[#8E406F] hover:text-white transition-colors"
            >
              <Download size={14} />
              Export CSV
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FEF3F2] border border-[#FECDCA] text-[#D92D20] text-sm font-medium hover:bg-[#FEE4E2] transition-colors"
            >
              <Trash2 size={14} />
              Clear
            </button>
          </div>
        </div>

        {/* Table / Timeline */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[#F6DCE6] bg-[#FDF0F4]/30">
                <th className="px-5 py-3 text-xs font-semibold text-[#8E406F] uppercase tracking-wide">Timestamp</th>
                <th className="px-5 py-3 text-xs font-semibold text-[#8E406F] uppercase tracking-wide">Actor</th>
                <th className="px-5 py-3 text-xs font-semibold text-[#8E406F] uppercase tracking-wide">Action</th>
                <th className="px-5 py-3 text-xs font-semibold text-[#8E406F] uppercase tracking-wide w-full">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6DCE6]">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-[#aaa]">
                    <Activity size={32} className="mx-auto mb-3 text-[#e8c4d8]" />
                    No activity logs match your criteria.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log, idx) => {
                  const ActionIcon = ACTION_ICONS[log.actionType] || Activity;
                  const colorClass = ACTION_COLORS[log.actionType] || ACTION_COLORS[ACTION_TYPES.GENERAL_UPDATE];
                  const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  
                  return (
                    <tr key={log.id} className="bg-white hover:bg-[#FDF0F4]/30 transition-colors group">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col" title={new Date(log.timestamp).toLocaleString()}>
                          <span className="text-[#1E293B] font-medium">{formatRelativeTime(log.timestamp)}</span>
                          <span className="text-[10px] text-[#9CA3AF] mt-0.5">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                            style={{ backgroundColor: avatarColor }}
                          >
                            {getInitials(log.actorName)}
                          </div>
                          <span className="text-[#334155] font-medium">{log.actorName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
                          <ActionIcon size={12} />
                          {log.actionType.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[#475569]">{log.description}</span>
                          {log.targetId && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] ml-1">
                              {log.targetType} #{log.targetId}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="px-5 py-3 border-t border-[#F6DCE6] flex items-center justify-between bg-white">
            <p className="text-xs text-[#737373]">
              Showing <span className="font-semibold text-[#1E293B]">{(currentPage - 1) * PAGE_SIZE + 1}</span> to <span className="font-semibold text-[#1E293B]">{Math.min(currentPage * PAGE_SIZE, filteredLogs.length)}</span> of <span className="font-semibold text-[#1E293B]">{filteredLogs.length}</span> entries
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-[#F6DCE6] text-[#737373] hover:bg-[#FDF0F4] hover:text-[#8E406F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-7 w-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors border ${
                    page === currentPage
                      ? 'bg-[#8E406F] text-white border-[#8E406F]'
                      : 'border-[#F6DCE6] text-[#737373] hover:bg-[#FDF0F4] hover:text-[#8E406F]'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-[#F6DCE6] text-[#737373] hover:bg-[#FDF0F4] hover:text-[#8E406F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
