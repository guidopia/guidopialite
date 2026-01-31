import { useState, useEffect } from 'react';
import { Users, Search, Filter, Download, Eye, Mail, Phone, GraduationCap, Calendar, TrendingUp, User, AlertCircle, Loader2 } from 'lucide-react';
import apiService from '../services/api';

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    recentRegistrations: 0,
    activeStudents: 0
  });
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalStudents: 0,
    hasNext: false,
    hasPrev: false
  });

  // Fetch students data
  const fetchStudents = async (page = 1, search = '', classFilter = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getStudents({
        page,
        limit: 50,
        search,
        class: classFilter
      });

      if (response.success) {
        setStudents(response.data.students);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch students');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  // Fetch student statistics
  const fetchStats = async () => {
    try {
      const response = await apiService.getStudentStats();
      if (response.success) {
        setStats({
          totalStudents: response.data.totalStudents,
          recentRegistrations: response.data.recentRegistrations,
          activeStudents: response.data.activeStudents
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Fetch available classes
  const fetchAvailableClasses = async () => {
    try {
      const response = await apiService.getAvailableClasses();
      if (response.success) {
        setAvailableClasses(response.data);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchStudents(),
        fetchStats(),
        fetchAvailableClasses()
      ]);
    };
    
    loadData();
  }, []);

  // Handle search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchStudents(1, searchTerm, filterClass);
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterClass]);

  // Handle pagination
  const handlePageChange = (newPage) => {
    fetchStudents(newPage, searchTerm, filterClass);
  };

  // Download PDF from backend
  const handleDownload = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterClass) params.append('class', filterClass);
      const url = `${apiService.baseURL}/users/report.pdf${params.toString() ? `?${params.toString()}` : ''}`;

      const headers = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('authToken');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, { method: 'GET', headers, credentials: 'include' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to generate report');
      }
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'students-report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error('Download failed:', e);
      setError('Failed to download PDF');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 relative overflow-hidden">
      
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.3)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* Company Header */}
      <div className="relative z-10 pt-6 pb-4">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 via-teal-800 to-green-800 tracking-tight">
                GUIDOPIA
              </h1>
              <div className="h-0.5 w-16 bg-gradient-to-r from-emerald-500 to-teal-500 mt-1 rounded-full"></div>
              <p className="text-emerald-700 font-semibold text-sm mt-2">Admin Dashboard</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleDownload}
                className="bg-white/70 backdrop-blur-md border border-white/30 rounded-xl p-3 hover:bg-white/80 transition-all duration-300 shadow-lg"
                title="Download PDF"
              >
                <Download className="w-5 h-5 text-emerald-600" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 pb-12">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 mb-6 place-items-start">
          <div className="relative overflow-hidden w-full max-w-sm rounded-2xl border border-white/30 bg-white/60 backdrop-blur-xl shadow-md transition-all duration-300 hover:bg-white/75">
            {/* Accent gradient ring */}
            <div className="pointer-events-none absolute -inset-px rounded-2xl [mask-image:radial-gradient(60%_60%_at_50%_0%,black,transparent)]"></div>

            {/* Decorative blobs */}
            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-300/30 to-teal-300/30 blur-xl"></div>
            <div className="absolute -left-10 -bottom-10 h-20 w-20 rounded-full bg-gradient-to-tr from-emerald-200/30 to-teal-200/30 blur-xl"></div>

            <div className="relative z-10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-wide text-emerald-700/90 uppercase">Total Students</p>
                  <div className="mt-0.5 flex items-baseline space-x-2">
                    <p className="text-3xl font-black text-emerald-800 drop-shadow-sm">
                      {loading ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                      ) : (
                        stats.totalStudents
                      )}
                    </p>
                    <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 rounded-full px-2 py-0.5">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      Live
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-gray-600">Active counts across all classes</p>
                </div>
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-200/40 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-500" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/60 border border-gray-200/50 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white/80 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-500" />
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/60 border border-gray-200/50 rounded-xl text-gray-800 focus:outline-none focus:bg-white/80 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="">All Classes</option>
                {availableClasses.map((classGrade) => (
                  <option key={classGrade} value={classGrade}>
                    {classGrade} Grade
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200/50">
            <h2 className="text-2xl font-black text-gray-800">Student Directory</h2>
            <p className="text-gray-600 mt-1">
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading students...
                </span>
              ) : error ? (
                <span className="text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </span>
              ) : (
                `Showing ${students.length} of ${pagination.totalStudents} students`
              )}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-emerald-50/80">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-emerald-800">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-emerald-800">Class</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-emerald-800">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-emerald-800">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-emerald-800">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-4" />
                        <p className="text-gray-600">Loading students...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
                        <p className="text-red-600 mb-2">Failed to load students</p>
                        <p className="text-gray-500 text-sm">{error}</p>
                        <button
                          onClick={() => {
                            fetchStudents(pagination.currentPage, searchTerm, filterClass);
                            fetchStats();
                          }}
                          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Users className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No students found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-white/50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {student.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{student.fullName}</p>
                          <p className="text-sm text-gray-500">ID: #{student.id.toString().padStart(4, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-gray-700">{student.class} Grade</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span className="text-gray-700">{student.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-emerald-600" />
                        <span className="text-gray-700">{student.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 text-sm">
                        {new Date(student.joinedDate).toLocaleDateString('en-IN', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && !error && students.length > 0 && pagination.totalPages > 1 && (
          <div className="mt-6 flex justify_between items-center">
            <p className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalStudents} total students)
            </p>
            <div className="flex space-x-2">
              <button 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-4 py-2 bg-white/70 backdrop-blur-md border border-white/30 rounded-lg text-gray-700 hover:bg-white/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;