import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { routesApi } from '../services/api';
import { useToast } from '../hooks/useToast';
import { Plus, Pencil, Trash2, Search, RefreshCw, AlertCircle, Loader2, Route } from 'lucide-react';

// Normalize ID — API có thể trả routeId | id | busRouteId | BusRouteId
const getId = (r: any): number =>
  r.routeId ?? r.id ?? r.busRouteId ?? r.RouteId ?? r.BusRouteId ?? r.Id;

export function RoutesPage() {
  const navigate = useNavigate();
  const { showToast, ToastUI } = useToast();
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await routesApi.getAll();
      setRoutes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa tuyến "${name}"?`)) return;
    if (!id) {
      showToast('Không xác định được ID tuyến!', 'error');
      return;
    }
    setDeleting(id);
    try {
      await routesApi.delete(id);
      setRoutes(r => r.filter(x => getId(x) !== id));
      showToast(`Đã xóa tuyến "${name}" thành công!`);
    } catch (err: any) {
      showToast('Xóa thất bại: ' + err.message, 'error');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = routes.filter(r =>
    `${r.departure} ${r.destination} ${r.routeName || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      {ToastUI}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800">Quản Lý Tuyến Xe</h1>
          <p className="text-sm text-gray-500 mt-0.5">{routes.length} tuyến trong hệ thống</p>
        </div>
        <button
          onClick={() => navigate('/routes/new')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
        >
          <Plus size={16} /> Thêm tuyến
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo điểm đi, điểm đến..."
            className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
        <button onClick={load} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-gray-400" size={28} />
          </div>
        ) : error ? (
          <div className="p-6 flex items-start gap-3 text-sm">
            <AlertCircle className="text-red-500 mt-0.5" size={18} />
            <div>
              <p className="text-red-600 font-medium">Lỗi tải dữ liệu</p>
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Route className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-400 text-sm">Không tìm thấy tuyến nào</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">ID</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Điểm đi</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Điểm đến</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Khoảng cách</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Thời gian</th>
                <th className="text-right px-5 py-3 text-gray-500 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r: any) => (
                <tr key={getId(r)} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-400">#{getId(r)}</td>
                  <td className="px-5 py-3 text-gray-800 font-medium">{r.departure}</td>
                  <td className="px-5 py-3 text-gray-800">{r.destination}</td>
                  <td className="px-5 py-3 text-gray-500">{r.distance != null ? `${r.distance} km` : '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{r.duration != null ? `${r.duration}h` : '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/routes/${getId(r)}/edit`)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(getId(r), `${r.departure} → ${r.destination}`)}
                        disabled={deleting === getId(r)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                        title="Xóa"
                      >
                        {deleting === (r.routeId || r.id) ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
