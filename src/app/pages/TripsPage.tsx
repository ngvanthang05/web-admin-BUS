import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { tripsApi } from '../services/api';
import { useToast } from '../hooks/useToast';
import { Plus, Pencil, Trash2, Search, RefreshCw, AlertCircle, Loader2, CalendarClock } from 'lucide-react';

export function TripsPage() {
  const navigate = useNavigate();
  const { showToast, ToastUI } = useToast();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [cancelling, setCancelling] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await tripsApi.getAll();
      setTrips(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id: number) => {
    if (!confirm('Hủy chuyến xe này?')) return;
    setCancelling(id);
    try {
      await tripsApi.cancel(id);
      setTrips(t => t.map(x => (x.tripId || x.id) === id ? { ...x, status: 'Cancelled' } : x));
      showToast('Đã hủy chuyến xe thành công!');
    } catch (err: any) {
      showToast('Hủy thất bại: ' + err.message, 'error');
    } finally {
      setCancelling(null);
    }
  };

  const filtered = trips.filter(t => {
    const s = search.toLowerCase();
    return `${t.route?.departure || ''} ${t.route?.destination || ''} ${t.status || ''}`.toLowerCase().includes(s);
  });

  const statusLabel: Record<string, string> = {
    Active: 'Hoạt động',
    Departed: 'Đã khởi hành',
    Completed: 'Hoàn thành',
    Cancelled: 'Đã hủy',
  };

  const statusColor: Record<string, string> = {
    Active: 'bg-green-100 text-green-700',
    Departed: 'bg-blue-100 text-blue-700',
    Completed: 'bg-gray-100 text-gray-600',
    Cancelled: 'bg-red-100 text-red-700',
  };

  const fmt = (d: string) => d ? new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
  const fmtMoney = (n: number) => n ? new Intl.NumberFormat('vi-VN').format(n) + '₫' : '—';

  return (
    <div className="p-6 space-y-5">
      {ToastUI}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800">Quản Lý Chuyến</h1>
          <p className="text-sm text-gray-500">{trips.length} chuyến trong hệ thống</p>
        </div>
        <button
          onClick={() => navigate('/trips/new')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
        >
          <Plus size={16} /> Thêm chuyến
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tuyến, trạng thái..."
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
            <CalendarClock className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-400 text-sm">Không tìm thấy chuyến nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">ID</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Tuyến</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Khởi hành</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Đến</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Giá</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Trạng thái</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((t: any) => {
                  const tid = t.tripId || t.id;
                  return (
                    <tr key={tid} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400">#{tid}</td>
                      <td className="px-4 py-3 text-gray-800">
                        <span>{t.route?.departure || '—'}</span>
                        <span className="text-gray-400 mx-1">→</span>
                        <span>{t.route?.destination || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{fmt(t.departureTime)}</td>
                      <td className="px-4 py-3 text-gray-600">{fmt(t.arrivalTime)}</td>
                      <td className="px-4 py-3 text-gray-600">{fmtMoney(t.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[t.status] || 'bg-gray-100 text-gray-600'}`}>
                          {statusLabel[t.status] || t.status || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/trips/${tid}/edit`)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                          >
                            <Pencil size={15} />
                          </button>
                          {t.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleCancel(tid)}
                              disabled={cancelling === tid}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
                              title="Hủy chuyến"
                            >
                              {cancelling === tid ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
