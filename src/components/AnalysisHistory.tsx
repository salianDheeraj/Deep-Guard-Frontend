'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search, Loader2, AlertCircle, Trash2, X, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useHistoryAnimation } from '@/hooks/useHistoryAnimation';

interface Analysis {
  id: string;
  filename: string;
  is_deepfake: boolean;
  confidence_score: number;
  created_at: string;
}

type FilterType = "All" | "FAKE" | "REAL";

// --- CUSTOM DELETE MODAL COMPONENT ---
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
  isBulk: boolean;
  isDeleting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({
  isOpen, onClose, onConfirm, count, isBulk, isDeleting
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-100 dark:border-gray-700 transform transition-all scale-100">

        <div className="flex items-center gap-4 mb-5">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Confirm Deletion
          </h3>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          Are you sure you want to permanently delete {isBulk ? <span className="font-bold text-gray-900 dark:text-white">{count} analyses</span> : 'this analysis'}?
          <br /><span className="text-sm text-red-500 mt-2 block">This action cannot be undone.</span>
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const AnalysisHistory: React.FC = () => {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'date' | 'confidence'>('date');
  const [animationTrigger, setAnimationTrigger] = useState(0);

  // Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; type: 'single' | 'bulk'; id?: string }>({
    isOpen: false,
    type: 'single'
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const itemsPerPage = 10;
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);

  React.useEffect(() => {
    fetchAllAnalyses();
  }, []);

  React.useEffect(() => {
    if (analyses.length > 0) {
      setAnimationTrigger(prev => prev + 1);
    }
  }, [currentPage]);

  const fetchAllAnalyses = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/analysis?limit=1000&offset=0`, {
        method: 'GET',
        credentials: "include",
      });

      if (!response.ok) throw new Error('Failed to fetch analyses');

      const result = await response.json();
      setAnalyses(result.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDisplayedConfidence = (analysis: Analysis) => {
    if (analysis.is_deepfake) return Math.round(analysis.confidence_score * 100);
    return Math.round((1 - analysis.confidence_score) * 100);
  };

  const filteredAnalyses = useMemo(() => {
    let filtered = analyses.filter(item => {
      const verdict = item.is_deepfake ? 'FAKE' : 'REAL';
      return activeFilter === 'All' || verdict === activeFilter;
    });

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.filename.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      filtered.sort((a, b) => b.confidence_score - a.confidence_score);
    }

    return filtered;
  }, [analyses, activeFilter, searchTerm, sortBy]);

  const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage);
  const paginatedAnalyses = filteredAnalyses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredAnalyses.length);

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(paginatedAnalyses.map(a => a.id)) : new Set());
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    checked ? newSelected.add(id) : newSelected.delete(id);
    setSelectedIds(newSelected);
  };

  const isAllSelected =
    paginatedAnalyses.length > 0 && paginatedAnalyses.every(a => selectedIds.has(a.id));

  // --- DELETE HANDLERS ---

  const openBulkDeleteModal = () => {
    if (selectedIds.size === 0) return;
    setDeleteModal({ isOpen: true, type: 'bulk' });
  };

  const openSingleDeleteModal = (id: string) => {
    setDeleteModal({ isOpen: true, type: 'single', id });
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const idsToDelete = deleteModal.type === 'bulk'
        ? Array.from(selectedIds)
        : [deleteModal.id!];

      await Promise.all(
        idsToDelete.map(id =>
          fetch(`${API_URL}/api/analysis/${id}`, {
            method: 'DELETE',
            credentials: "include",
          })
        )
      );

      // UI Updates after successful delete
      setAnalyses(prev => prev.filter(a => !idsToDelete.includes(a.id)));
      if (deleteModal.type === 'bulk') setSelectedIds(new Set());
      setAnimationTrigger(prev => prev + 1);

    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, type: 'single' }); // Close modal
    }
  };

  useHistoryAnimation(tableBodyRef, [animationTrigger]);

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setCurrentPage(1);
    setAnimationTrigger(prev => prev + 1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
    setAnimationTrigger(prev => prev + 1);
  };

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) end = maxPagesToShow;
      if (currentPage >= totalPages - 2) start = totalPages - maxPagesToShow + 1;

      for (let i = start; i <= end; i++) pages.push(i);
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 flex items-center justify-center h-40 transition-colors">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3 transition-colors">
        <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
        <div>
          <p className="text-red-800 dark:text-red-300 font-medium">{error}</p>
          <button
            onClick={fetchAllAnalyses}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 mt-1 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">

      {/* --- CUSTOM MODAL RENDER --- */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={executeDelete}
        isBulk={deleteModal.type === 'bulk'}
        count={selectedIds.size}
        isDeleting={isDeleting}
      />

      {/* Filter + Search */}
      <div className="flex justify-between items-center mb-0">
        <div className="flex space-x-2 items-center">
          {(['All', 'FAKE', 'REAL'] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex space-x-3 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search filename..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="px-4 py-2 w-48 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-slate-800 font-medium text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as 'date' | 'confidence');
                setAnimationTrigger(prev => prev + 1);
              }}
              className="appearance-none px-4 py-2 w-40 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-slate-800 font-medium text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
            >
              <option value="date">Sort by Date</option>
              <option value="confidence">Sort by Confidence</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow mt-4 flex-1 overflow-hidden flex flex-col transition-colors">
        {paginatedAnalyses.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">No analyses match your filters.</p>
          </div>
        ) : (
          <>
            <div className='overflow-x-auto'>
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-700/50 transition-colors">
                    <th className="p-4 w-12">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600"
                      />
                    </th>
                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase w-20">DATE</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase w-auto">FILE NAME</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase w-32">VERDICT</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase w-32">CONFIDENCE</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase w-24 text-center">ACTIONS</th>
                  </tr>
                </thead>

                <tbody ref={tableBodyRef}>
                  {paginatedAnalyses.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors group">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={(e) => handleSelectOne(item.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600"
                        />
                      </td>
                      <td className="p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatDate(item.created_at)}</td>

                      {/* --- MODIFIED FILENAME CELL --- */}
                      <td className="p-4 text-sm text-gray-800 dark:text-gray-200 font-medium">
                        <div className="flex items-center">
                          <FileText size={16} className="mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          <Link
                            href={`/dashboard/analysis/${item.id}`}
                            className="truncate max-w-[200px] sm:max-w-xs hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer transition-colors"
                            title={item.filename}
                          >
                            {item.filename}
                          </Link>
                        </div>
                      </td>
                      {/* --------------------------- */}

                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded ${item.is_deepfake
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }`}
                        >
                          {item.is_deepfake ? 'FAKE' : 'REAL'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-800 dark:text-gray-200 font-medium">
                        {getDisplayedConfidence(item)}%
                      </td>
                      <td className="p-4 text-sm font-medium">
                        <div className="flex items-center justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => router.push(`/dashboard/analysis/${item.id}`)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Search size={18} />
                          </button>
                          <button
                            onClick={() => openSingleDeleteModal(item.id)}
                            className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Showing {startIndex}-{endIndex} of {filteredAnalyses.length}
                {selectedIds.size > 0 && ` (${selectedIds.size} selected)`}
              </span>

              <nav className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                {getPageNumbers().map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-transparent'
                      }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </nav>
            </div>
          </>
        )}
      </div>

      {/* Bulk Delete + Start New */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={openBulkDeleteModal}
          disabled={selectedIds.size === 0}
          className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-500/20"
        >
          Bulk Delete {selectedIds.size > 0 && `(${selectedIds.size})`}
        </button>

        <Link
          href="/dashboard/new-analysis"
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
        >
          Start New Analysis
        </Link>
      </div>
    </div>
  );
};

export default AnalysisHistory;