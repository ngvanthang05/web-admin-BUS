import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Header } from '../../components/layout/Header';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { routeApi } from '../../services/api';
import { Plus, Edit2, Trash2, Search, AlertCircle, Route } from 'lucide-react';
import { toast } from 'sonner';

export default function RouteList() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchRoutes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await routeApi.getAll();
      setRoutes(data);
    } catch (err: any) {
      setError(err.message);
      setRoutes([
        { BusRouteId: 1, Departure: 'Hà Nội', Destination: 'TP.HCM', Distance: 1730, Duration: '29h', BasePrice: 450000 },
        { BusRouteId: 2, Departure: 'Đà Nẵng', Destination: 'TP.HCM', Distance: 964, Duration: '16h', BasePrice: 280000 },
        { BusRouteId: 3, Departure: 'Hà Nội', Destination: 'Đà Nẵng', Distance: 791, Duration: '13h', BasePrice: 220000 },
        { BusRouteId: 4, Departure: 'TP.HCM', Destination: 'Cần Thơ', Distance: 170, Duration: '3h', BasePrice: 80000 },
        { BusRouteId: 5, Departure: 'TP.HCM', Destination: 'Vũng Tàu', Distance: 125, Duration: '2h', BasePrice: 60000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoutes(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Xác nhận xóa tuyến này?')) return;
    setDeleting(id);
    try {
      await routeApi.delete(id);
      setRoutes(r => r.filter(x => x.BusRouteId !== id));
      toast.success('Đã xóa tuyến xe');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = routes.filter(r =>
    r.Departure?.toLowerCase().includes(search.toLowerCase()) ||
    r.Destination?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <Header title="Quản lý tuyến xe" subtitle={`${routes.length} tuyến`} onRefresh={fetchRoutes} loading={loading} />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            <AlertCircle size={15} className="flex-shrink-0" />
            Backend offline. Đang hiển thị dữ liệu mẫu.
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg w-72">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm điểm đi/đến..."
              className="text-sm outline-none text-gray-700 w-full bg-transparent"
            />
          </div>
          <Link
            to="/routes/new"
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
            style={{ fontWeight: 500 }}
          >
            <Plus size={16} />
            Thêm tuyến mới
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>ID</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Điểm đi</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Điểm đến</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Khoảng cách</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Thời gian</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Giá cơ bản</th>
                <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && routes.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">Không có dữ liệu</td></tr>
              ) : filtered.map(route => (
                <tr key={route.BusRouteId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-500">#{route.BusRouteId}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                      <span className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{route.Departure}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                      <span className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{route.Destination}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{route.Distance ? `${route.Distance} km` : '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{route.Duration ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700" style={{ fontWeight: 500 }}>
                    {route.BasePrice ? new Intl.NumberFormat('vi-VN').format(route.BasePrice) + ' đ' : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/routes/${route.BusRouteId}/edit`}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Edit2 size={15} />
                      </Link>
                      <button
                        onClick={() => handleDelete(route.BusRouteId)}
                        disabled={deleting === route.BusRouteId}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400">Tổng: {filtered.length} tuyến</p>
      </div>
    </div>
  );
}
