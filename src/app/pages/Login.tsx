import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { BusFront, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(form.username, form.password);
      login({
        userId: res.userId,
        username: res.username ?? form.username,
        role: res.role,
        token: res.token,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-900 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BusFront size={32} className="text-white" />
            </div>
            <h1 className="text-white text-xl" style={{ fontWeight: 700 }}>Hệ Thống Quản Lý Xe Khách</h1>
            <p className="text-gray-400 text-sm mt-1">Cổng Quản Trị Viên</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
                  placeholder="Nhập tên đăng nhập..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    required
                    className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-lg text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
                    placeholder="Nhập mật khẩu..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-800 hover:bg-gray-700 disabled:opacity-60 text-white py-3 rounded-lg text-sm transition-colors"
                style={{ fontWeight: 600 }}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500" style={{ fontWeight: 600 }}>Thông tin demo:</p>
              <p className="text-xs text-gray-500 mt-1">Backend: <span className="text-gray-700">nvthang-bus-api.somee.com</span></p>
              <p className="text-xs text-gray-500">Role yêu cầu: <span className="text-gray-700">Admin</span></p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Hệ thống đặt vé xe khách © 2026 — NguyenVanThang ASP.NET
        </p>
      </div>
    </div>
  );
}
