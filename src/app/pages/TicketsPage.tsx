import React, { useEffect, useState } from 'react';
import { bookingApi } from '../services/api';
import {
  Ticket, Search, RefreshCw, AlertCircle, Loader2,
  CheckCircle2, XCircle, Clock, Eye
} from 'lucide-react';
import { Header } from '../components/layout/Header';

const MOCK_TICKETS = [
  { bookingId: 1001, status: 'Confirmed', bookingDate: '2026-05-04T08:00:00', customerName: 'Nguyễn Văn A', trip: { departure: 'Hà Nội', destination: 'TP.HCM', departureTime: '2026-05-05T20:00:00' }, seat: { seatNumber: '12', seatType: 'Sleeper' }, payment: { amount: 450000, paymentMethod: 'Online', paymentStatus: 'Paid' }, ticketQrCode: 'BUS-001001-TRIP1-SEAT12' },
  { bookingId: 1002, status: 'Confirmed', bookingDate: '2026-05-04T09:15:00', customerName: 'Trần Thị B', trip: { departure: 'Đà Nẵng', destination: 'TP.HCM', departureTime: '2026-05-06T18:00:00' }, seat: { seatNumber: '05', seatType: 'VIP' }, payment: { amount: 280000, paymentMethod: 'Cash', paymentStatus: 'Pending' }, ticketQrCode: 'BUS-001002-TRIP2-SEAT5' },
  { bookingId: 1003, status: 'Cancelled', bookingDate: '2026-05-03T14:00:00', customerName: 'Lê Văn C', trip: { departure: 'TP.HCM', destination: 'Cần Thơ', departureTime: '2026-05-04T07:00:00' }, seat: { seatNumber: '08', seatType: 'Normal' }, payment: { amount: 80000, paymentMethod: 'Online', paymentStatus: 'Refunded' }, ticketQrCode: 'BUS-001003-TRIP3-SEAT8' },
  { bookingId: 1004, status: 'Confirmed', bookingDate: '2026-05-04T10:30:00', customerName: 'Phạm Thị D', trip: { departure: 'Hà Nội', destination: 'Đà Nẵng', departureTime: '2026-05-07T22:00:00' }, seat: { seatNumber: '20', seatType: 'Sleeper' }, payment: { amount: 220000, paymentMethod: 'Online', paymentStatus: 'Paid' }, ticketQrCode: 'BUS-001004-TRIP4-SEAT20' },
  { bookingId: 1005, status: 'Confirmed', bookingDate: '2026-05-04T11:00:00', customerName: 'Hoàng Văn E', trip: { departure: 'TP.HCM', destination: 'Vũng Tàu', departureTime: '2026-05-05T09:00:00' }, seat: { seatNumber: '03', seatType: 'Normal' }, payment: { amount: 60000, paymentMethod: 'Cash', paymentStatus: 'Paid' }, ticketQrCode: 'BUS-001005-TRIP5-SEAT3' },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  Confirmed: { label: 'Đã xác nhận', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 size={12} /> },
  Cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-600', icon: <XCircle size={12} /> },
  Pending: { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-700', icon: <Clock size={12} /> },
};

const paymentStatusLabel: Record<string, string> = {
  Paid: 'Đã thanh toán',
  Pending: 'Chờ thanh toán',
  Refunded: 'Đã hoàn tiền',
};

const paymentMethodLabel: Record<string, string> = {
  Online: 'Trực tuyến',
  Cash: 'Tiền mặt',
};

const paymentStatusColor: Record<string, string> = {
  Paid: 'text-green-600',
  Pending: 'text-amber-600',
  Refunded: 'text-blue-600',
};

const seatTypeLabel: Record<string, string> = {
  Sleeper: 'Giường nằm',
  Limousine: 'Limousine',
  VIP: 'VIP',
  Normal: 'Thường',
};

const fmt = (d: string) => d ? new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtMoney = (n: number) => n ? new Intl.NumberFormat('vi-VN').format(n) + '₫' : '—';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await bookingApi.getAll();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
      setTickets(MOCK_TICKETS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = tickets.filter(t => {
    const s = search.toLowerCase();
    const matchSearch = !s ||
      String(t.bookingId).includes(s) ||
      (t.customerName || '').toLowerCase().includes(s) ||
      (t.trip?.departure || '').toLowerCase().includes(s) ||
      (t.trip?.destination || '').toLowerCase().includes(s) ||
      (t.ticketQrCode || '').toLowerCase().includes(s);
    const matchStatus = !statusFilter || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col h-full">
      <Header title="Quản lý vé" subtitle={`${tickets.length} booking trong hệ thống`} onRefresh={load} loading={loading} />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            <AlertCircle size={15} className="flex-shrink-0" />
            Backend offline — đang hiển thị dữ liệu mẫu.
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tổng vé', value: tickets.length, color: 'bg-gray-50' },
            { label: 'Đã xác nhận', value: tickets.filter(t => t.status === 'Confirmed').length, color: 'bg-green-50' },
            { label: 'Đã hủy', value: tickets.filter(t => t.status === 'Cancelled').length, color: 'bg-red-50' },
            { label: 'Doanh thu', value: tickets.filter(t => t.payment?.paymentStatus === 'Paid').reduce((s, t) => s + (t.payment?.amount || 0), 0), isAmount: true, color: 'bg-blue-50' },
          ].map((item, i) => (
            <div key={i} className={`${item.color} rounded-xl border border-gray-200 p-4 shadow-sm`}>
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-xl text-gray-800 mt-1" style={{ fontWeight: 700 }}>
                {item.isAmount ? fmtMoney(item.value as number) : item.value}
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
              placeholder="Tìm ID, khách hàng, tuyến, QR..."
              className="text-sm outline-none text-gray-700 w-full bg-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Confirmed">Đã xác nhận</option>
            <option value="Cancelled">Đã hủy</option>
            <option value="Pending">Chờ xử lý</option>
          </select>
          <button onClick={load} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading && tickets.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-gray-400" size={28} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Ticket className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-400 text-sm">Không tìm thấy vé nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Mã vé</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Tuyến</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Khởi hành</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Ghế</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Thanh toán</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Trạng thái</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Ngày đặt</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((t: any) => {
                    const sc = statusConfig[t.status] || { label: t.status, color: 'bg-gray-100 text-gray-600', icon: null };
                    return (
                      <tr key={t.bookingId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-gray-700 font-mono" style={{ fontWeight: 600 }}>#{t.bookingId}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-800">{t.trip?.departure || '—'}</span>
                          <span className="text-gray-400 mx-1">→</span>
                          <span className="text-gray-800">{t.trip?.destination || '—'}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{fmt(t.trip?.departureTime)}</td>
                        <td className="px-4 py-3">
                          <span className="text-gray-700" style={{ fontWeight: 500 }}>
                            {t.seat?.seatNumber ? `S${t.seat.seatNumber}` : '—'}
                          </span>
                          {t.seat?.seatType && (
                            <span className="ml-1 text-xs text-gray-400">({seatTypeLabel[t.seat.seatType] || t.seat.seatType})</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <span className="text-gray-800" style={{ fontWeight: 500 }}>{fmtMoney(t.payment?.amount)}</span>
                            <span className={`ml-1.5 text-xs ${paymentStatusColor[t.payment?.paymentStatus] || 'text-gray-400'}`}>
                              {paymentStatusLabel[t.payment?.paymentStatus] || t.payment?.paymentStatus}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">{paymentMethodLabel[t.payment?.paymentMethod] || t.payment?.paymentMethod}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                            {sc.icon}{sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{fmt(t.bookingDate)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelected(t)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400">Hiển thị {filtered.length}/{tickets.length} vé</p>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="bg-gray-900 rounded-t-2xl px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white text-lg" style={{ fontWeight: 700 }}>Vé #{selected.bookingId}</div>
                  <div className="text-gray-400 text-sm">{fmt(selected.bookingDate)}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[selected.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                  {statusConfig[selected.status]?.label || selected.status}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tuyến</span>
                  <span className="text-gray-800 font-medium">{selected.trip?.departure} → {selected.trip?.destination}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Khởi hành</span>
                  <span className="text-gray-700">{fmt(selected.trip?.departureTime)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ghế</span>
                  <span className="text-gray-700">S{selected.seat?.seatNumber} ({seatTypeLabel[selected.seat?.seatType] || selected.seat?.seatType})</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Số tiền</span>
                  <span className="text-gray-800 font-semibold">{fmtMoney(selected.payment?.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phương thức</span>
                  <span className="text-gray-700">{paymentMethodLabel[selected.payment?.paymentMethod] || selected.payment?.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Thanh toán</span>
                  <span className={paymentStatusColor[selected.payment?.paymentStatus] || 'text-gray-700'}>
                    {paymentStatusLabel[selected.payment?.paymentStatus] || selected.payment?.paymentStatus}
                  </span>
                </div>
              </div>
              {selected.ticketQrCode && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">QR Code</p>
                  <p className="text-xs font-mono text-gray-700 break-all">{selected.ticketQrCode}</p>
                </div>
              )}
              <button
                onClick={() => setSelected(null)}
                className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
