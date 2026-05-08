import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import {
  LayoutDashboard, Bus, Car, CalendarDays, Ticket,
  Users, BarChart3, Settings, ChevronDown, ChevronRight,
  Route, ShieldCheck, LogOut, Menu, X, BusFront
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: { label: string; path: string }[];
}

const navItems: NavItem[] = [
  {
    label: 'Trang chủ',
    icon: <LayoutDashboard size={18} />,
    children: [
      { label: 'Dashboard tổng quan', path: '/' },
      { label: 'Thống kê nhanh', path: '/stats' },
    ],
  },
  {
    label: 'Phân hệ',
    icon: <BusFront size={18} />,
    children: [
      { label: 'Quản lý tuyến xe', path: '/routes' },
      { label: 'Quản lý xe', path: '/vehicles' },
      { label: 'Quản lý chuyến', path: '/trips' },
      { label: 'Quản lý vé', path: '/tickets' },
      { label: 'Quản lý người dùng', path: '/users' },
      { label: 'Báo cáo', path: '/reports' },
      { label: 'Cài đặt hệ thống', path: '/settings' },
    ],
  },
  {
    label: 'Danh sách',
    icon: <BarChart3 size={18} />,
    children: [
      { label: 'Danh sách tuyến', path: '/routes' },
      { label: 'Danh sách xe', path: '/vehicles' },
      { label: 'Danh sách chuyến', path: '/trips' },
      { label: 'Danh sách vé', path: '/tickets' },
      { label: 'Danh sách vai trò', path: '/roles' },
    ],
  },
  {
    label: 'Chức năng',
    icon: <Settings size={18} />,
    children: [
      { label: 'Form tuyến (tạo/sửa)', path: '/routes/new' },
      { label: 'Form xe + sơ đồ ghế', path: '/vehicles/new' },
      { label: 'Báo cáo chi tiết', path: '/reports' },
      { label: 'Phân quyền người dùng', path: '/permissions' },
    ],
  },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Trang chủ': true,
    'Phân hệ': true,
  });
  const location = useLocation();
  const { user, logout } = useAuth();

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      className={`flex flex-col bg-gray-900 text-gray-100 h-screen transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } flex-shrink-0`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="bg-gray-600 rounded-lg p-1.5">
              <BusFront size={20} className="text-white" />
            </div>
            <div>
              <div className="text-sm text-white" style={{ fontWeight: 700 }}>BusAdmin</div>
              <div className="text-xs text-gray-400">Portal 1</div>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <div key={item.label}>
            <button
              onClick={() => toggleGroup(item.label)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                {item.icon}
                {!collapsed && <span className="text-xs tracking-wider uppercase" style={{ fontWeight: 600 }}>{item.label}</span>}
              </div>
              {!collapsed && (
                openGroups[item.label]
                  ? <ChevronDown size={14} />
                  : <ChevronRight size={14} />
              )}
            </button>

            {!collapsed && openGroups[item.label] && item.children && (
              <div className="mt-1 ml-2 space-y-0.5">
                {item.children.map((child) => (
                  <NavLink
                    key={child.path + child.label}
                    to={child.path}
                    className={({ isActive: active }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                        active
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`
                    }
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                    {child.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-gray-700 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm text-white flex-shrink-0">
              {user?.username?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">{user?.username ?? 'Admin'}</div>
              <div className="text-xs text-gray-400">{user?.role ?? 'Admin'}</div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="w-full flex justify-center p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Đăng xuất"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
