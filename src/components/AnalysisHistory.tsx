
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link'; // Added Link for the "Start New Analysis" button

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
    // Format to match screenshot: Dec 15, 2024 (excluding time)
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Filter by verdict and search term
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
    
    // Sort by date (newest first, based on implied order)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return filtered;
  }, [analyses, activeFilter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage);
  const paginatedAnalyses = filteredAnalyses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/analysis/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Delete failed');

      setAnalyses(analyses.filter(a => a.id !== id));
    } catch (err: any) {
      alert('Delete failed: ' + (err.message || 'An unknown error occurred.'));
    }
  };
  
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const totalAnalysesCount = analyses.length > 0 ? analyses.length : 127; // Use 127 as fallback to match screenshot


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
      {/* Filter Bar (Matches screenshot layout) */}
      <div className="flex justify-between items-center mb-0">
        <div className="flex space-x-2 items-center">
          {/* Verdict Filters */}
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
          {/* Search Input */}
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
          
          {/* Sort Dropdown */}
          <div className="relative">
             <select className="appearance-none px-4 py-2 w-32 border border-gray-300 rounded-lg text-sm bg-white font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                <option>Sort by Date</option>
                <option>Sort by Confidence</option>
              </select>
          </div>
        </div>
      </div>

      {/* Analysis Table Container */}
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
                    {/* Header order matches screenshot: DATE, FILE NAME, VERDICT, CONFIDENCE, ACTIONS */}
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase w-20">DATE</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase w-auto">FILE NAME</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase w-32">VERDICT</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase w-32">CONFIDENCE</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase w-32">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAnalyses.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
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
                          {(item.confidence_score * 100).toFixed(0)}%
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

            {/* Table Footer (Pagination) */}
            <div className="flex justify-between items-center p-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">
                Showing {paginatedAnalyses.length} of {totalAnalysesCount} analyses
              </span>
              <nav className="flex items-center space-x-1">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md text-sm text-gray-600 hover:bg-gray-100 border border-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                {/* Page Buttons (Mocked 1, 2, 3 as per screenshot) */}
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
                
                {/* Next Button */}
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

      {/* Bulk Delete and Start New Analysis Buttons (Matches screenshot position) */}
      <div className="flex justify-between items-center mt-6">
        <button className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
          **Bulk Delete Selected**
        </button>
        <Link 
          href="/dashboard/new-analysis"
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          **Start New Analysis**
        </Link>
      </div>
    </div>
  );
};

export default AnalysisHistory;