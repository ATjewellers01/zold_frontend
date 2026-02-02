import { useState, useEffect } from "react";
import { Search, Filter, MoreVertical, Shield, Trash2, Edit, CheckCircle, XCircle, UserCircle } from "lucide-react";

// API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'USER';
  riskLevel: string;
  isVerified: boolean;
  goldBalance: number;
  rupeeBalance: number;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setAuthError(false);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      // Check for authentication errors
      if (response.status === 401) {
        setAuthError(true);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        console.error("Failed to fetch users:", data.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  // Authentication error display
  if (authError) {
    return (
      <div className="space-y-6 p-4 pb-96 md:p-6 md:pb-96">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              Manage system users and verify accounts
            </p>
          </div>
        </div>
        
        <div className="rounded-xl bg-red-50 border border-red-200 p-6 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">Authentication Required</h3>
              <p className="mt-2 text-sm text-red-800 dark:text-red-300">
                Your session has expired or your authentication token is invalid. Please log out and log back in to continue.
              </p>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3D3066] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6 p-4 pb-96 md:p-6 md:pb-96">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            Manage system users and verify accounts
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm md:flex-row md:items-center dark:bg-neutral-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-[#3D3066] focus:ring-1 focus:ring-[#3D3066] dark:border-neutral-700 dark:bg-neutral-700 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
            <select 
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#3D3066] dark:border-neutral-700 dark:bg-neutral-700 dark:text-white"
            >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
            </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl bg-white shadow-sm dark:bg-neutral-800">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 dark:bg-neutral-700/50 dark:text-neutral-400">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">Gold (g)</th>
                <th className="px-6 py-4 font-medium">₹ Balance</th>
                <th className="px-6 py-4 font-medium">KYC</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-700 relative">
              {filteredUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3D3066]/10 text-[#3D3066] dark:bg-[#4D3F7F]/20 dark:text-[#a594f9]">
                        <span className="font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-xs text-gray-500 dark:text-neutral-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-neutral-300">
                    {user.phone || '—'}
                  </td>
                  <td className="px-6 py-4 font-medium text-amber-600 dark:text-amber-400">
                    {user.goldBalance.toFixed(3)}
                  </td>
                  <td className="px-6 py-4 font-medium text-green-600 dark:text-green-400">
                    ₹{Number(user.rupeeBalance).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.kycStatus === 'APPROVED' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : user.kycStatus === 'REJECTED'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {user.kycStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {user.isVerified ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-green-700 dark:text-green-400">Verified</span>
                        </>
                      ) : (
                        <>
                            <XCircle className="h-4 w-4 text-yellow-500" />
                            <span className="text-yellow-700 dark:text-yellow-400">Pending</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative">
                      <button 
                        onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      
                      {openDropdown === user.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50 dark:bg-neutral-800 dark:ring-neutral-700">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setOpenDropdown(null);
                              }}
                              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                            >
                              <UserCircle className="mr-3 h-4 w-4" />
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                alert(`Editing ${user.name}`);
                                setOpenDropdown(null);
                              }}
                              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                            >
                              <Edit className="mr-3 h-4 w-4" />
                              Edit User
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Freeze wallet for ${user.name}?`)) {
                                  alert('Wallet freeze functionality coming soon');
                                }
                                setOpenDropdown(null);
                              }}
                              className="flex w-full items-center px-4 py-2 text-sm text-orange-600 hover:bg-gray-100 dark:text-orange-400 dark:hover:bg-neutral-700"
                            >
                              <Shield className="mr-3 h-4 w-4" />
                              Freeze Wallet
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete ${user.name}? This action cannot be undone.`)) {
                                  alert('Delete functionality coming soon');
                                }
                                setOpenDropdown(null);
                              }}
                              className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-neutral-700"
                            >
                              <Trash2 className="mr-3 h-4 w-4" />
                              Delete User
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-neutral-400">
                No users found matching your search.
            </div>
        )}
      </div>
    </div>

    {/* User Details Modal */}
    {selectedUser && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-neutral-800">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-neutral-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Details</h2>
            <button
              onClick={() => setSelectedUser(null)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-neutral-700 dark:hover:text-gray-300"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {/* User Avatar & Name */}
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#3D3066]/10 text-[#3D3066] text-3xl font-bold dark:bg-[#4D3F7F]/20 dark:text-[#a594f9]">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser.name}</h3>
                <p className="text-sm text-gray-500 dark:text-neutral-400">@{selectedUser.username}</p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-neutral-400">Email</label>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.email}</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-neutral-400">Phone</label>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.phone || '—'}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-neutral-400">Role</label>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  selectedUser.role === 'ADMIN' 
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                }`}>
                  {selectedUser.role}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-neutral-400">Risk Level</label>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.riskLevel}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-neutral-400">Verification Status</label>
                <div className="flex items-center gap-1.5">
                  {selectedUser.isVerified ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">Verified</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Pending</span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-neutral-400">KYC Status</label>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  selectedUser.kycStatus === 'APPROVED' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : selectedUser.kycStatus === 'REJECTED'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`}>
                  {selectedUser.kycStatus}
                </span>
              </div>
            </div>

            {/* Gold & Wallet Info */}
            <div className="rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 p-4 dark:from-amber-900/20 dark:to-yellow-900/20">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 dark:text-neutral-300">Wallet Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-neutral-400">Gold Balance</label>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{selectedUser.goldBalance.toFixed(3)}g</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-neutral-400">Rupee Balance</label>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">₹{Number(selectedUser.rupeeBalance).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Account Information</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-neutral-400">User ID:</span>
                  <span className="font-mono text-xs text-gray-900 dark:text-white">{selectedUser.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-neutral-400">Member Since:</span>
                  <span className="text-gray-900 dark:text-white">{new Date(selectedUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t border-gray-200 p-6 dark:border-neutral-700">
            <button
              onClick={() => setSelectedUser(null)}
              className="w-full rounded-lg bg-[#3D3066] px-4 py-2 text-sm font-medium text-white hover:bg-[#2D2051] dark:bg-[#4D3F7F] dark:hover:bg-[#3D3066]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
