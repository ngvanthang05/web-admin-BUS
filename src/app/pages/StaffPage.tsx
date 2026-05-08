import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { adminApi } from '../services/api';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, UserCog, RefreshCw } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  Admin: 'Quản trị viên',
  Operations: 'Vận hành',
  Staff: 'Nhân viên',
  Driver: 'Tài xế',
  Customer: 'Khách hàng',
  Manager: 'Quản trị viên',
  Dispatcher: 'Vận hành',
  Cashier: 'Nhân viên',
};

export default function StaffPage() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<any[]>([]);
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const [staffData, usersData] = await Promise.all([
        adminApi.getStaff(),
        adminApi.getUsers().catch(() => []),
      ]);
      setStaff(Array.isArray(staffData) ? staffData : []);
      const uList = Array.isArray(usersData) ? usersData : (usersData as any)?.items ?? (usersData as any)?.data ?? [];
      setUserList(uList);
    } catch (e: any) {
      toast.error('Lỗi tải danh sách nhân viên: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Tìm user liên kết với staff (theo userId, email hoặc tên)
  const findLinkedUser = (s: any) => {
    return userList.find(u => {
      const userId = u.UserId ?? u.userId ?? u.id ?? u.Id;
      const email = u.Email ?? u.email ?? '';
      const username = u.Username ?? u.username ?? '';
      return (
        (s.userId && s.userId === userId) ||
        (s.UserId && s.UserId === userId) ||
        (s.email && email && s.email.toLowerCase() === email.toLowerCase()) ||
        (s.name && username && s.name.toLowerCase().includes(username.toLowerCase()))
      );
    }) ?? null;
  };

  // Lấy trạng thái hiển thị: ưu tiên isActive của user liên kết, fallback về status của staff
  const getStaffActive = (s: any): boolean => {
    const linkedUser = findLinkedUser(s);
    if (linkedUser) {
      const isActive = linkedUser.IsActive ?? linkedUser.isActive;
      if (isActive !== undefined) return Boolean(isActive);
    }
    return s.status === 'Active';
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa nhân viên này?')) return;
    setDeletingId(id);
    try {
      const s = staff.find(x => (x.StaffId ?? x.staffId ?? x.Id ?? x.id) === id);
      const linkedUser = s ? findLinkedUser(s) : null;

      try {
        await adminApi.deleteStaff(id);
        setStaff(prev => prev.filter(x => (x.StaffId ?? x.staffId ?? x.Id ?? x.id) !== id));
        toast.success('Đã xóa nhân viên');
      } catch (backendError: any) {
        const errorMsg = backendError.message || '';
        if (window.confirm('Lỗi hệ thống: Không thể xóa vĩnh viễn nhân viên này (có thể do nhân viên đang liên kết với chuyến xe/vé).\n\nBạn có muốn chuyển nhân viên này sang trạng thái "Ngừng hoạt động" thay vì xóa không?')) {
          if (s) {
            await adminApi.updateStaff(id, { ...s, status: 'Inactive' });
            toast.success('Đã chuyển sang trạng thái Ngừng hoạt động.');
            fetchStaff();
          }
        } else {
          toast.error('Lỗi xóa: ' + errorMsg);
        }
        setDeletingId(null);
        return; // Dừng lại ở đây nếu xóa cứng thất bại
      }

      if (linkedUser) {
        const userId = linkedUser.UserId ?? linkedUser.userId ?? linkedUser.id ?? linkedUser.Id;
        try {
          await adminApi.deleteUser(userId);
          setUserList(prev => prev.filter(u => (u.UserId ?? u.userId ?? u.id ?? u.Id) !== userId));
        } catch (e) {
          console.error('Lỗi xóa user liên kết:', e);
        }
      }

    } catch (e: any) {
      toast.error('Lỗi: ' + e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = staff.filter(s => {
    const q = search.toLowerCase();
    const active = getStaffActive(s);
    if (!showInactive && !active) return false;

    return (
      (s.name || s.Name || '').toLowerCase().includes(q) ||
      (s.phone || s.Phone || '').toLowerCase().includes(q) ||
      (s.role || s.Role || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <UserCog size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý nhân viên</h1>
            <p className="text-sm text-gray-500">{staff.length} nhân viên trong hệ thống</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchStaff}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={14} />
            Làm mới
          </button>
          <button
            onClick={() => navigate('/staff/new')}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={14} />
            Thêm nhân viên
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, SĐT, chức vụ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer bg-white px-3 py-2.5 border border-gray-200 rounded-lg select-none">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={e => setShowInactive(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
          />
          Hiển thị nhân viên đã nghỉ
        </label>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <RefreshCw size={24} className="animate-spin mr-2" />
            Đang tải...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <UserCog size={40} className="mx-auto mb-3 opacity-30" />
            <p>Không có nhân viên nào</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ID</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Họ tên</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Điện thoại</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Vai trò</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((s) => {
                const id = s.StaffId ?? s.staffId ?? s.Id ?? s.id;
                return (
                  <tr key={id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">#{id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{s.name || s.Name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{s.phone || s.Phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        {ROLE_LABELS[s.role || s.Role] || s.role || s.Role || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const active = getStaffActive(s);
                        return (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                          }`}>
                            {active ? 'Hoạt động' : 'Ngừng hoạt động'}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/staff/${id}/edit`)}
                          className="p-1.5 rounded-md hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
                          title="Sửa"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(id)}
                          disabled={deletingId === id}
                          className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
