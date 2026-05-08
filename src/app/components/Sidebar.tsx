import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard, Bus, Car, CalendarClock, Ticket, Users, BarChart2,
  Settings, LogOut, Shield, Route, UserCheck,
  Menu, X, TrendingUp, List, FileText, UserCog
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to?: string;
  children?: NavItem[];
}

const navGroups = [
  {
    title: 'TRANG CHỦ',
    items: [
      { label: 'Tổng quan', icon: <LayoutDashboard size={16} />, to: '/dashboard' },
      { label: 'Thống kê nhanh', icon: <TrendingUp size={16} />, to: '/quick-stats' },
    ],
  },
  {
    title: 'QUẢN LÝ',
    items: [
      { label: 'Quản lý tuyến xe', icon: <Route size={16} />, to: '/routes' },
      { label: 'Quản lý xe', icon: <Bus size={16} />, to: '/vehicles' },
      { label: 'Quản lý chuyến', icon: <CalendarClock size={16} />, to: '/trips' },
      { label: 'Quản lý vé', icon: <Ticket size={16} />, to: '/tickets' },
      { label: 'Quản lý nhân viên', icon: <UserCog size={16} />, to: '/staff' },
      { label: 'Quản lý người dùng', icon: <Users size={16} />, to: '/users' },
      { label: 'Báo cáo', icon: <BarChart2 size={16} />, to: '/reports' },
      { label: 'Cài đặt hệ thống', icon: <Settings size={16} />, to: '/settings' },
    ],
  },
  {
    title: 'DANH SÁCH',
    items: [
      { label: 'Danh sách role', icon: <Shield size={16} />, to: '/roles' },
      { label: 'Phân quyền user', icon: <UserCheck size={16} />, to: '/users/permissions' },
    ],
  },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`h-screen flex flex-col bg-gray-900 text-gray-100 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } flex-shrink-0`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
              <Bus size={16} className="text-gray-100" />
            </div>
            <div>
              <div className="text-sm text-white" style={{ fontWeight: 600 }}>Admin Portal</div>
              <div className="text-xs text-gray-400">Bus Booking</div>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed && (
              <div className="px-4 py-1 text-xs text-gray-500 tracking-widest mb-1">
                {group.title}
              </div>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.to + item.label}
                to={item.to!}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-gray-700 text-white border-l-2 border-gray-300'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-gray-700 p-3">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-white">{user?.username?.[0]?.toUpperCase() || 'A'}</span>
              </div>
              <div className="min-w-0">
                <div className="text-sm text-white truncate">{user?.username || 'Admin'}</div>
                <div className="text-xs text-gray-400">{user?.role || 'Admin'}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white transition-colors flex-shrink-0"
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="Đăng xuất"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
