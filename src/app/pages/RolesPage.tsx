import React from 'react';
import { Header } from '../components/layout/Header';
import { Shield, Bus, Users, UserCheck, Ticket, Settings } from 'lucide-react';

const ROLES = [
  {
    name: 'Admin',
    description: 'Quản trị viên hệ thống — toàn quyền truy cập tất cả Portal',
    icon: <Shield size={22} className="text-white" />,
    bg: 'bg-gray-800',
    count: 1,
    portals: ['Portal 1 (Admin)', 'Portal 2 (Operations)', 'Portal 3 (Staff)', 'Portal 4 (Customer)', 'Portal 5 (Driver)'],
    permissions: [
      'Xem Dashboard tổng quan',
      'Quản lý tuyến xe (CRUD)',
      'Quản lý xe & sơ đồ ghế (CRUD)',
      'Quản lý chuyến (CRUD)',
      'Quản lý vé / booking',
      'Quản lý người dùng & phân quyền',
      'Xem báo cáo doanh thu',
      'Cài đặt hệ thống',
      'Quản lý tài xế & nhân viên',
    ],
  },
  {
    name: 'Operations',
    description: 'Nhân viên điều vận — quản lý và theo dõi chuyến xe',
    icon: <Bus size={22} className="text-white" />,
    bg: 'bg-blue-700',
    count: 3,
    portals: ['Portal 2 (Operations)'],
    permissions: [
      'Xem danh sách chuyến',
      'Tạo & cập nhật chuyến xe',
      'Hủy chuyến',
      'Phân công tài xế',
      'Giám sát chuyến real-time',
      'Xem danh sách tài xế',
    ],
  },
  {
    name: 'Staff',
    description: 'Nhân viên bán vé tại quầy — bán vé và check-in hành khách',
    icon: <UserCheck size={22} className="text-white" />,
    bg: 'bg-purple-700',
    count: 5,
    portals: ['Portal 3 (Staff Sales)'],
    permissions: [
      'Xem chuyến hôm nay',
      'Tạo booking tại quầy',
      'Hủy / đổi ghế booking',
      'Check-in hành khách (scan QR)',
      'Xem danh sách hành khách',
      'Thu tiền mặt',
    ],
  },
  {
    name: 'Customer',
    description: 'Khách hàng — đặt vé trực tuyến qua ứng dụng web',
    icon: <Users size={22} className="text-white" />,
    bg: 'bg-green-700',
    count: 1423,
    portals: ['Portal 4 (Customer)'],
    permissions: [
      'Tìm kiếm & đặt vé',
      'Xem lịch sử booking',
      'Hủy vé (trước 2 giờ khởi hành)',
      'Xem vé QR Code',
      'Cập nhật thông tin cá nhân',
    ],
  },
  {
    name: 'Driver',
    description: 'Tài xế — xem lịch trình và check-in hành khách qua mobile',
    icon: <Ticket size={22} className="text-white" />,
    bg: 'bg-amber-600',
    count: 18,
    portals: ['Portal 5 (Driver)'],
    permissions: [
      'Xem lịch chạy xe',
      'Xem danh sách hành khách',
      'Cập nhật trạng thái chuyến',
      'Xem thông tin chuyến chi tiết',
    ],
  },
];

export default function RolesPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Danh sách Role" subtitle="5 vai trò trong hệ thống Bus Booking — 5 Portals" />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Overview */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-gray-800 mb-3" style={{ fontWeight: 600 }}>Tổng quan phân quyền</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 text-gray-500 font-medium">Vai trò</th>
                  <th className="text-center py-2 px-3 text-gray-500 font-medium">P1 Admin</th>
                  <th className="text-center py-2 px-3 text-gray-500 font-medium">P2 Ops</th>
                  <th className="text-center py-2 px-3 text-gray-500 font-medium">P3 Staff</th>
                  <th className="text-center py-2 px-3 text-gray-500 font-medium">P4 Customer</th>
                  <th className="text-center py-2 px-3 text-gray-500 font-medium">P5 Driver</th>
                  <th className="text-center py-2 pl-3 text-gray-500 font-medium">Số tài khoản</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ROLES.map(r => {
                  const has = (portal: string) => r.portals.some(p => p.includes(portal));
                  return (
                    <tr key={r.name} className="hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-md ${r.bg} flex items-center justify-center`}>
                            <span className="text-white text-xs">{r.name[0]}</span>
                          </div>
                          <span className="font-medium text-gray-800">{r.name}</span>
                        </div>
                      </td>
                      {['Admin', 'Operations', 'Staff', 'Customer', 'Driver'].map(p => (
                        <td key={p} className="text-center py-3 px-3">
                          {has(p) || r.name === 'Admin'
                            ? <span className="text-green-600">✓</span>
                            : <span className="text-gray-200">—</span>}
                        </td>
                      ))}
                      <td className="text-center py-3 pl-3 text-gray-700 font-medium">
                        {r.count.toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {ROLES.map(role => (
            <div key={role.name} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className={`${role.bg} px-5 py-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      {role.icon}
                    </div>
                    <div>
                      <div className="text-white font-bold">{role.name}</div>
                      <div className="text-white/70 text-xs">{role.count.toLocaleString('vi-VN')} tài khoản</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-sm text-gray-600">{role.description}</p>

                {/* Portals */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>Cổng truy cập</p>
                  <div className="flex flex-wrap gap-1.5">
                    {role.portals.map(p => (
                      <span key={p} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{p}</span>
                    ))}
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>Quyền hạn</p>
                  <ul className="space-y-1">
                    {role.permissions.map(p => (
                      <li key={p} className="flex items-start gap-1.5 text-xs text-gray-600">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* API Reference */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-gray-800 mb-3 flex items-center gap-2" style={{ fontWeight: 600 }}>
            <Settings size={16} className="text-gray-500" />
            Điểm cuối API phân quyền (JWT Bearer)
          </h3>
          <div className="space-y-2 font-mono text-xs">
            {[
              { policy: 'AdminOnly', roles: 'Admin', endpoints: '/api/admin/*' },
              { policy: 'OperationsOrAdmin', roles: 'Admin, Operations', endpoints: '/api/operations/*' },
              { policy: 'CounterStaff', roles: 'Admin, Staff', endpoints: '/api/staff-sales/*' },
              { policy: 'CustomerOnly', roles: 'Customer', endpoints: '/api/bookings/*' },
              { policy: 'DriverOnly', roles: 'Driver', endpoints: '/api/driver/*' },
            ].map(item => (
              <div key={item.policy} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                <span className="w-44 text-blue-700 flex-shrink-0">[{item.policy}]</span>
                <span className="w-36 text-purple-700 flex-shrink-0">{item.roles}</span>
                <span className="text-gray-600">{item.endpoints}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
