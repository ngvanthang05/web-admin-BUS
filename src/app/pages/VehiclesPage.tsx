import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { vehiclesApi } from '../services/api';
import { useToast } from '../hooks/useToast';
import { Plus, Pencil, Trash2, Search, RefreshCw, AlertCircle, Loader2, Bus } from 'lucide-react';

export function VehiclesPage() {
  const navigate = useNavigate();
  const { showToast, ToastUI } = useToast();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await vehiclesApi.getAll();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number, plate: string) => {
    if (!confirm(`Xóa xe "${plate}"?`)) return;
    setDeleting(id);
    try {
      await vehiclesApi.delete(id);
      setVehicles(v => v.filter(x => (x.vehicleId || x.id) !== id));
      showToast(`Đã xóa xe "${plate}" thành công!`);
    } catch (err: any) {
      showToast('Xóa thất bại: ' + err.message, 'error');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = vehicles.filter(v =>
    `${v.licensePlate} ${v.vehicleType || ''} ${v.brand || ''}`.toLowerCase().includes(search.toLowerCase())
  );



  return (
    <div className="p-6 space-y-5">
      {ToastUI}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800">Quản Lý Xe</h1>
          <p className="text-sm text-gray-500">{vehicles.length} phương tiện trong hệ thống</p>
        </div>
        <button
          onClick={() => navigate('/vehicles/new')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
        >
          <Plus size={16} /> Thêm xe
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo biển số, loại xe..."
            className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
        <button onClick={load} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
          <RefreshCw size={16} />
        </button>
      </div>

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
            <Bus className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-400 text-sm">Không tìm thấy xe nào</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">ID</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Biển số</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Loại xe</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Số ghế</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Trạng thái</th>
                <th className="text-right px-5 py-3 text-gray-500 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((v: any) => {
                const vid = v.vehicleId || v.id;
                return (
                  <tr key={vid} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-400">#{vid}</td>
                    <td className="px-5 py-3 text-gray-800 font-medium">{v.licensePlate}</td>
                    <td className="px-5 py-3 text-gray-600">{({ Sleeper: 'Giường nằm', Limousine: 'Limousine', Express: 'Xe thường', VIP: 'VIP' } as Record<string, string>)[v.vehicleType] ?? v.vehicleType ?? v.brand ?? '—'}</td>
                    <td className="px-5 py-3">
                      {v.seatCount != null ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">{v.seatCount} ghế</span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      {(() => {
                        const s = v.status || 'Active';
                        const map: Record<string, { label: string; cls: string }> = {
                          Active: { label: 'Hoạt động', cls: 'bg-green-50 text-green-600' },
                          Maintenance: { label: 'Bảo dưỡng', cls: 'bg-yellow-50 text-yellow-600' },
                          Inactive: { label: 'Ngừng hoạt động', cls: 'bg-red-50 text-red-500' },
                        };
                        const { label, cls } = map[s] ?? { label: s, cls: 'bg-gray-100 text-gray-500' };
                        return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
                      })()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/vehicles/${vid}/edit`)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(vid, v.licensePlate)}
                          disabled={deleting === vid}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
                        >
                          {deleting === vid ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
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
