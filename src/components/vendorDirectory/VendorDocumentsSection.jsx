import { useEffect, useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Calendar,
  ExternalLink,
  Eye,
  ShieldCheck,
  AlertCircle,
  X,
  FileCheck,
  Loader2,
} from 'lucide-react';
import { API_BASE_URL, getAssetUrl } from '../../config/apiConfig';

export default function VendorDocumentsSection({ vendorId, initialDocs = [] }) {
  const [docs, setDocs] = useState(initialDocs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);

  // Extract clean integer vendor ID
  const numericId = vendorId
    ? parseInt(String(vendorId).replace(/\D/g, ''), 10)
    : null;

  useEffect(() => {
    if (!numericId) return;

    let isMounted = true;
    async function fetchDocs() {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${API_BASE_URL}/admin/vendors/${numericId}/documents`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to load vendor documents');
        }

        const data = await res.json();
        if (isMounted) {
          setDocs(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          // If fetch fails, keep initialDocs if any
          if (!initialDocs || initialDocs.length === 0) {
            setError(err.message || 'Could not fetch documents');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDocs();
    return () => {
      isMounted = false;
    };
  }, [numericId]);

  function getFullUrl(url) {
    return getAssetUrl(url);
  }

  function getDocTypeBadge(type) {
    const t = (type || '').toLowerCase();
    if (t.includes('registration') || t.includes('br')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (t.includes('nic') || t.includes('passport') || t.includes('id')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (t.includes('tax')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (t.includes('license')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    return 'bg-gray-100 text-gray-700 border-gray-200';
  }

  return (
    <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/80 pb-2.5">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <FileCheck size={15} className="text-[#8E406F]" />
            Uploaded Verification Documents
          </h3>
          <p className="text-[11px] text-gray-500">
            Read-only storage from vendor profile uploads
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
          <ShieldCheck size={12} /> Admin Verified View
        </span>
      </div>

      {loading && docs.length === 0 ? (
        <div className="flex items-center justify-center py-6 text-xs text-gray-400">
          <Loader2 size={16} className="mr-2 animate-spin text-[#8E406F]" />
          Loading documents...
        </div>
      ) : error && docs.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
          <AlertCircle size={14} />
          {error}
        </div>
      ) : docs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-5 text-center">
          <FileText size={28} className="mx-auto text-gray-300" />
          <p className="mt-2 text-xs font-medium text-gray-600">
            No verification documents uploaded yet
          </p>
          <p className="mt-0.5 text-[11px] text-gray-400">
            Documents submitted by the vendor during registration or via business profile will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-1 md:grid-cols-2">
          {docs.map((doc, idx) => {
            const isImage =
              doc.type === 'image' ||
              (doc.url && /\.(jpg|jpeg|png|webp)$/i.test(doc.url));
            const fullUrl = getFullUrl(doc.url);
            const docKey = doc.documentId || `${doc.name}-${idx}`;
            const docType = doc.documentType || doc.type || 'Document';
            const fileName = doc.fileName || (doc.url ? doc.url.split('/').pop() : doc.name);

            return (
              <div
                key={docKey}
                className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-xs hover:border-[#8E406F]/40 hover:shadow-sm transition"
              >
                {/* Thumbnail / Icon container */}
                <div className="relative shrink-0">
                  {isImage && fullUrl ? (
                    <div
                      className="group relative h-14 w-14 overflow-hidden rounded-md border border-gray-200 bg-gray-100 cursor-pointer"
                      onClick={() => setPreviewDoc(doc)}
                      title="Click to preview image"
                    >
                      <img
                        src={fullUrl}
                        alt={doc.name || 'Document thumbnail'}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.parentElement.innerHTML =
                            '<div class="flex h-full w-full items-center justify-center text-gray-400"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>';
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye size={14} className="text-white drop-shadow" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-md border border-rose-200 bg-rose-50/80 text-rose-700">
                      <FileText size={20} />
                      <span className="mt-0.5 text-[9px] font-bold tracking-wider uppercase">PDF</span>
                    </div>
                  )}
                </div>

                {/* Document metadata */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold border ${getDocTypeBadge(
                        docType
                      )}`}
                    >
                      {docType}
                    </span>
                    {doc.status && (
                      <span className="text-[10px] text-gray-500 font-medium">
                        &middot; {doc.status}
                      </span>
                    )}
                  </div>

                  <p
                    className="mt-1 truncate text-xs font-semibold text-gray-900"
                    title={doc.name || fileName}
                  >
                    {doc.name || 'Document'}
                  </p>

                  <p
                    className="truncate font-mono text-[10px] text-gray-400"
                    title={fileName}
                  >
                    {fileName}
                  </p>

                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    {doc.uploadDate ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                        <Calendar size={11} className="text-gray-400" />
                        {doc.uploadDate}
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400">Uploaded</span>
                    )}

                    {fullUrl ? (
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-[#8E406F] hover:text-[#722e57] hover:underline"
                        title="Open file in new tab"
                      >
                        <span className="text-[11px]">View</span>
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">No URL</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal for Image Document Preview */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="relative max-h-[85vh] max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 bg-gray-50">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {previewDoc.name || previewDoc.documentType || 'Document Preview'}
                </p>
                <p className="text-xs text-gray-500">
                  {previewDoc.documentType} &middot; {previewDoc.uploadDate || 'Uploaded'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={getFullUrl(previewDoc.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                  title="Open original in new tab"
                >
                  <ExternalLink size={16} />
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="rounded p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-auto p-4 flex items-center justify-center bg-gray-900/5">
              <img
                src={getFullUrl(previewDoc.url)}
                alt={previewDoc.name || 'Preview'}
                className="max-h-[65vh] w-auto rounded object-contain shadow"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
