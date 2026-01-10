'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Search, Loader2, AlertCircle, Trash2, X, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useHistoryAnimation } from '@/hooks/useHistoryAnimation';
import styles from '@/styles/AnalysisHistory.module.css';

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
    <div className={styles.modalOverlay}>
      
      <div className={`${styles.modalContent} dark:bg-slate-800 dark:border dark:border-slate-700`}>

        <div className={styles.modalHeader}>
          <div className={`${styles.modalIconWrapper} dark:bg-red-900/20`}>
            <AlertTriangle className={`${styles.modalIcon} dark:text-red-500`} />
          </div>
          <h3 className={`${styles.modalTitle} dark:text-white`}>
            Confirm Deletion
          </h3>
        </div>

        <p className={`${styles.modalBody} dark:text-gray-300`}>
          Are you sure you want to permanently delete {isBulk ? <span className="font-bold text-gray-900 dark:text-white">{count} analyses</span> : 'this analysis'}?
          <br /><span className={`${styles.modalWarning} dark:text-red-400`}>This action cannot be undone.</span>
        </p>

        <div className={styles.modalFooter}>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className={`${styles.cancelButton} dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600 dark:border-slate-600`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={`${styles.confirmButton} dark:bg-red-600 dark:hover:bg-red-700 dark:text-white`}
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AnalysisHistory: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeFilter, setActiveFilter] = useState<FilterType>(() => {
    const filterParam = searchParams.get('filter')?.toUpperCase();
    if (filterParam === 'REAL') return 'REAL';
    if (filterParam === 'FAKE') return 'FAKE';
    return 'All';
  });
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const [isTrialRestricted, setIsTrialRestricted] = useState(false);

  const fetchAllAnalyses = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsTrialRestricted(false);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/analysis?limit=1000&offset=0`, {
        method: 'GET',
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch analyses');
      }

      const result = await response.json();

      if (result.trial_restricted) {
        setIsTrialRestricted(true);
        return;
      }

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
        idsToDelete.map(async (id) => {
          const res = await fetch(`${API_URL}/api/analysis/${id}`, {
            method: 'DELETE',
            credentials: "include",
          });
          if (!res.ok) {
            if (res.status === 401) {
              router.push('/login');
              throw new Error('Unauthorized');
            }
            throw new Error('Failed to delete');
          }
          return res;
        })
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

  if (isTrialRestricted) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 text-center transition-colors">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
          {/* Icon: Solid Blue / Cyan */}
          <FileText className="w-8 h-8 text-blue-600 dark:text-cyan-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">History Not Available</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
          Trial users cannot save or view analysis history. <br />
          Sign in or create an account to save your results.
        </p>
        <div className="flex gap-4">
          {/* Sign In Button: Gradient */}
          <Link
            href="/login"
            className="px-6 py-2 text-white font-medium rounded-lg transition-colors border-0 bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 dark:from-cyan-400 dark:to-purple-600 dark:hover:from-cyan-500 dark:hover:to-purple-700"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-2 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 font-medium rounded-lg transition-colors"
          >
            Create Account
          </Link>
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
      {/* RESPONSIVE: Stack vertically (flex-col) on mobile, Row on desktop (md:flex-row) */}
      <div className={`${styles.controlsContainer} flex flex-col md:flex-row gap-4 mb-4`}>
        <div className={`${styles.filterGroup} flex overflow-x-auto whitespace-nowrap pb-2 md:pb-0 gap-2 no-scrollbar`}>
          {(['All', 'FAKE', 'REAL'] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`${styles.filterButton} flex-shrink-0 ${activeFilter === filter
                // Filter Active: Solid Blue / Cyan Tint
                ? styles.filterButtonActive + ' !bg-blue-100 !text-blue-700 dark:!bg-cyan-900/30 dark:!text-cyan-400'
                : styles.filterButtonInactive + ' dark:!text-gray-300 dark:hover:!text-white dark:hover:!bg-slate-800'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className={`${styles.searchGroup} flex flex-col md:flex-row gap-2 flex-1`}>
          <div className={`${styles.searchInputWrapper} flex-1`}>
            <input
              type="text"
              placeholder="Search filename..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={`${styles.searchInput} w-full dark:bg-slate-800 dark:text-gray-200 dark:border-slate-700 dark:placeholder-gray-500 focus:!border-blue-500 dark:focus:!border-cyan-400`}
            />
            <Search size={16} className={`${styles.searchIcon} dark:text-gray-400`} />
          </div>

          <div className={styles.sortSelectWrapper}>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as 'date' | 'confidence');
                setAnimationTrigger(prev => prev + 1);
              }}
              className={`${styles.sortSelect} w-full md:w-auto dark:bg-slate-800 dark:text-gray-200 dark:border-slate-700 focus:!border-blue-500 dark:focus:!border-cyan-400`}
            >
              <option value="date">Sort by Date</option>
              <option value="confidence">Sort by Confidence</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className={`${styles.tableContainer} flex-1 overflow-hidden flex flex-col`}>
        {paginatedAnalyses.length === 0 ? (
          <div className={styles.noDataContainer}>
            <p className={`${styles.noDataText} dark:text-gray-400`}>No analyses match your filters.</p>
          </div>
        ) : (
          <>
            {/* RESPONSIVE: Overflow-x-auto allows table to scroll horizontally on small screens */}
            <div className={`${styles.tableWrapper} overflow-x-auto flex-1`}>
              <table className={`${styles.table} min-w-[600px] w-full`}>
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-700/50 transition-colors">
                    <th className="p-4 w-12">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className={styles.checkbox}
                      />
                    </th>
                    <th className={`${styles.th} dark:!text-gray-300`}>DATE</th>
                    <th className={`${styles.th} dark:!text-gray-300`}>FILE NAME</th>
                    <th className={`${styles.th} dark:!text-gray-300`}>VERDICT</th>
                    <th className={`${styles.th} dark:!text-gray-300`}>CONFIDENCE</th>
                    <th className={`${styles.th} dark:!text-gray-300 text-center`}>ACTIONS</th>
                  </tr>
                </thead>

                <tbody ref={tableBodyRef}>
                  {paginatedAnalyses.map((item) => (
                    <tr key={item.id} className={`${styles.tr} group`}>
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={(e) => handleSelectOne(item.id, e.target.checked)}
                          className={styles.checkbox}
                        />
                      </td>
                      <td className={`${styles.td} dark:!text-gray-200 whitespace-nowrap`}>{formatDate(item.created_at)}</td>

                      <td className={`${styles.td} font-medium`}>
                        <div className={styles.filenameCell}>
                          <FileText size={16} className={`${styles.fileIcon} dark:text-gray-400 shrink-0`} />
                          {/* File Name Link: Solid Blue / Cyan */}
                          <Link
                            href={`/dashboard/analysis/${item.id}`}
                            className={`${styles.filenameLink} !text-blue-600 hover:!text-blue-800 dark:!text-cyan-400 dark:hover:!text-cyan-300 truncate max-w-[150px] md:max-w-xs block`}
                            title={item.filename}
                          >
                            {item.filename}
                          </Link>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`${styles.badge} ${item.is_deepfake
                            ? styles.badgeFake
                            : styles.badgeReal
                            }`}
                        >
                          {item.is_deepfake ? 'FAKE' : 'REAL'}
                        </span>
                      </td>
                      <td className={`${styles.td} font-medium dark:!text-gray-200`}>
                        {getDisplayedConfidence(item)}%
                      </td>
                      <td className={`${styles.td} font-medium`}>
                        <div className={styles.actionButtons}>
                          {/* View Button: Solid Blue / Cyan */}
                          <button
                            onClick={() => router.push(`/dashboard/analysis/${item.id}`)}
                            className={`${styles.actionBtn} ${styles.viewBtn} !text-blue-600 hover:bg-blue-50 dark:!text-cyan-400 dark:hover:bg-cyan-900/20`}
                            title="View Details"
                          >
                            <Search size={18} />
                          </button>
                          <button
                            onClick={() => openSingleDeleteModal(item.id)}
                            className={`${styles.actionBtn} ${styles.deleteBtn} dark:!text-gray-400 dark:hover:!text-red-400`}
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
            {/* RESPONSIVE: Stack vertically on small screens, row on desktop */}
            <div className={`${styles.paginationContainer} flex flex-col sm:flex-row justify-between items-center gap-4 mt-4`}>
              <span className={`${styles.paginationInfo} dark:!text-white text-sm text-center sm:text-left`}>
                Showing {startIndex}-{endIndex} of {filteredAnalyses.length}
                {selectedIds.size > 0 && ` (${selectedIds.size} selected)`}
              </span>

              <nav className="flex items-center flex-wrap justify-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`${styles.navButton} dark:!text-white dark:hover:!text-gray-200 disabled:dark:!text-white disabled:opacity-50`}
                >
                  Previous
                </button>

                {getPageNumbers().map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`${styles.pageButton} ${currentPage === pageNum
                      // Pagination Active: Gradient Blue+Pink / Cyan+Purple
                      ? styles.pageButtonActive + ' !bg-gradient-to-r !from-blue-600 !to-pink-500 dark:!from-cyan-400 dark:!to-purple-600 !text-white !border-0'
                      : styles.pageButtonInactive + ' dark:!text-gray-300 dark:hover:!text-white'
                      }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`${styles.navButton} dark:!text-white dark:hover:!text-gray-200 disabled:dark:!text-white disabled:opacity-50`}
                >
                  Next
                </button>
              </nav>
            </div>
          </>
        )}
      </div>

      {/* Bottom Actions */}
      {/* RESPONSIVE: Stack vertically on mobile, row on desktop */}
      <div className={`${styles.bottomActions} flex flex-col sm:flex-row justify-between gap-3 mt-6`}>
        <button
          onClick={openBulkDeleteModal}
          disabled={selectedIds.size === 0}
          className={`${styles.bulkDeleteButton} w-full sm:w-auto`}
        >
          Bulk Delete {selectedIds.size > 0 && `(${selectedIds.size})`}
        </button>

        {/* Start New Analysis: Gradient Blue+Pink / Cyan+Purple */}
        <Link
          href="/dashboard/new-analysis"
          className={`${styles.newAnalysisButton} !bg-gradient-to-r !from-blue-600 !to-pink-500 hover:!from-blue-700 hover:!to-pink-600 dark:!from-cyan-400 dark:!to-purple-600 dark:hover:!from-cyan-500 dark:hover:!to-purple-700 text-white border-0 w-full sm:w-auto text-center`}
        >
          Start New Analysis
        </Link>
      </div>
    </div>
  );
};

export default AnalysisHistory;