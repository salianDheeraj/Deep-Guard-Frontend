// src/components/AnalysisHistory.tsx
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Analysis {
  id: string;
  filename: string;
  is_deepfake: boolean;
  confidence_score: number;
  created_at: string;
}

type FilterType = "All" | "FAKE" | "REAL";
type SortType = "date" | "confidence";

const AnalysisHistory: React.FC = () => {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortType>('date');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const itemsPerPage = 10;

  React.useEffect(() => {
    fetchAllAnalyses();
  }, []);

  const fetchAllAnalyses = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/api/analysis?limit=1000&offset=0`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch analyses');

      const result = await response.json();
      setAnalyses(result.data || []);
    } catch (err: any) {
      console.error('Error:', err);
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

  // ✅ Helper function to calculate displayed confidence
  const getDisplayedConfidence = (item: Analysis) => {
    if (item.is_deepfake) {
      // FAKE: Show actual confidence
      return Math.round(item.confidence_score * 100);
    } else {
      // REAL: Show 100 - confidence
      return Math.round((1 - item.confidence_score) * 100);
    }
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
    
    filtered.sort((a, b) => {
      if (sortBy === 'confidence') {
        return b.confidence_score - a.confidence_score;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return filtered;
  }, [analyses, activeFilter, searchTerm, sortBy]);

  const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage);
  const paginatedAnalyses = filteredAnalyses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis? This will delete the video and all associated files.')) {
      return;
    }

    try {
      setDeletingId(id);
      const token = localStorage.getItem('authToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      console.log(`🗑️ Deleting analysis: ${id}`);

      const response = await fetch(`${API_URL}/api/analysis/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Delete failed with status ${response.status}`);
      }

      const responseData = await response.json();
      console.log(`✅ Analysis deleted successfully:`, responseData);
      
      setAnalyses(analyses.filter(a => a.id !== id));
      setSelectedIds(prev => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });

      alert('✅ Analysis, video, and associated files deleted successfully');
    } catch (err: any) {
      console.error('❌ Delete error:', err);
      alert(`Failed to delete: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }, [analyses]);

  const handleFilterChange = useCallback((filter: FilterType) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortType);
    setCurrentPage(1);
  }, []);

  const handleSelectItem = useCallback((id: string) => {
    setSelectedIds(prev => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === paginatedAnalyses.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(paginatedAnalyses.map(item => item.id));
      setSelectedIds(allIds);
    }
  }, [paginatedAnalyses, selectedIds]);

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      alert('Please select at least one analysis to delete.');
      return;
    }

    if (!confirm(`Delete ${selectedIds.size} analysis/analyses and all associated files? This action cannot be undone.`)) {
      return;
    }

    try {
      setBulkDeleting(true);
      const token = localStorage.getItem('authToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      console.log(`🗑️ Starting bulk delete for ${selectedIds.size} items`);

      const deletePromises = Array.from(selectedIds).map(id =>
        fetch(`${API_URL}/api/analysis/${id}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      );

      const results = await Promise.all(deletePromises);
      
      const successCount = results.filter(res => res.ok).length;
      const failedCount = results.filter(res => !res.ok).length;

      if (failedCount > 0) {
        console.warn(`⚠️ ${failedCount} deletion(s) failed, ${successCount} succeeded`);
        throw new Error(`${failedCount} deletion(s) failed. ${successCount} deleted successfully.`);
      }

      console.log(`✅ All ${successCount} analyses deleted successfully`);
      
      setAnalyses(analyses.filter(a => !selectedIds.has(a.id)));
      setSelectedIds(new Set());
      alert(`✅ Successfully deleted ${successCount} analysis/analyses and all associated files`);
    } catch (err: any) {
      console.error('❌ Bulk delete error:', err);
      alert(`Bulk delete error: ${err.message}`);
    } finally {
      setBulkDeleting(false);
    }
  };

  const totalAnalysesCount = analyses.length > 0 ? analyses.length : 0;

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
              placeholder="Search by filename..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="px-4 py-2 w-48 border border-gray-300 rounded-lg text-sm bg-white font-medium text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select 
              value={sortBy}
              onChange={handleSortChange}
              className="appearance-none px-4 py-2 w-32 border border-gray-300 rounded-lg text-sm bg-white font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="date">Sort by Date</option>
              <option value="confidence">Sort by Confidence</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mt-4 flex-1 overflow-hidden flex flex-col">
        {paginatedAnalyses.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">No analyses found matching current criteria.</p>
          </div>
        ) : (
          <>
            <div className='overflow-x-auto'>
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase w-12">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === paginatedAnalyses.length && paginatedAnalyses.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded cursor-pointer"
                      />
                    </th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase w-20">DATE</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase w-auto">FILE NAME</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase w-32">VERDICT</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase w-32">CONFIDENCE</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase w-32">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAnalyses.map((item) => (
                    <tr 
                      key={item.id} 
                      className={`border-b border-gray-100 transition-colors ${
                        selectedIds.has(item.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                      } ${deletingId === item.id ? 'opacity-50' : ''}`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          disabled={deletingId === item.id}
                          className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded cursor-pointer disabled:opacity-50"
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
                        {/* ✅ FIXED: Display confidence correctly */}
                        {getDisplayedConfidence(item)}%
                      </td>
                      <td className="p-4 text-sm font-medium space-x-4">
                        <button
                          onClick={() => router.push(`/dashboard/analysis/${item.id}`)}
                          disabled={deletingId === item.id}
                          className="text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className={`flex items-center gap-1 ${
                            deletingId === item.id 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-red-600 hover:underline'
                          }`}
                        >
                          {deletingId === item.id ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span>Deleting...</span>
                            </>
                          ) : (
                            <>
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center p-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">
                Showing {paginatedAnalyses.length} of {totalAnalysesCount} analyses
                {selectedIds.size > 0 && (
                  <span className="ml-2 font-medium text-blue-600">({selectedIds.size} selected)</span>
                )}
              </span>
              <nav className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md text-sm text-gray-600 hover:bg-gray-100 border border-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(1)}
                  className={`px-3 py-1 rounded-md text-sm ${currentPage === 1 ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 border border-transparent'}`}
                >1</button>
                {totalPages > 1 && (
                  <button
                    onClick={() => setCurrentPage(2)}
                    className={`px-3 py-1 rounded-md text-sm ${currentPage === 2 ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 border border-transparent'}`}
                  >2</button>
                )}
                {totalPages > 2 && (
                  <button
                    onClick={() => setCurrentPage(3)}
                    className={`px-3 py-1 rounded-md text-sm ${currentPage === 3 ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 border border-transparent'}`}
                  >3</button>
                )}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md text-sm text-gray-600 hover:bg-gray-100 border border-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between items-center mt-6">
        <button 
          onClick={handleBulkDelete}
          disabled={selectedIds.size === 0 || bulkDeleting}
          className={`flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium rounded-lg transition-colors ${
            selectedIds.size === 0 || bulkDeleting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {bulkDeleting && <Loader2 size={16} className="animate-spin" />}
          <span>
            {bulkDeleting ? 'Deleting...' : `Bulk Delete Selected${selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}`}
          </span>
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
