import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { adminApi } from '../services/api';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, Truck, RefreshCw } from 'lucide-react';

export default function DriversPage() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getDrivers();
      setDrivers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error('Lỗi tải danh sách tài xế: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrivers(); }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa tài xế này?')) return;
    setDeletingId(id);
    try {
      await adminApi.deleteDriver(id);
      toast.success('Đã xóa tài xế');
      setDrivers(prev => prev.filter(d => d.driverId !== id && d.id !== id));
    } catch (e: any) {
      toast.error('Lỗi xóa: ' + e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = drivers.filter(d => {
    const q = search.toLowerCase();
    return (
      (d.fullName || d.name || '').toLowerCase().includes(q) ||
      (d.email || '').toLowerCase().includes(q) ||
      (d.phone || '').toLowerCase().includes(q) ||
      (d.licenseNumber || '').toLowerCase().includes(q)
    );
  });

  const getLicenseColor = (type: string) => {
    if (!type) return 'bg-gray-100 text-gray-600';
    const t = type.toUpperCase();
    if (t === 'B2') return 'bg-blue-50 text-blue-700';
    if (t === 'D') return 'bg-green-50 text-green-700';
    if (t === 'E') return 'bg-purple-50 text-purple-700';
    return 'bg-amber-50 text-amber-700';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
            <Truck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý tài xế</h1>
            <p className="text-sm text-gray-500">{drivers.length} tài xế trong hệ thống</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchDrivers}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={14} />
            Làm mới
          </button>
          <button
            onClick={() => navigate('/drivers/new')}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus size={14} />
            Thêm tài xế
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm theo tên, email, SĐT, số bằng lái..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
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
            <Truck size={40} className="mx-auto mb-3 opacity-30" />
            <p>Không có tài xế nào</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ID</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Họ tên</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Điện thoại</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Bằng lái</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Hạng</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((d) => {
                const id = d.driverId ?? d.id;
                return (
                  <tr key={id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">#{id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{d.fullName || d.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{d.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{d.phone || '—'}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{d.licenseNumber || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLicenseColor(d.licenseClass || d.licenseType)}`}>
                        {d.licenseClass || d.licenseType || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/drivers/${id}/edit`)}
                          className="p-1.5 rounded-md hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"
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
