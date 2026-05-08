import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { useToast } from '../hooks/useToast';
import {
  Users, Search, RefreshCw, AlertCircle, Loader2,
  ShieldCheck, Trash2, Key, ToggleLeft, ToggleRight, UserCog,
  UserPlus, Eye, EyeOff, X, Phone, Mail, BadgeCheck, Calendar, Info
} from 'lucide-react';
import { Header } from '../components/layout/Header';

const ROLES = ['Admin', 'Operations', 'Staff', 'Driver', 'Customer'];

// Không dùng mock data — chỉ lấy dữ liệu thật từ API

const roleColor: Record<string, string> = {
  Admin: 'bg-gray-800 text-white',
  Operations: 'bg-blue-100 text-blue-700',
  Staff: 'bg-purple-100 text-purple-700',
  Driver: 'bg-amber-100 text-amber-700',
  Customer: 'bg-green-100 text-green-700',
};

const ROLE_LABELS: Record<string, string> = {
  Admin: 'Quản trị viên',
  Operations: 'Vận hành',
  Staff: 'Nhân viên',
  Driver: 'Tài xế',
  Customer: 'Khách hàng',
};

export default function UsersPage() {
  const { showToast, ToastUI } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [resetModal, setResetModal] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [roleModal, setRoleModal] = useState<any | null>(null);
  const [newRole, setNewRole] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [showCreatePwd, setShowCreatePwd] = useState(false);
  const [createForm, setCreateForm] = useState({ username: '', email: '', password: '', role: 'Customer', fullName: '', phone: '' });
  const [staffModal, setStaffModal] = useState<any | null>(null); // { user, staff | null, loading }

  // Normalize field names: backend ASP.NET trả về PascalCase (UserId, Username, IsActive, CreatedAt...)
  const normalizeUser = (u: any) => {
    // DEBUG: log raw object để xem backend trả về field gì
    console.log('[DEBUG] raw user object:', JSON.stringify(u));
    const userId = u.UserId ?? u.userId ?? u.id ?? u.Id;
    const username = u.Username ?? u.username ?? u.UserName ?? u.userName ?? '';
    const email = u.Email ?? u.email ?? u.EmailAddress ?? u.emailAddress ?? u.email_address ?? '';
    const role = u.Role ?? u.role ?? u.RoleName ?? u.roleName ?? '';
    const createdAt = u.CreatedAt ?? u.createdAt ?? u.created_at ?? u.CreateDate ?? u.createDate ?? u.RegisterDate ?? u.registerDate ?? u.DateCreated ?? u.dateCreated ?? '';
    // IsActive: bool trực tiếp hoặc suy từ status string
    let isActive: boolean;
    if (u.IsActive !== undefined) isActive = Boolean(u.IsActive);
    else if (u.isActive !== undefined) isActive = Boolean(u.isActive);
    else isActive = u.status === 'Active' || u.status === 'active';
    return { ...u, userId, username, email, role, isActive, createdAt };
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersData, staffData] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getStaff().catch(() => []),
      ]);
      const list = Array.isArray(usersData) ? usersData : (usersData as any)?.items ?? (usersData as any)?.data ?? [];
      setUsers(list.map(normalizeUser));
      setStaffList(Array.isArray(staffData) ? staffData : []);
    } catch (err: any) {
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Tìm nhân viên liên kết với user (theo userId hoặc username/email)
  const findLinkedStaff = (u: any) => {
    return staffList.find(s =>
      (s.userId && s.userId === u.userId) ||
      (s.UserId && s.UserId === u.userId) ||
      (s.email && u.email && s.email.toLowerCase() === u.email.toLowerCase()) ||
      (s.name && u.username && s.name.toLowerCase().includes(u.username.toLowerCase()))
    ) ?? null;
  };

  const openStaffModal = (u: any) => {
    const linked = findLinkedStaff(u);
    setStaffModal({ user: u, staff: linked });
  };

  useEffect(() => { load(); }, []);

  const handleToggleActive = async (u: any) => {
    setActionLoading(u.userId);
    try {
      await adminApi.toggleUserActive(u.userId);
      setUsers(prev => prev.map(x => x.userId === u.userId ? { ...x, isActive: !x.isActive } : x));
      showToast(`Đã ${u.isActive ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản @${u.username}!`);
    } catch (err: any) {
      showToast('Thất bại: ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (u: any) => {
    if (!confirm(`Xóa user "${u.username}"? Hành động này không thể hoàn tác.`)) return;
    setActionLoading(u.userId);
    try {
      const linkedStaff = findLinkedStaff(u);

      await adminApi.deleteUser(u.userId);
      setUsers(prev => prev.filter(x => x.userId !== u.userId));

      if (linkedStaff) {
        const staffId = linkedStaff.StaffId ?? linkedStaff.staffId ?? linkedStaff.Id ?? linkedStaff.id;
        try {
          await adminApi.deleteStaff(staffId);
          setStaffList(prev => prev.filter(s => (s.StaffId ?? s.staffId ?? s.Id ?? s.id) !== staffId));
        } catch (e) {
          console.error('Lỗi xóa nhân viên liên kết:', e);
        }
      }

      showToast(`Đã xóa tài khoản @${u.username}!`);
    } catch (err: any) {
      showToast('Xóa thất bại: ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeRole = async () => {
    if (!roleModal || !newRole) return;
    setActionLoading(roleModal.userId);
    try {
      await adminApi.changeUserRole(roleModal.userId, newRole);
      setUsers(prev => prev.map(x => x.userId === roleModal.userId ? { ...x, role: newRole } : x));
      setRoleModal(null);
      showToast(`Đã đổi vai trò @${roleModal.username} → ${ROLE_LABELS[newRole] || newRole}!`);
    } catch (err: any) {
      showToast('Thất bại: ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async () => {
    if (!resetModal || !newPassword) return;
    setActionLoading(resetModal.userId);
    try {
      await adminApi.resetPassword(resetModal.userId, newPassword);
      showToast(`Đặt lại mật khẩu @${resetModal.username} thành công!`);
      setResetModal(null);
      setNewPassword('');
    } catch (err: any) {
      showToast('Thất bại: ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateUser = async () => {
    if (!createForm.username.trim()) { showToast('Vui lòng nhập tên đăng nhập', 'error'); return; }
    if (!createForm.password) { showToast('Vui lòng nhập mật khẩu', 'error'); return; }
    setCreateLoading(true);
    try {
      const created = await adminApi.createUser(createForm);
      showToast(`Đã tạo tài khoản @${createForm.username} thành công!`);
      setCreateModal(false);
      setCreateForm({ username: '', email: '', password: '', role: 'Customer', fullName: '', phone: '' });
      // Thêm user mới vào danh sách hoặc reload
      if (created && (created.userId || created.id)) {
        setUsers(prev => [normalizeUser(created), ...prev]);
      } else {
        load();
      }
    } catch (err: any) {
      showToast('Tạo thất bại: ' + err.message, 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const filtered = users.filter(u => {
    const s = search.toLowerCase();
    const matchSearch = !s || u.username?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || String(u.userId).includes(s);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const fmt = (d: string) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

  return (
    <div className="flex flex-col h-full">
      {ToastUI}
      <Header title="Quản lý người dùng" subtitle={`${users.length} tài khoản`} onRefresh={load} loading={loading} />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            <AlertCircle size={15} className="flex-shrink-0" />
            Backend offline — đang hiển thị dữ liệu mẫu.
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ROLES.filter(r => r !== 'Customer').map(r => (
            <div key={r} className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm text-center">
              <p className="text-xs text-gray-500">{ROLE_LABELS[r] || r}</p>
              <p className="text-xl text-gray-800 mt-1" style={{ fontWeight: 700 }}>
                {users.filter(u => u.role === r).length}
              </p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg flex-1 max-w-sm">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm tên đăng nhập, email, ID..."
              className="text-sm outline-none text-gray-700 w-full bg-transparent"
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none"
          >
            <option value="">Tất cả vai trò</option>
            {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>)}
          </select>
          <button onClick={load} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => { setCreateModal(true); setCreateForm({ username: '', email: '', password: '', role: 'Customer', fullName: '', phone: '' }); setShowCreatePwd(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <UserPlus size={15} />
            Tạo tài khoản
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading && users.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-gray-400" size={28} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Users className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-400 text-sm">Không tìm thấy tài khoản nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">ID</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Tên đăng nhập</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Email</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Vai trò</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Trạng thái</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Ngày tạo</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((u: any) => (
                    <tr key={u.userId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400">#{u.userId}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 flex-shrink-0" style={{ fontWeight: 600 }}>
                            {u.username?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-gray-800" style={{ fontWeight: 500 }}>{u.username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{u.email || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[u.role] || 'bg-gray-100 text-gray-600'}`}>
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {u.isActive !== false ? 'Hoạt động' : 'Ngừng hoạt động'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmt(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {/* View staff info */}
                          <button
                            onClick={() => openStaffModal(u)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="Xem thông tin nhân viên"
                          >
                            <Info size={15} />
                          </button>
                          {/* Toggle active */}
                          <button
                            onClick={() => handleToggleActive(u)}
                            disabled={actionLoading === u.userId}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title={u.isActive !== false ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          >
                            {actionLoading === u.userId
                              ? <Loader2 size={14} className="animate-spin" />
                              : u.isActive !== false ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                          </button>
                          {/* Change role */}
                          <button
                            onClick={() => { setRoleModal(u); setNewRole(u.role); }}
                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                            title="Đổi vai trò"
                          >
                            <ShieldCheck size={15} />
                          </button>
                          {/* Reset password */}
                          <button
                            onClick={() => { setResetModal(u); setNewPassword(''); }}
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            title="Đặt lại mật khẩu"
                          >
                            <Key size={15} />
                          </button>
                          {/* Delete */}
                          {u.role !== 'Admin' && (
                            <button
                              onClick={() => handleDelete(u)}
                              disabled={actionLoading === u.userId}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Xóa tài khoản"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400">Hiển thị {filtered.length}/{users.length} tài khoản</p>
      </div>

      {/* Staff Info Modal */}
      {staffModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-bold">
                  {(staffModal.staff?.name || staffModal.user?.username || '?')[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-gray-800 font-bold text-base">
                    {staffModal.staff?.name || staffModal.user?.username || '—'}
                  </h3>
                  <p className="text-xs text-gray-400">@{staffModal.user?.username} · #{staffModal.user?.userId}</p>
                </div>
              </div>
              <button
                onClick={() => setStaffModal(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* User account info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Tài khoản hệ thống</p>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <BadgeCheck size={14} className="text-indigo-500 flex-shrink-0" />
                <span className="text-gray-500">Vai trò:</span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[staffModal.user?.role] || 'bg-gray-100 text-gray-600'}`}>
                  {ROLE_LABELS[staffModal.user?.role] || staffModal.user?.role || '—'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail size={14} className="text-indigo-500 flex-shrink-0" />
                <span className="text-gray-500">Email:</span>
                <span className="ml-1">{staffModal.user?.email || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${staffModal.user?.isActive !== false ? 'bg-green-500' : 'bg-red-400'}`} />
                <span className="text-gray-500">Trạng thái:</span>
                <span className={`ml-1 font-medium ${staffModal.user?.isActive !== false ? 'text-green-600' : 'text-red-500'}`}>
                  {staffModal.user?.isActive !== false ? 'Hoạt động' : 'Ngừng hoạt động'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar size={14} className="text-indigo-500 flex-shrink-0" />
                <span className="text-gray-500">Ngày tạo:</span>
                <span className="ml-1">{fmt(staffModal.user?.createdAt)}</span>
              </div>
            </div>

            {/* Staff profile info */}
            {staffModal.staff ? (
              <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-2">Hồ sơ nhân viên</p>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <UserCog size={14} className="text-indigo-500 flex-shrink-0" />
                  <span className="text-gray-500">Họ tên:</span>
                  <span className="ml-1 font-medium">{staffModal.staff.name || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone size={14} className="text-indigo-500 flex-shrink-0" />
                  <span className="text-gray-500">Điện thoại:</span>
                  <span className="ml-1">{staffModal.staff.phone || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <BadgeCheck size={14} className="text-indigo-500 flex-shrink-0" />
                  <span className="text-gray-500">Chức vụ:</span>
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                    {ROLE_LABELS[staffModal.staff.role] || staffModal.staff.role || '—'}
                  </span>
                </div>
                {staffModal.staff.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Mail size={14} className="text-indigo-500 flex-shrink-0" />
                    <span className="text-gray-500">Email NV:</span>
                    <span className="ml-1">{staffModal.staff.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${staffModal.staff.status === 'Active' ? 'bg-green-500' : 'bg-red-400'}`} />
                  <span className="text-gray-500">Trạng thái NV:</span>
                  <span className={`ml-1 font-medium ${staffModal.staff.status === 'Active' ? 'text-green-600' : 'text-red-500'}`}>
                    {staffModal.staff.status === 'Active' ? 'Hoạt động' : staffModal.staff.status || '—'}
                  </span>
                </div>
                {(staffModal.staff.staffId ?? staffModal.staff.id) && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Info size={14} className="text-indigo-400 flex-shrink-0" />
                    <span>Mã nhân viên: #{staffModal.staff.staffId ?? staffModal.staff.id}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center text-gray-400 bg-gray-50 rounded-xl">
                <UserCog size={28} className="mb-2 opacity-40" />
                <p className="text-sm">Không tìm thấy hồ sơ nhân viên liên kết</p>
                <p className="text-xs mt-1 text-gray-300">User này chưa có bản ghi trong quản lý nhân viên</p>
              </div>
            )}

            <button
              onClick={() => setStaffModal(null)}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {roleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 rounded-xl"><ShieldCheck size={20} className="text-purple-600" /></div>
              <div>
                <h3 className="text-gray-800" style={{ fontWeight: 700 }}>Đổi Vai Trò</h3>
                <p className="text-sm text-gray-500">@{roleModal.username}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => setNewRole(r)}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${newRole === r ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                  {ROLE_LABELS[r] || r}
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleChangeRole} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
                Xác nhận
              </button>
              <button onClick={() => setRoleModal(null)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl"><Key size={20} className="text-amber-600" /></div>
              <div>
                <h3 className="text-gray-800" style={{ fontWeight: 700 }}>Đặt lại mật khẩu</h3>
                <p className="text-sm text-gray-500">@{resetModal.username}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới..."
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleResetPassword} disabled={!newPassword} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
                Đặt lại
              </button>
              <button onClick={() => setResetModal(null)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {createModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 rounded-xl">
                  <UserPlus size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-gray-800 font-bold text-base">Tạo tài khoản mới</h3>
                  <p className="text-xs text-gray-400">Điền thông tin để khởi tạo tài khoản</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Họ tên + SĐT trên 1 hàng */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={createForm.fullName}
                    onChange={e => setCreateForm(p => ({ ...p, fullName: e.target.value }))}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={e => setCreateForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="0901234567"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.username}
                  onChange={e => setCreateForm(p => ({ ...p, username: e.target.value }))}
                  placeholder="vd: nguyen_van_a"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="example@email.com"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCreatePwd ? 'text' : 'password'}
                    value={createForm.password}
                    onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Nhập mật khẩu..."
                    className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCreatePwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Vai trò</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setCreateForm(p => ({ ...p, role: r }))}
                      className={`py-2 rounded-lg text-xs font-medium border transition-colors ${createForm.role === r
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      {ROLE_LABELS[r] || r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateUser}
                disabled={createLoading}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {createLoading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                Tạo tài khoản
              </button>
              <button
                onClick={() => setCreateModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
