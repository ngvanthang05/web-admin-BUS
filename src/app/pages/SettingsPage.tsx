import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Save, Globe, Bell, Shield, Database, RefreshCw, Check } from 'lucide-react';

interface SettingSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  desc: string;
}

const sections: SettingSection[] = [
  { id: 'general', title: 'Cài đặt chung', icon: <Globe size={18} />, desc: 'Thông tin hệ thống, múi giờ, ngôn ngữ' },
  { id: 'notification', title: 'Thông báo', icon: <Bell size={18} />, desc: 'Cài đặt email, push notification' },
  { id: 'security', title: 'Bảo mật', icon: <Shield size={18} />, desc: 'JWT, session, xác thực 2 lớp' },
  { id: 'database', title: 'Cơ sở dữ liệu', icon: <Database size={18} />, desc: 'Kết nối SQL Server, backup' },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [saved, setSaved] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    systemName: 'Bus Booking System',
    systemVersion: 'v1.0.0',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
    apiBaseUrl: 'http://localhost:5250',
    maxBookingPerUser: '5',
    cancellationHours: '2',
    emailNotification: true,
    smsNotification: false,
    bookingConfirmEmail: true,
    cancelEmail: true,
    jwtExpireHours: '24',
    maxLoginAttempts: '5',
    requireStrongPassword: true,
    sessionTimeout: '60',
    dbConnectionString: 'workstation id=StudentDB_Net8.mssql.somee.com;...',
    backupFrequency: 'daily',
    backupRetentionDays: '30',
  });

  const handleSave = (section: string) => {
    setSaved(section);
    setTimeout(() => setSaved(null), 2000);
  };

  const update = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Cài đặt hệ thống" subtitle="Quản lý cấu hình Portal 1 Admin" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex gap-6 max-w-5xl">
          {/* Sidebar */}
          <div className="w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-gray-50 last:border-0 transition-colors ${
                    activeSection === s.id ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={activeSection === s.id ? 'text-white' : 'text-gray-400'}>{s.icon}</span>
                  <span className="text-sm font-medium">{s.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-5">
            {activeSection === 'general' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                <div>
                  <h3 className="text-gray-800 mb-4" style={{ fontWeight: 600 }}>Cài đặt chung</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { label: 'Tên hệ thống', key: 'systemName', type: 'text' },
                      { label: 'Phiên bản', key: 'systemVersion', type: 'text' },
                      { label: 'API Base URL', key: 'apiBaseUrl', type: 'text' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-sm text-gray-600 mb-1.5">{f.label}</label>
                        <input
                          type={f.type}
                          value={(settings as any)[f.key]}
                          onChange={e => update(f.key, e.target.value)}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1.5">Múi giờ</label>
                      <select value={settings.timezone} onChange={e => update('timezone', e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none">
                        <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1.5">Ngôn ngữ</label>
                      <select value={settings.language} onChange={e => update('language', e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none">
                        <option value="vi">Tiếng Việt</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-5 mt-5 grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1.5">Giới hạn booking/user</label>
                      <input type="number" value={settings.maxBookingPerUser} onChange={e => update('maxBookingPerUser', e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1.5">Hủy trước khởi hành (giờ)</label>
                      <input type="number" value={settings.cancellationHours} onChange={e => update('cancellationHours', e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={() => handleSave('general')} className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
                    {saved === 'general' ? <><Check size={14} /> Đã lưu</> : <><Save size={14} /> Lưu thay đổi</>}
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'notification' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                <h3 className="text-gray-800" style={{ fontWeight: 600 }}>Cài đặt thông báo</h3>
                <div className="space-y-4">
                  {[
                    { key: 'emailNotification', label: 'Gửi email thông báo', desc: 'Bật/tắt chức năng gửi email' },
                    { key: 'smsNotification', label: 'Gửi SMS thông báo', desc: 'Bật/tắt chức năng gửi SMS' },
                    { key: 'bookingConfirmEmail', label: 'Email xác nhận đặt vé', desc: 'Gửi email khi booking thành công' },
                    { key: 'cancelEmail', label: 'Email hủy vé', desc: 'Gửi email khi booking bị hủy' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm text-gray-800 font-medium">{item.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => update(item.key, !(settings as any)[item.key])}
                        className={`relative w-12 h-6 rounded-full transition-colors ${(settings as any)[item.key] ? 'bg-gray-700' : 'bg-gray-200'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${(settings as any)[item.key] ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button onClick={() => handleSave('notification')} className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
                    {saved === 'notification' ? <><Check size={14} /> Đã lưu</> : <><Save size={14} /> Lưu thay đổi</>}
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                <h3 className="text-gray-800" style={{ fontWeight: 600 }}>Cài đặt bảo mật</h3>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">JWT hết hạn (giờ)</label>
                    <input type="number" value={settings.jwtExpireHours} onChange={e => update('jwtExpireHours', e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">Số lần đăng nhập sai tối đa</label>
                    <input type="number" value={settings.maxLoginAttempts} onChange={e => update('maxLoginAttempts', e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">Timeout session (phút)</label>
                    <input type="number" value={settings.sessionTimeout} onChange={e => update('sessionTimeout', e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none" />
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-800 font-medium">Yêu cầu mật khẩu mạnh</p>
                    <p className="text-xs text-gray-500">Tối thiểu 8 ký tự, có số và ký tự đặc biệt</p>
                  </div>
                  <button
                    onClick={() => update('requireStrongPassword', !settings.requireStrongPassword)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${settings.requireStrongPassword ? 'bg-gray-700' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.requireStrongPassword ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <p className="font-medium text-gray-700">JWT Secret Key</p>
                  <p className="text-gray-500 font-mono text-xs break-all">BusBooking@SecretKey#2024$VanThang!XYZ</p>
                  <p className="text-xs text-amber-600">⚠️ Không chia sẻ JWT key với bên ngoài</p>
                </div>
                <div className="flex justify-end">
                  <button onClick={() => handleSave('security')} className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
                    {saved === 'security' ? <><Check size={14} /> Đã lưu</> : <><Save size={14} /> Lưu thay đổi</>}
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'database' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                <h3 className="text-gray-800" style={{ fontWeight: 600 }}>Cơ sở dữ liệu</h3>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Connection String</label>
                  <textarea
                    value={settings.dbConnectionString}
                    onChange={e => update('dbConnectionString', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none font-mono resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">Backup tự động</label>
                    <select value={settings.backupFrequency} onChange={e => update('backupFrequency', e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none">
                      <option value="hourly">Mỗi giờ</option>
                      <option value="daily">Hàng ngày</option>
                      <option value="weekly">Hàng tuần</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">Giữ backup (ngày)</label>
                    <input type="number" value={settings.backupRetentionDays} onChange={e => update('backupRetentionDays', e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none" />
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Trạng thái kết nối</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm text-gray-600">SQL Server — StudentDB_Net8.mssql.somee.com</span>
                  </div>
                  <p className="text-xs text-gray-400">Cập nhật lúc {new Date().toLocaleTimeString('vi-VN')}</p>
                </div>
                <div className="flex items-center justify-between">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    <RefreshCw size={14} /> Kiểm tra kết nối
                  </button>
                  <button onClick={() => handleSave('database')} className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
                    {saved === 'database' ? <><Check size={14} /> Đã lưu</> : <><Save size={14} /> Lưu thay đổi</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
