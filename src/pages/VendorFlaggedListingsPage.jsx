import { useEffect, useState, useCallback, useMemo } from 'react';
import { Flag, AlertTriangle, RefreshCw, Eye } from 'lucide-react';
import { fetchVendorFlags } from '../services/flagsApi';
import { FlagStatusBadge, SeverityBadge } from '../components/flaggedContent/FlagBadges';

export default function VendorFlaggedListingsPage() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Derive vendor ID and authentication status from current session
  const getSessionVendor = () => {
    let storedUser = {};
    try {
      storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    } catch {}

    const token = localStorage.getItem('token');
    let tokenPayload = {};
    if (token) {
      try {
        tokenPayload = JSON.parse(atob(token.split('.')[1])) || {};
      } catch {}
    }

    const resolvedVendorId =
      storedUser?.vendorId ||
      storedUser?.userId ||
      storedUser?.id ||
      tokenPayload?.vendorId ||
      tokenPayload?.nameid ||
      tokenPayload?.sub ||
      tokenPayload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
      null;

    const hasSession = Boolean(token || resolvedVendorId);
    return { vendorId: resolvedVendorId, hasSession };
  };

  const { vendorId, hasSession } = getSessionVendor();

  const loadFlags = useCallback(async () => {
    if (!hasSession && !vendorId) {
      setError('Vendor session not found. Please log out and back in.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVendorFlags(vendorId);
      setFlags(data ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load flagged listings.');
    } finally {
      setLoading(false);
    }
  }, [vendorId, hasSession]);

  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  // Derive stats
  const activeIssues = useMemo(() => {
    return flags.filter(f => f.status === 'Open' || f.status === 'UnderReview').length;
  }, [flags]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">Flagged Listings</h2>
          <p className="text-sm text-[#737373]">
            Review reports submitted by customers against your listings.
          </p>
        </div>
        <button
          onClick={loadFlags}
          disabled={loading}
          title="Refresh"
          className="rounded-md border border-[#F1E5EC] bg-white p-2 text-[#737373] hover:bg-[#FDF0F4] hover:text-[#8E406F] disabled:opacity-50 transition"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── Stat Card ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-[#F1E5EC] bg-white px-4 py-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FDF0F4]">
            <Flag size={18} className="text-[#8E406F]" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#1E293B]">{activeIssues}</p>
            <p className="text-xs text-[#737373]">Active issues requiring attention</p>
          </div>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle size={18} />
          <span className="flex-1">{error}</span>
          <button onClick={loadFlags} className="font-semibold text-rose-700 underline">
            Retry
          </button>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="rounded-xl border border-[#F1E5EC] bg-white overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-[#F1E5EC] bg-gray-50/50">
          <h3 className="font-semibold text-[#1E293B]">Reports</h3>
        </div>
        
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <RefreshCw size={24} className="mx-auto mb-3 animate-spin opacity-40" />
            <p className="text-sm">Loading your flagged listings...</p>
          </div>
        ) : flags.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FDF0F4] text-[#8E406F]">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-base font-semibold text-[#1E293B]">All clear!</h4>
            <p className="mt-1 text-sm text-[#737373]">No reports have been submitted against your listings.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F1E5EC]">
            {flags.map((flag) => (
              <div key={flag.id} className="p-5 flex flex-col md:flex-row gap-5 hover:bg-gray-50/50 transition">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-[#1E293B]">{flag.contentTitle}</h4>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                      {new Date(flag.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Issue Reported: </span>
                    <span className="text-sm font-semibold text-rose-600">{flag.reason}</span>
                  </div>
                  <div className="mb-4 rounded-md bg-gray-50 p-3 text-sm text-gray-600 border border-gray-100">
                    <span className="font-medium text-gray-700 mb-1 block">Customer Report Message:</span>
                    {flag.comments ? (
                      <p className="text-gray-800">"{flag.comments}"</p>
                    ) : (
                      <p className="text-gray-400 italic">No additional note provided by customer (Report reason: {flag.reason}).</p>
                    )}
                  </div>
                  {flag.resolutionNote && (
                    <div className="mt-3 text-sm border-l-2 border-[#8E406F] pl-3 py-1">
                      <span className="font-medium text-[#8E406F]">Admin Resolution: </span>
                      <span className="text-gray-600">{flag.resolutionNote}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 md:w-32 md:shrink-0 md:border-l md:border-[#F1E5EC] md:pl-5">
                  <div className="flex flex-col gap-2">
                    <SeverityBadge severity={flag.severity} />
                    <FlagStatusBadge status={flag.status} />
                  </div>
                  <div className="text-xs text-gray-400 mt-auto md:text-right">
                    Report #{flag.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Inline fallback for ShieldCheck if missing from imports above
function ShieldCheck({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
