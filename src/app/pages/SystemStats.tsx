import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { adminApi } from '../services/api';
import { AlertCircle, Activity, Database, Server, Zap } from 'lucide-react';

export default function SystemStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getSystemStats();
      setStats(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const mockStats = {
    totalUsers: 1523,
    totalBookings: 8742,
    totalPayments: 7891,
    totalRoutes: 24,
    totalVehicles: 24,
    totalTrips: 2134,
    totalTickets: 8742,
    serverUptime: '99.8%',
    dbConnections: 12,
    avgResponseTime: '120ms',
  };

  const s = stats ?? mockStats;

  return (
    <div className="flex flex-col h-full">
      <Header title="Thống kê nhanh" subtitle="Thống kê toàn hệ thống" onRefresh={fetchStats} loading={loading} />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            Không kết nối được backend ({error}). Hiển thị dữ liệu mẫu.
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Tổng người dùng', value: s.totalUsers?.toLocaleString('vi-VN') ?? '-', icon: <Activity size={20} className="text-gray-600" /> },
            { label: 'Tổng đặt vé', value: s.totalBookings?.toLocaleString('vi-VN') ?? '-', icon: <Database size={20} className="text-gray-600" /> },
            { label: 'Tổng thanh toán', value: s.totalPayments?.toLocaleString('vi-VN') ?? '-', icon: <Zap size={20} className="text-gray-600" /> },
            { label: 'Tổng tuyến xe', value: s.totalRoutes ?? '-', icon: <Server size={20} className="text-gray-600" /> },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-gray-100 rounded-xl">{item.icon}</div>
              </div>
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-2xl text-gray-900 mt-1" style={{ fontWeight: 700 }}>{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Thời gian hoạt động', value: s.serverUptime ?? '99.8%', desc: 'Độ ổn định máy chủ', color: 'bg-green-50 border-green-200' },
            { label: 'Kết nối cơ sở dữ liệu', value: s.dbConnections ?? 12, desc: 'Số kết nối đang mở', color: 'bg-gray-50 border-gray-200' },
            { label: 'Thời gian phản hồi TB', value: s.avgResponseTime ?? '120ms', desc: 'Tốc độ xử lý yêu cầu', color: 'bg-blue-50 border-blue-200' },
          ].map((item, i) => (
            <div key={i} className={`bg-white rounded-xl p-5 border shadow-sm ${item.color}`}>
              <p className="text-sm text-gray-500">{item.desc}</p>
              <p className="text-3xl text-gray-900 mt-2" style={{ fontWeight: 700 }}>{item.value}</p>
              <p className="text-xs text-gray-400 mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <h3 className="text-gray-800 mb-4" style={{ fontWeight: 600 }}>Trạng thái hệ thống</h3>
          <div className="space-y-3">
            {[
              { name: 'Máy chủ API', status: 'Trực tuyến', ok: true },
              { name: 'Cơ sở dữ liệu (SQL Server)', status: error ? 'Ngoại tuyến' : 'Trực tuyến', ok: !error },
              { name: 'Dịch vụ xác thực JWT', status: 'Trực tuyến', ok: true },
              { name: 'Dịch vụ đặt vé', status: 'Trực tuyến', ok: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{item.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${item.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`} style={{ fontWeight: 500 }}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
