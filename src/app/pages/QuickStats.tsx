import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';

export function QuickStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const d = await adminApi.getSystemStats();
      setStats(d);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <Loader2 className="animate-spin text-gray-400" size={32} />
    </div>
  );

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
        <AlertCircle className="text-red-500" size={20} />
        <div>
          <p className="text-red-700 font-medium">Lỗi tải thống kê</p>
          <p className="text-red-500 text-sm">{error}</p>
          <button onClick={load} className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <RefreshCw size={14} /> Thử lại
          </button>
        </div>
      </div>
    </div>
  );

  const labelMap: Record<string, string> = {
    totalUsers: 'Tổng người dùng',
    totalCustomers: 'Tổng khách hàng',
    totalStaff: 'Tổng nhân viên',
    totalDrivers: 'Tổng tài xế',
    totalVehicles: 'Tổng phương tiện',
    totalRoutes: 'Tổng tuyến xe',
    totalTrips: 'Tổng chuyến đi',
    totalBookings: 'Tổng đặt vé',
    totalTickets: 'Tổng vé',
    totalRevenue: 'Tổng doanh thu',
    totalPayments: 'Tổng thanh toán',
    bookingsByStatus: 'Đặt vé theo trạng thái',
    tripsByStatus: 'Chuyến đi theo trạng thái',
    serverUptime: 'Thời gian hoạt động',
    dbConnections: 'Kết nối CSDL',
    avgResponseTime: 'Phản hồi TB',
  };

  const formatValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'object') {
      // object dạng { Pending: 3, Confirmed: 5 } → tính tổng
      const entries = Object.entries(value);
      if (entries.length === 0) return '0';
      const total = entries.reduce((sum, [, v]) => sum + (typeof v === 'number' ? v : 0), 0);
      return total.toLocaleString('vi-VN');
    }
    if (key === 'totalRevenue' && typeof value === 'number') {
      return value.toLocaleString('vi-VN') + ' ₫';
    }
    if (typeof value === 'number') return value.toLocaleString('vi-VN');
    return String(value);
  };

  const items = stats ? Object.entries(stats) : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-800">Thống Kê Nhanh</h1>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
        >
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(([key, value]: [string, any]) => (
          <div key={key} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-gray-500 text-xs">
              {labelMap[key] ?? key.replace(/([A-Z])/g, ' $1').trim()}
            </p>
            <p className="text-2xl text-gray-800 mt-1" style={{ fontWeight: 700 }}>
              {formatValue(key, value)}
            </p>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400 text-sm">
            Không có dữ liệu thống kê
          </div>
        )}
      </div>
    </div>
  );
}
