'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
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

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch analyses');
      }

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
      <div className={styles.controlsContainer}>
        <div className={styles.filterGroup}>
          {(['All', 'FAKE', 'REAL'] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`${styles.filterButton} ${activeFilter === filter
                ? styles.filterButtonActive + ' dark:!text-white'
                : styles.filterButtonInactive + ' dark:!text-gray-300 dark:hover:!text-white dark:hover:!bg-slate-800'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className={styles.searchGroup}>
          <div className={styles.searchInputWrapper}>
            <input
              type="text"
              placeholder="Search filename..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={`${styles.searchInput} dark:bg-slate-800 dark:text-gray-200 dark:border-slate-700 dark:placeholder-gray-500`}
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
              className={`${styles.sortSelect} dark:bg-slate-800 dark:text-gray-200 dark:border-slate-700`}
            >
              <option value="date">Sort by Date</option>
              <option value="confidence">Sort by Confidence</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        {paginatedAnalyses.length === 0 ? (
          <div className={styles.noDataContainer}>
            <p className={`${styles.noDataText} dark:text-gray-400`}>No analyses match your filters.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
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
                      <td className={`${styles.td} dark:!text-gray-200`}>{formatDate(item.created_at)}</td>

                      <td className={`${styles.td} font-medium`}>
                        <div className={styles.filenameCell}>
                          <FileText size={16} className={`${styles.fileIcon} dark:text-gray-400`} />
                          <Link
                            href={`/dashboard/analysis/${item.id}`}
                            className={`${styles.filenameLink} dark:!text-gray-200 dark:hover:!text-blue-400`}
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
                          <button
                            onClick={() => router.push(`/dashboard/analysis/${item.id}`)}
                            className={`${styles.actionBtn} ${styles.viewBtn} dark:!text-gray-400 dark:hover:!text-blue-400`}
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
            <div className={styles.paginationContainer}>
              <span className={`${styles.paginationInfo} dark:!text-white`}>
                Showing {startIndex}-{endIndex} of {filteredAnalyses.length}
                {selectedIds.size > 0 && ` (${selectedIds.size} selected)`}
              </span>

              <nav className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  // --- FIX APPLIED HERE ---
                  // disabled:dark:!text-white ensures the text stays white even when disabled.
                  // disabled:opacity-50 reduces the brightness/alpha to imply the disabled state, while keeping the color white.
                  className={`${styles.navButton} dark:!text-white dark:hover:!text-gray-200 disabled:dark:!text-white disabled:opacity-50`}
                >
                  Previous
                </button>

                {getPageNumbers().map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`${styles.pageButton} ${currentPage === pageNum
                      ? styles.pageButtonActive + ' dark:!text-white'
                      : styles.pageButtonInactive + ' dark:!text-gray-300 dark:hover:!text-white'
                      }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  // --- FIX APPLIED HERE ---
                  className={`${styles.navButton} dark:!text-white dark:hover:!text-gray-200 disabled:dark:!text-white disabled:opacity-50`}
                >
                  Next
                </button>
              </nav>
            </div>
          </>
        )}
      </div>

      {/* Bulk Delete + Start New */}
      <div className={styles.bottomActions}>
        <button
          onClick={openBulkDeleteModal}
          disabled={selectedIds.size === 0}
          className={styles.bulkDeleteButton}
        >
          Bulk Delete {selectedIds.size > 0 && `(${selectedIds.size})`}
        </button>

        <Link
          href="/dashboard/new-analysis"
          className={styles.newAnalysisButton}
        >
          Start New Analysis
        </Link>
      </div>
    </div>
  );
};

export default AnalysisHistory;