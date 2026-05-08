import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import { Header } from '../components/layout/Header';
import { AlertCircle, TrendingUp, DollarSign, CalendarDays, BarChart2 } from 'lucide-react';

const TODAY = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];
const getFrom = (days: number) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - days);
  return formatDate(d);
};

const MOCK_REVENUE = {
  totalRevenue: 985000000,
  totalBookings: 2413,
  averageTicketPrice: 408167,
  revenueByDay: [
    { date: '28/04', revenue: 125000000, bookings: 45 },
    { date: '29/04', revenue: 89000000, bookings: 32 },
    { date: '30/04', revenue: 156000000, bookings: 61 },
    { date: '01/05', revenue: 210000000, bookings: 78 },
    { date: '02/05', revenue: 175000000, bookings: 67 },
    { date: '03/05', revenue: 130000000, bookings: 49 },
    { date: '04/05', revenue: 100000000, bookings: 38 },
  ],
  revenueByRoute: [
    { route: 'HN → HCM', revenue: 420000000, count: 42 },
    { route: 'DN → HCM', revenue: 280000000, count: 35 },
    { route: 'HN → DN', revenue: 196000000, count: 28 },
    { route: 'HCM → CT', revenue: 168000000, count: 56 },
    { route: 'HCM → VT', revenue: 96000000, count: 48 },
  ],
  revenueByPaymentMethod: [
    { method: 'Trực tuyến', revenue: 720000000, count: 1850 },
    { method: 'Tiền mặt', revenue: 265000000, count: 563 },
  ],
};

const MOCK_TRIPS = {
  totalTrips: 187,
  completedTrips: 142,
  cancelledTrips: 7,
  activeTrips: 38,
  tripsByStatus: [
    { status: 'Completed', count: 142 },
    { status: 'Active', count: 38 },
    { status: 'Cancelled', count: 7 },
  ],
  tripsByRoute: [
    { route: 'HN → HCM', count: 42, avgLoad: 87 },
    { route: 'DN → HCM', count: 35, avgLoad: 75 },
    { route: 'HN → DN', count: 28, avgLoad: 81 },
    { route: 'HCM → CT', count: 56, avgLoad: 92 },
    { route: 'HCM → VT', count: 48, avgLoad: 68 },
  ],
  loadByDay: [
    { date: '28/04', avgLoad: 82 },
    { date: '29/04', avgLoad: 68 },
    { date: '30/04', avgLoad: 91 },
    { date: '01/05', avgLoad: 95 },
    { date: '02/05', avgLoad: 88 },
    { date: '03/05', avgLoad: 75 },
    { date: '04/05', avgLoad: 70 },
  ],
};

const fmtMoney = (n: number) => n ? new Intl.NumberFormat('vi-VN').format(n) + '₫' : '0₫';
const fmtM = (n: number) => `${(n / 1000000).toFixed(0)}M`;

type Tab = 'revenue' | 'trips';

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>('revenue');
  const [revenue, setRevenue] = useState<any>(null);
  const [trips, setTrips] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [range, setRange] = useState('7');

  const load = async () => {
    setLoading(true);
    setError('');
    const from = getFrom(Number(range));
    const to = formatDate(TODAY);
    try {
      const [rev, tr] = await Promise.all([
        adminApi.getRevenueReport(from, to),
        adminApi.getTripReport(from, to),
      ]);
      setRevenue(rev);
      setTrips(tr);
    } catch (err: any) {
      setError(err.message);
      setRevenue(MOCK_REVENUE);
      setTrips(MOCK_TRIPS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [range]);

  const rev = revenue ?? MOCK_REVENUE;
  const tr = trips ?? MOCK_TRIPS;

  return (
    <div className="flex flex-col h-full">
      <Header title="Báo cáo hệ thống" subtitle="Dữ liệu thống kê theo kỳ" onRefresh={load} loading={loading} />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            <AlertCircle size={15} className="flex-shrink-0" />
            Backend offline — đang hiển thị dữ liệu mẫu.
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {(['revenue', 'trips'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t === 'revenue' ? '💰 Doanh thu' : '🚌 Chuyến xe'}
              </button>
            ))}
          </div>
          <select
            value={range}
            onChange={e => setRange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none"
          >
            <option value="7">7 ngày qua</option>
            <option value="30">30 ngày qua</option>
            <option value="90">90 ngày qua</option>
          </select>
        </div>

        {tab === 'revenue' && (
          <>
            {/* Revenue KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: <DollarSign size={20} className="text-gray-600" />, label: 'Tổng doanh thu', value: fmtMoney(rev.totalRevenue) },
                { icon: <CalendarDays size={20} className="text-gray-600" />, label: 'Tổng booking', value: (rev.totalBookings || 0).toLocaleString('vi-VN') },
                { icon: <TrendingUp size={20} className="text-gray-600" />, label: 'TB/vé', value: fmtMoney(rev.averageTicketPrice) },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl flex-shrink-0">{item.icon}</div>
                  <div>
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <p className="text-xl text-gray-900 mt-0.5" style={{ fontWeight: 700 }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-gray-800 mb-4" style={{ fontWeight: 600 }}>Doanh thu theo ngày</h3>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={rev.revenueByDay || []}>
                  <defs>
                    <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#374151" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#374151" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={fmtM} />
                  <Tooltip formatter={(v: number, n) => [fmtMoney(v), 'Doanh thu']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#374151" strokeWidth={2} fill="url(#rg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* By Route & Payment Method */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="text-gray-800 mb-4" style={{ fontWeight: 600 }}>Doanh thu theo tuyến</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={rev.revenueByRoute || []} barSize={28} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={fmtM} />
                    <YAxis type="category" dataKey="route" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip formatter={(v: number) => [fmtMoney(v), 'Doanh thu']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="revenue" fill="#374151" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="text-gray-800 mb-4" style={{ fontWeight: 600 }}>Phương thức thanh toán</h3>
                <div className="space-y-4 mt-6">
                  {(rev.revenueByPaymentMethod || []).map((p: any) => {
                    const total = (rev.revenueByPaymentMethod || []).reduce((s: number, x: any) => s + x.revenue, 0);
                    const pct = total > 0 ? Math.round((p.revenue / total) * 100) : 0;
                    return (
                      <div key={p.method}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-gray-600">{p.method}</span>
                          <span className="text-gray-800 font-medium">{fmtMoney(p.revenue)} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-700 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'trips' && (
          <>
            {/* Trip KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Tổng chuyến', value: tr.totalTrips, color: 'text-gray-800' },
                { label: 'Hoàn thành', value: tr.completedTrips, color: 'text-green-700' },
                { label: 'Đang chạy', value: tr.activeTrips, color: 'text-blue-700' },
                { label: 'Đã hủy', value: tr.cancelledTrips, color: 'text-red-600' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className={`text-2xl mt-1 ${item.color}`} style={{ fontWeight: 700 }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Load Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-gray-800 mb-4" style={{ fontWeight: 600 }}>Tỷ lệ lấp đầy trung bình (%)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={tr.loadByDay || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Tỷ lệ lấp đầy']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Line type="monotone" dataKey="avgLoad" stroke="#374151" strokeWidth={2.5} dot={{ r: 4, fill: '#374151' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Trips by route table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-gray-800" style={{ fontWeight: 600 }}>Chi tiết theo tuyến</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Tuyến</th>
                    <th className="text-center px-5 py-3 text-gray-500 font-medium">Số chuyến</th>
                    <th className="text-right px-5 py-3 text-gray-500 font-medium">Tỷ lệ lấp đầy TB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(tr.tripsByRoute || []).map((r: any) => (
                    <tr key={r.route} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-800 font-medium">{r.route}</td>
                      <td className="px-5 py-3 text-center text-gray-600">{r.count}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-600 rounded-full" style={{ width: `${r.avgLoad}%` }} />
                          </div>
                          <span className="text-gray-700 font-medium w-12 text-right">{r.avgLoad}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
