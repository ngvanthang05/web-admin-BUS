import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { adminApi } from '../services/api';
import { toast } from 'sonner';
import { Truck, Save, ArrowLeft, Loader2 } from 'lucide-react';

interface DriverFormData {
  fullName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseClass: string;
  password: string;
}

const LICENSE_CLASSES = ['B1', 'B2', 'C', 'D', 'E', 'F'];

export default function DriverForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<DriverFormData>({
    fullName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseClass: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;
    // Try fetching by listing all and finding the id (no getDriverById in current API)
    setFetchingData(true);
    adminApi.getDrivers()
      .then((list: any[]) => {
        const found = list.find(d => (d.driverId ?? d.id) === Number(id));
        if (found) {
          setForm({
            fullName: found.fullName || found.name || '',
            email: found.email || '',
            phone: found.phone || '',
            licenseNumber: found.licenseNumber || '',
            licenseClass: found.licenseClass || found.licenseType || '',
            password: '',
          });
        } else {
          toast.error('Không tìm thấy tài xế');
        }
      })
      .catch(e => toast.error('Lỗi tải dữ liệu: ' + e.message))
      .finally(() => setFetchingData(false));
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) { toast.error('Vui lòng nhập họ tên'); return; }
    if (!form.email.trim()) { toast.error('Vui lòng nhập email'); return; }
    if (!isEdit && !form.password) { toast.error('Vui lòng nhập mật khẩu'); return; }

    setLoading(true);
    try {
      const payload: any = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        licenseNumber: form.licenseNumber,
        licenseClass: form.licenseClass,
      };
      if (!isEdit || form.password) payload.password = form.password;

      if (isEdit) {
        await adminApi.updateDriver(Number(id), payload);
        toast.success('Cập nhật tài xế thành công!');
      } else {
        await adminApi.createDriver(payload);
        toast.success('Tạo tài xế thành công!');
      }
      navigate('/drivers');
    } catch (e: any) {
      toast.error('Lỗi: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-400">
        <Loader2 size={28} className="animate-spin mr-2" />
        Đang tải...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/drivers')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
          <Truck size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Chỉnh sửa tài xế' : 'Thêm tài xế mới'}
          </h1>
          <p className="text-sm text-gray-500">
            {isEdit ? `Đang sửa tài xế #${id}` : 'Điền thông tin để tạo tài xế'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        {/* Họ tên */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Nguyễn Văn B"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="driver@company.com"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* Điện thoại */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="0901234567"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* Số bằng lái */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Số bằng lái</label>
            <input
              type="text"
              name="licenseNumber"
              value={form.licenseNumber}
              onChange={handleChange}
              placeholder="079123456789"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Hạng bằng lái</label>
            <select
              name="licenseClass"
              value={form.licenseClass}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            >
              <option value="">-- Chọn hạng --</option>
              {LICENSE_CLASSES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mật khẩu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Mật khẩu {!isEdit && <span className="text-red-500">*</span>}
            {isEdit && <span className="text-xs text-gray-400 ml-1">(để trống nếu không đổi)</span>}
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder={isEdit ? '••••••••' : 'Nhập mật khẩu'}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/drivers')}
            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isEdit ? 'Cập nhật' : 'Tạo tài xế'}
          </button>
        </div>
      </form>
    </div>
  );
}
