import React from 'react';
import { Bell, Search, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  loading?: boolean;
}

export function Header({ title, subtitle, onRefresh, loading }: HeaderProps) {
  const { user } = useAuth();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
      <div>
        <h1 className="text-gray-900" style={{ fontSize: '1.125rem', fontWeight: 700 }}>{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors ${loading ? 'opacity-50' : ''}`}
            title="Làm mới"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        )}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
          <Search size={14} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="text-sm bg-transparent outline-none text-gray-700 w-40"
          />
        </div>
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm text-white">
            {user?.username?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div>
            <div className="text-sm text-gray-700" style={{ fontWeight: 600 }}>{user?.username ?? 'Admin'}</div>
            <div className="text-xs text-gray-400">{user?.role ?? 'Admin'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
