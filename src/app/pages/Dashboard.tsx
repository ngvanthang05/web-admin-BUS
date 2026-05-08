import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Header } from '../components/layout/Header';
import { adminApi } from '../services/api';
import {
  Bus, CalendarDays, Users, DollarSign, TrendingUp,
  AlertCircle, Route, Car, BarChart3, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface DashboardData {
  TotalTripsToday: number;
  TotalTripsMonth: number;
  RevenueToday: number;
  RevenueMonth: number;
  TotalCustomers: number;
  TotalVehicles: number;
  TotalDrivers: number;
  TotalStaff: number;
  ActiveTrips: number;
  CancelledTripsMonth: number;
  RevenueLast7Days: { Date: string; Revenue: number; Bookings: number }[];
  TopRoutes: { Departure: string; Destination: string; TripCount: number; TotalRevenue: number }[];
}

const COLORS = ['#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6'];

function StatCard({ icon, label, value, sub, trend }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; trend?: 'up' | 'down';
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex items-start gap-4">
      <div className="p-3 bg-gray-100 rounded-xl flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl text-gray-900 mt-0.5" style={{ fontWeight: 700 }}>{value}</p>
        {sub && (
          <p className={`text-xs mt-1 flex items-center gap-0.5 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
            {trend === 'up' && <ArrowUpRight size={12} />}
            {trend === 'down' && <ArrowDownRight size={12} />}
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function fmtMoney(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getDashboard();
      // Normalize cả camelCase lẫn PascalCase từ API
      const normalized: DashboardData = {
        TotalTripsToday:     res.TotalTripsToday     ?? res.totalTripsToday     ?? 0,
        TotalTripsMonth:     res.TotalTripsMonth     ?? res.totalTripsMonth     ?? 0,
        RevenueToday:        res.RevenueToday        ?? res.revenueToday        ?? 0,
        RevenueMonth:        res.RevenueMonth        ?? res.revenueMonth        ?? 0,
        TotalCustomers:      res.TotalCustomers      ?? res.totalCustomers      ?? 0,
        TotalVehicles:       res.TotalVehicles       ?? res.totalVehicles       ?? 0,
        TotalDrivers:        res.TotalDrivers        ?? res.totalDrivers        ?? 0,
        TotalStaff:          res.TotalStaff          ?? res.totalStaff          ?? 0,
        ActiveTrips:         res.ActiveTrips         ?? res.activeTrips         ?? 0,
        CancelledTripsMonth: res.CancelledTripsMonth ?? res.cancelledTripsMonth ?? 0,
        RevenueLast7Days:    res.RevenueLast7Days    ?? res.revenueLast7Days    ?? [],
        TopRoutes:           res.TopRoutes           ?? res.topRoutes           ?? [],
      };
      setData(normalized);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Mock data khi không có server
  const mockData: DashboardData = {
    TotalTripsToday: 12,
    TotalTripsMonth: 187,
    RevenueToday: 45200000,
    RevenueMonth: 985000000,
    TotalCustomers: 1423,
    TotalVehicles: 24,
    TotalDrivers: 18,
    TotalStaff: 8,
    ActiveTrips: 5,
    CancelledTripsMonth: 7,
    RevenueLast7Days: [
      { Date: '28/04', Revenue: 125000000, Bookings: 45 },
      { Date: '29/04', Revenue: 89000000, Bookings: 32 },
      { Date: '30/04', Revenue: 156000000, Bookings: 61 },
      { Date: '01/05', Revenue: 210000000, Bookings: 78 },
      { Date: '02/05', Revenue: 175000000, Bookings: 67 },
      { Date: '03/05', Revenue: 130000000, Bookings: 49 },
      { Date: '04/05', Revenue: 45200000, Bookings: 18 },
    ],
    TopRoutes: [
      { Departure: 'Hà Nội', Destination: 'TP.HCM', TripCount: 42, TotalRevenue: 420000000 },
      { Departure: 'Đà Nẵng', Destination: 'TP.HCM', TripCount: 35, TotalRevenue: 280000000 },
      { Departure: 'Hà Nội', Destination: 'Đà Nẵng', TripCount: 28, TotalRevenue: 196000000 },
      { Departure: 'TP.HCM', Destination: 'Cần Thơ', TripCount: 56, TotalRevenue: 168000000 },
      { Departure: 'TP.HCM', Destination: 'Vũng Tàu', TripCount: 48, TotalRevenue: 96000000 },
    ],
  };

  const d = data ?? mockData;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard tổng quan"
        subtitle={`Cập nhật lúc ${new Date().toLocaleTimeString('vi-VN')}`}
        onRefresh={fetchData}
        loading={loading}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>Không kết nối được backend ({error}). Đang hiển thị dữ liệu mẫu.</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<DollarSign size={20} className="text-gray-600" />}
            label="Doanh thu hôm nay"
            value={fmtMoney(d.RevenueToday)}
            sub={`Tháng này: ${fmtMoney(d.RevenueMonth).replace('₫', 'đ')}`}
          />
          <StatCard
            icon={<CalendarDays size={20} className="text-gray-600" />}
            label="Chuyến hôm nay"
            value={d.TotalTripsToday.toString()}
            sub={`${d.ActiveTrips} đang chạy · ${d.CancelledTripsMonth} hủy/tháng`}
            trend="up"
          />
          <StatCard
            icon={<Users size={20} className="text-gray-600" />}
            label="Khách hàng"
            value={d.TotalCustomers.toLocaleString('vi-VN')}
            sub={`${d.TotalStaff} nhân viên · ${d.TotalDrivers} tài xế`}
            trend="up"
          />
          <StatCard
            icon={<Bus size={20} className="text-gray-600" />}
            label="Xe & Chuyến/tháng"
            value={`${d.TotalVehicles} xe`}
            sub={`${d.TotalTripsMonth} chuyến tháng này`}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-800" style={{ fontWeight: 600 }}>Doanh thu 7 ngày qua</h3>
                <p className="text-sm text-gray-400 mt-0.5">Doanh thu & lượt đặt</p>
              </div>
              <TrendingUp size={18} className="text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={d.RevenueLast7Days}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#374151" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#374151" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="Date" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` : v.toString()}
                />
                <Tooltip
                  formatter={(v: number, name: string) => [
                    name === 'Revenue' ? fmtMoney(v) : v,
                    name === 'Revenue' ? 'Doanh thu' : 'Lượt đặt',
                  ]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
                />
                <Area type="monotone" dataKey="Revenue" stroke="#374151" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Booking Chart */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-800" style={{ fontWeight: 600 }}>Lượt đặt/ngày</h3>
                <p className="text-sm text-gray-400 mt-0.5">7 ngày qua</p>
              </div>
              <BarChart3 size={18} className="text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={d.RevenueLast7Days} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="Date" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: number) => [v, 'Lượt đặt']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
                />
                <Bar dataKey="Bookings" fill="#374151" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Routes Table */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Route size={18} className="text-gray-500" />
              <h3 className="text-gray-800" style={{ fontWeight: 600 }}>Top tuyến theo doanh thu tháng</h3>
            </div>
            <div className="space-y-3">
              {d.TopRoutes.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600" style={{ fontWeight: 600 }}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{r.Departure} → {r.Destination}</p>
                      <p className="text-xs text-gray-400">{r.TripCount} chuyến</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>
                    {(r.TotalRevenue / 1000000).toFixed(0)}M đ
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-gray-500" />
              <h3 className="text-gray-800" style={{ fontWeight: 600 }}>Phân bổ doanh thu tuyến</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={d.TopRoutes}
                  dataKey="TotalRevenue"
                  nameKey="Departure"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={40}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {d.TopRoutes.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [fmtMoney(v), 'Doanh thu']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tổng chuyến tháng', value: d.TotalTripsMonth, icon: <CalendarDays size={16} className="text-gray-500" /> },
            { label: 'Xe hoạt động', value: d.TotalVehicles, icon: <Car size={16} className="text-gray-500" /> },
            { label: 'Tài xế hoạt động', value: d.TotalDrivers, icon: <Users size={16} className="text-gray-500" /> },
            { label: 'Nhân viên', value: d.TotalStaff, icon: <Users size={16} className="text-gray-500" /> },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">{item.icon}</div>
              <div>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-lg text-gray-800 mt-0.5" style={{ fontWeight: 700 }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
