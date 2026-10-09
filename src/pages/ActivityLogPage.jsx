import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  ChevronDown,
  Activity,
  Calendar,
  Filter,
  User,
  Shield,
  Clock,
  MoreHorizontal,
  ChevronRight,
  ChevronDown as ChevronDownIcon
} from 'lucide-react';
import {
  AdminPageHeader,
  AdminTableCard,
  AdminTableToolbar,
  AdminTable,
  AdminTableHeader,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTableCell,
  AdminTablePagination,
} from '../components/common/AdminTableComponents';
import { API_BASE_URL } from '../config/apiConfig';

// ============================================================
// API Configuration
// ============================================================
const API_BASE = `${API_BASE_URL}/admin/activity-log`;

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

export default function ActivityLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Search & Filter State ────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles'); // Only useful if user is SuperAdmin
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState(new Set());
  
  // Assuming frontend decodes token or knows role. Since we don't have decoding here,
  // we will infer it based on what data comes back (if different admins exist).
  // Actually, we can check localStorage for role.
  const userRole = localStorage.getItem('role') || 'Admin';
  const isSuperAdmin = userRole.toLowerCase() === 'superadmin' || userRole.toLowerCase() === 'super_admin';

  // ── Fetch Logs from .NET Backend ────────────────────────────
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try /api/admin/activity-log
      let res = await fetch(API_BASE, { headers: getAuthHeaders() });
      if (!res.ok && res.status === 404) {
          res = await fetch(`${API_BASE_URL}/admin/activity-logs`, { headers: getAuthHeaders() });
      }

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setLogs(data);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
      setError(err.message || 'Unable to connect to backend.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // ── Handlers ────────────────────────────────────────────────
  const toggleRowExpanded = (id) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedRows(newSet);
  };

  const parseActionType = (raw) => {
    // "VendorStatusChanged" -> "Vendor Status Changed"
    return raw.replace(/([A-Z])/g, ' $1').trim();
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A';
    try {
      const date = new Date(isoStr);
      return date.toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true
      });
    } catch {
      return isoStr;
    }
  };

  // ── Dynamic Search & Filtering ──────────────────────────────
  const filteredLogs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return logs.filter(log => {
      const matchSearch =
        (log.actorName || '').toLowerCase().includes(q) ||
        (log.actionType || '').toLowerCase().includes(q) ||
        (log.targetEntityType || '').toLowerCase().includes(q) ||
        (log.details || '').toLowerCase().includes(q) ||
        (log.description || '').toLowerCase().includes(q);

      const matchRole = roleFilter === 'All Roles' || (log.actorRole || 'Admin') === roleFilter;

      return matchSearch && matchRole;
    });
  }, [logs, searchQuery, roleFilter]);

  // ── Pagination ──────────────────────────────────────────────
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="flex-1 p-8 lg:p-10 overflow-y-auto bg-[#F8FAFC]">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header */}
        <AdminPageHeader
          title="Activity Log"
          subtitle="Role-scoped audit log of all administrative actions and system events."
        />

        <AdminTableCard>
          <AdminTableToolbar
            searchPlaceholder="Search logs by action, details, or actor..."
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterOptions={isSuperAdmin ? ['All Roles', 'SuperAdmin', 'Admin'] : []}
            filterValue={roleFilter}
            onFilterChange={setRoleFilter}
            filterLabel="Filter by Role"
          />

          {error && (
            <div className="p-4 mx-6 mt-4 mb-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              {error}
            </div>
          )}

          <div className="relative overflow-hidden w-full">
            <AdminTable>
              <AdminTableHeader>
                {isSuperAdmin && <AdminTableHead>Admin</AdminTableHead>}
                <AdminTableHead>Action</AdminTableHead>
                <AdminTableHead>Target Entity</AdminTableHead>
                <AdminTableHead>Timestamp</AdminTableHead>
                <AdminTableHead align="right">Details</AdminTableHead>
              </AdminTableHeader>
              <AdminTableBody>
                {loading ? (
                  <AdminTableRow>
                    <AdminTableCell colSpan={isSuperAdmin ? 5 : 4} className="text-center py-20 text-[#94A3B8]">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-6 h-6 border-2 border-[#8E406F] border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-medium">Loading activity logs...</p>
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                ) : paginatedLogs.length === 0 ? (
                  <AdminTableRow>
                    <AdminTableCell colSpan={isSuperAdmin ? 5 : 4} className="text-center py-20 text-[#94A3B8]">
                      <Activity size={32} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No activity logs found matching your criteria.</p>
                    </AdminTableCell>
                  </AdminTableRow>
                ) : (
                  paginatedLogs.map((log) => {
                    const isExpanded = expandedRows.has(log.id);
                    const hasLongDetails = log.details && log.details.length > 50 || log.description && log.description.length > 50;

                    return (
                      <React.Fragment key={log.id}>
                        <AdminTableRow className={isExpanded ? 'bg-slate-50' : ''}>
                          {isSuperAdmin && (
                            <AdminTableCell>
                              <div>
                                <p className="text-sm font-semibold text-[#1E293B]">{log.actorName || 'System'}</p>
                                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#64748B]">
                                  {log.actorRole === 'SuperAdmin' ? (
                                    <Shield size={10} className="text-[#8E406F]" />
                                  ) : (
                                    <User size={10} />
                                  )}
                                  <span>{log.actorRole || 'System'}</span>
                                </div>
                              </div>
                            </AdminTableCell>
                          )}
                          
                          <AdminTableCell>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#FDF0F4] text-[#8E406F] border border-[#F6DCE6]">
                              {parseActionType(log.actionType)}
                            </span>
                          </AdminTableCell>
                          
                          <AdminTableCell>
                            <div className="text-sm font-medium text-[#1E293B]">
                              {log.targetEntityType || 'System'}
                            </div>
                            {log.targetEntityId && (
                              <div className="text-xs text-[#64748B] mt-0.5">
                                ID: #{log.targetEntityId}
                              </div>
                            )}
                          </AdminTableCell>

                          <AdminTableCell>
                            <div className="flex items-center gap-1.5 text-sm text-[#475569]">
                              <Clock size={12} className="text-[#94A3B8]" />
                              {formatDate(log.timestamp)}
                            </div>
                          </AdminTableCell>

                          <AdminTableCell align="right">
                            {hasLongDetails ? (
                              <button
                                onClick={() => toggleRowExpanded(log.id)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#8E406F] hover:text-[#73325A] bg-white border border-[#F1E5EC] px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
                              >
                                View Details
                                {isExpanded ? <ChevronDownIcon size={14} /> : <ChevronRight size={14} />}
                              </button>
                            ) : (
                              <span className="text-xs text-[#64748B]">{log.details || log.description || 'No additional details'}</span>
                            )}
                          </AdminTableCell>
                        </AdminTableRow>
                        
                        {/* Expanded Details Row */}
                        {isExpanded && hasLongDetails && (
                          <AdminTableRow className="bg-slate-50 border-b border-[#F1E5EC]">
                            <td colSpan={isSuperAdmin ? 5 : 4} className="px-6 py-4">
                              <div className="p-4 bg-white border border-[#F1E5EC] rounded-xl shadow-sm">
                                <h4 className="text-xs font-bold text-[#8E406F] uppercase tracking-wider mb-2 flex items-center gap-2">
                                  <Activity size={14} />
                                  Log Details
                                </h4>
                                <div className="text-sm text-[#334155] whitespace-pre-wrap font-mono bg-slate-50 p-3 rounded-lg border border-slate-200">
                                  {log.details || log.description}
                                </div>
                              </div>
                            </td>
                          </AdminTableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </AdminTableBody>
            </AdminTable>
          </div>

          <AdminTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredLogs.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </AdminTableCard>

      </div>
    </div>
  );
}
