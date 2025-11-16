'use client';

import React, { useState, useMemo, useRef} from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
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

  // =============================
  // ✅ FETCH ANALYSIS — COOKIE AUTH
  // =============================
  const fetchAllAnalyses = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/analysis?limit=1000&offset=0`, {
        method: 'GET',
        credentials: "include",              // 🔥 KEY FIX
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

  // =============================
  // ✅ BULK DELETE — COOKIE AUTH
  // =============================
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return alert('Select at least one item.');

    if (!confirm(`Delete ${selectedIds.size} analyses?`)) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`${API_URL}/api/analysis/${id}`, {
            method: 'DELETE',
            credentials: "include",     // 🔥 COOKIE AUTH
          })
        )
      );

      setAnalyses(analyses.filter(a => !selectedIds.has(a.id)));
      setSelectedIds(new Set());
      setAnimationTrigger(prev => prev + 1);
    } catch (err: any) {
      alert('Bulk delete failed: ' + err.message);
    }
  };

  // =============================
  // ✅ SINGLE DELETE — COOKIE AUTH
  // =============================
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this analysis?')) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/analysis/${id}`, {
        method: 'DELETE',
        credentials: "include",            // 🔥 COOKIE AUTH
      });

      if (!response.ok) throw new Error('Delete failed');

      setAnalyses(analyses.filter(a => a.id !== id));
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
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
      <div className="bg-white rounded-lg shadow p-8 flex items-center justify-center h-40">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle size={20} className="text-red-600" />
        <div>
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={fetchAllAnalyses}
            className="text-sm text-red-600 hover:text-red-800 mt-1 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">

      {/* Filter + Search */}
      <div className="flex justify-between items-center mb-0">
        <div className="flex space-x-2 items-center">
          {(['All', 'FAKE', 'REAL'] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-transparent text-gray-700 hover:bg-gray-100'
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
              className="px-4 py-2 w-48 border border-gray-300 rounded-lg text-sm bg-white font-medium text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as 'date' | 'confidence');
                setAnimationTrigger(prev => prev + 1);
              }}
              className="appearance-none px-4 py-2 w-40 border border-gray-300 rounded-lg text-sm bg-white font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="date">Sort by Date</option>
              <option value="confidence">Sort by Confidence</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow mt-4 flex-1 overflow-hidden flex flex-col">
        {paginatedAnalyses.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">No analyses match your filters.</p>
          </div>
        ) : (
          <>
            <div className='overflow-x-auto'>
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="p-4 w-12">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                    </th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase w-20">DATE</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase w-auto">FILE NAME</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase w-32">VERDICT</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase w-32">CONFIDENCE</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase w-32">ACTIONS</th>
                  </tr>
                </thead>

                <tbody ref={tableBodyRef}>
                  {paginatedAnalyses.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={(e) => handleSelectOne(item.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="p-4 text-sm text-gray-700">{formatDate(item.created_at)}</td>
                      <td className="p-4 text-sm text-gray-800 font-medium flex items-center">
                        <FileText size={16} className="mr-2 text-gray-400 flex-shrink-0" />
                        {item.filename}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded ${
                            item.is_deepfake
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {item.is_deepfake ? 'FAKE' : 'REAL'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-800 font-medium">
                        {getDisplayedConfidence(item)}%
                      </td>
                      <td className="p-4 text-sm font-medium space-x-4">
                        <button
                          onClick={() => router.push(`/dashboard/analysis/${item.id}`)}
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:underline ml-4"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center p-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">
                Showing {startIndex}-{endIndex} of {filteredAnalyses.length}
                {selectedIds.size > 0 && ` (${selectedIds.size} selected)`}
              </span>

              <nav className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md text-sm text-gray-600 hover:bg-gray-100 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {getPageNumbers().map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === pageNum 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md text-sm text-gray-600 hover:bg-gray-100 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
          onClick={handleBulkDelete}
          disabled={selectedIds.size === 0}
          className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Bulk Delete {selectedIds.size > 0 && `(${selectedIds.size})`}
        </button>

        <Link 
          href="/dashboard/new-analysis"
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start New Analysis
        </Link>
      </div>
    </div>
  );
};

export default AnalysisHistory;
