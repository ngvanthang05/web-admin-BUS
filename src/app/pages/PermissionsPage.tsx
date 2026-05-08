import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { Header } from '../components/layout/Header';
import {
  AlertCircle, Loader2, Search, RefreshCw,
  ShieldCheck, Check, X, UserCog
} from 'lucide-react';

const ROLES = ['Admin', 'Operations', 'Staff', 'Driver', 'Customer'];

const PORTAL_PERMISSIONS: Record<string, string[]> = {
  Admin: [
    'Xem Dashboard', 'Quản lý tuyến', 'Quản lý xe', 'Quản lý chuyến',
    'Quản lý vé', 'Quản lý user', 'Xem báo cáo', 'Cài đặt hệ thống',
    'Phân quyền', 'Quản lý nhân viên', 'Quản lý tài xế',
  ],
  Operations: [
    'Xem chuyến xe', 'Tạo chuyến', 'Hủy chuyến', 'Cập nhật chuyến',
    'Phân công tài xế', 'Giám sát real-time',
  ],
  Staff: [
    'Xem chuyến hôm nay', 'Bán vé tại quầy', 'Hủy booking',
    'Đổi ghế', 'Check-in QR', 'Thu tiền mặt',
  ],
  Customer: [
    'Tìm kiếm tuyến', 'Đặt vé online', 'Xem lịch sử',
    'Hủy vé', 'Xem QR vé', 'Cập nhật profile',
  ],
  Driver: [
    'Xem lịch chạy', 'Xem hành khách', 'Cập nhật trạng thái chuyến',
  ],
};

const roleColor: Record<string, string> = {
  Admin: 'bg-gray-800 text-white',
  Operations: 'bg-blue-600 text-white',
  Staff: 'bg-purple-600 text-white',
  Driver: 'bg-amber-500 text-white',
  Customer: 'bg-green-600 text-white',
};

const ROLE_LABELS: Record<string, string> = {
  Admin: 'Quản trị viên',
  Operations: 'Vận hành',
  Staff: 'Nhân viên',
  Driver: 'Tài xế',
  Customer: 'Khách hàng',
};

const MOCK_USERS = [
  { userId: 1, username: 'admin', role: 'Admin', isActive: true, email: 'admin@busadmin.vn' },
  { userId: 2, username: 'operations01', role: 'Operations', isActive: true, email: 'ops@busadmin.vn' },
  { userId: 3, username: 'staff_sale01', role: 'Staff', isActive: true, email: 'staff1@busadmin.vn' },
  { userId: 4, username: 'driver_01', role: 'Driver', isActive: true, email: 'driver1@busadmin.vn' },
  { userId: 5, username: 'customer_01', role: 'Customer', isActive: true, email: 'user@gmail.com' },
  { userId: 6, username: 'driver_02', role: 'Driver', isActive: false, email: 'driver2@busadmin.vn' },
  { userId: 7, username: 'staff_sale02', role: 'Staff', isActive: true, email: 'staff2@busadmin.vn' },
];

export default function PermissionsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [changing, setChanging] = useState(false);
  const [newRole, setNewRole] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
      setUsers(MOCK_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChangeRole = async () => {
    if (!selected || !newRole || newRole === selected.role) return;
    setChanging(true);
    try {
      await adminApi.changeUserRole(selected.userId, newRole);
      setUsers(prev => prev.map(u => u.userId === selected.userId ? { ...u, role: newRole } : u));
      setSelected((prev: any) => ({ ...prev, role: newRole }));
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setChanging(false);
    }
  };

  const filtered = users.filter(u => {
    const s = search.toLowerCase();
    return !s || u.username?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.role?.toLowerCase().includes(s);
  });

  return (
    <div className="flex flex-col h-full">
      <Header title="Phân quyền người dùng" subtitle="Quản lý role và quyền hạn từng tài khoản" onRefresh={load} loading={loading} />

      <div className="flex-1 overflow-hidden flex gap-0">
        {/* Left: User List */}
        <div className="w-80 flex-shrink-0 border-r border-gray-200 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <Search size={14} className="text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm tên đăng nhập, email..."
                className="text-sm outline-none text-gray-700 w-full bg-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="mx-4 mt-3 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
              <AlertCircle size={13} /> Backend offline — dữ liệu mẫu
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-gray-400" size={24} />
              </div>
            ) : filtered.map(u => (
              <button
                key={u.userId}
                onClick={() => { setSelected(u); setNewRole(u.role); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left ${selected?.userId === u.userId ? 'bg-gray-50 border-l-2 border-l-gray-700' : ''}`}
              >
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0" style={{ fontWeight: 600 }}>
                  <span className="text-sm text-gray-600">{u.username?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-gray-800 truncate" style={{ fontWeight: 500 }}>{u.username}</span>
                    {u.isActive === false && (
                      <span className="text-xs text-red-500 flex-shrink-0">Ngừng hoạt động</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${roleColor[u.role] || 'bg-gray-200 text-gray-600'}`}>
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                    <span className="text-xs text-gray-400 truncate">{u.email}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Permission Detail */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {!selected ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <UserCog className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500">Chọn một người dùng để xem & chỉnh sửa quyền</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5 max-w-2xl">
              {/* User Header */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-700 flex items-center justify-center text-white text-xl" style={{ fontWeight: 700 }}>
                    {selected.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-gray-800 text-lg" style={{ fontWeight: 700 }}>@{selected.username}</h2>
                    <p className="text-gray-500 text-sm">{selected.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColor[selected.role] || 'bg-gray-200 text-gray-600'}`}>
                        {ROLE_LABELS[selected.role] || selected.role}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${selected.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {selected.isActive !== false ? 'Hoạt động' : 'Ngừng hoạt động'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Change Role */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck size={18} className="text-gray-500" />
                  <h3 className="text-gray-800" style={{ fontWeight: 600 }}>Đổi Vai Trò</h3>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                  {ROLES.map(r => (
                    <button
                      key={r}
                      onClick={() => setNewRole(r)}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        newRole === r
                          ? `${roleColor[r]} border-transparent shadow-sm`
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      {ROLE_LABELS[r] || r}
                    </button>
                  ))}
                </div>
                {newRole !== selected.role && (
                  <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                    <AlertCircle size={14} className="text-amber-600 flex-shrink-0" />
                    <p className="text-xs text-amber-700">
                      Thay đổi vai trò từ <strong>{ROLE_LABELS[selected.role] || selected.role}</strong> → <strong>{ROLE_LABELS[newRole] || newRole}</strong>.
                      Người dùng sẽ chỉ có quyền truy cập theo vai trò mới.
                    </p>
                  </div>
                )}
                <button
                  onClick={handleChangeRole}
                  disabled={changing || newRole === selected.role}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {changing ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  Xác nhận đổi vai trò
                </button>
              </div>

              {/* Current Permissions */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-gray-800 mb-4" style={{ fontWeight: 600 }}>
                  Quyền hiện tại — Vai trò: {ROLE_LABELS[selected.role] || selected.role}
                </h3>
                <div className="space-y-2">
                  {(PORTAL_PERMISSIONS[selected.role] || []).map(perm => (
                    <div key={perm} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check size={11} className="text-green-600" />
                      </div>
                      <span className="text-sm text-gray-700">{perm}</span>
                    </div>
                  ))}
                </div>

                {/* Denied permissions */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-medium">Không có quyền</p>
                  <div className="space-y-2">
                    {Object.entries(PORTAL_PERMISSIONS)
                      .filter(([role]) => role !== selected.role)
                      .flatMap(([, perms]) => perms)
                      .filter((p, i, arr) => arr.indexOf(p) === i && !(PORTAL_PERMISSIONS[selected.role] || []).includes(p))
                      .slice(0, 5)
                      .map(perm => (
                        <div key={perm} className="flex items-center gap-3 py-1.5">
                          <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                            <X size={11} className="text-red-400" />
                          </div>
                          <span className="text-sm text-gray-400">{perm}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
