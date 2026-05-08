import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { adminApi } from '../services/api';
import { toast } from 'sonner';
import { UserCog, Save, ArrowLeft, Loader2 } from 'lucide-react';

interface StaffFormData {
  name: string;
  phone: string;
  role: string;
  password: string;
}

const ROLES = ['Admin', 'Operations', 'Staff', 'Driver', 'Customer'];

const ROLE_LABELS: Record<string, string> = {
  Admin: 'Quản trị viên',
  Operations: 'Vận hành',
  Staff: 'Nhân viên',
  Driver: 'Tài xế',
  Customer: 'Khách hàng',
};

export default function StaffForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<StaffFormData>({
    name: '',
    phone: '',
    role: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEdit);

  useEffect(() => {
    if (!isEdit || !id) return;
    setFetchingData(true);
    adminApi.getStaffById(Number(id))
      .then(data => {
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          role: data.role || '',
          password: '',
        });
      })
      .catch(e => toast.error('Lỗi tải dữ liệu: ' + e.message))
      .finally(() => setFetchingData(false));
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Vui lòng nhập họ tên'); return; }
    if (!isEdit && !form.password) { toast.error('Vui lòng nhập mật khẩu'); return; }

    setLoading(true);
    try {
      const payload: any = {
        name: form.name,
        phone: form.phone,
        role: form.role,
      };
      if (!isEdit || form.password) payload.password = form.password;

      if (isEdit) {
        await adminApi.updateStaff(Number(id), payload);
        toast.success('Cập nhật nhân viên thành công!');
      } else {
        await adminApi.createStaff(payload);
        toast.success('Tạo nhân viên thành công!');
      }
      navigate('/staff');
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
          onClick={() => navigate('/staff')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
          <UserCog size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
          </h1>
          <p className="text-sm text-gray-500">
            {isEdit ? `Đang sửa nhân viên #${id}` : 'Điền thông tin để tạo nhân viên'}
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
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nguyễn Văn A"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Vai trò */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Vai trò</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          >
            <option value="">-- Chọn vai trò --</option>
            {ROLES.map(r => (
              <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
            ))}
          </select>
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
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/staff')}
            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isEdit ? 'Cập nhật' : 'Tạo nhân viên'}
          </button>
        </div>
      </form>
    </div>
  );
}
