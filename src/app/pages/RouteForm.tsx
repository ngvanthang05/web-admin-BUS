import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { routesApi } from '../services/api';
import { ArrowLeft, Save, Loader2, MapPin } from 'lucide-react';

export function RouteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');
  const [form, setForm] = useState({
    departure: '',
    destination: '',
    distance: '',
    duration: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      routesApi.getById(Number(id)).then(d => {
        setForm({
          departure:   d.departure   ?? d.Departure   ?? '',
          destination: d.destination ?? d.Destination ?? '',
          distance:    (d.distance   ?? d.Distance    ?? '')?.toString(),
          duration:    (d.duration   ?? d.Duration    ?? '')?.toString(),
        });
      }).catch(err => setError(err.message)).finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    const payload = {
      departure: form.departure,
      destination: form.destination,
      distance: Number(form.distance) || 0,
      duration: Number(form.duration) || 0,
    };
    try {
      if (isEdit) {
        await routesApi.update(Number(id), { ...payload, routeId: Number(id), busRouteId: Number(id) });
        setSuccess('Cập nhật tuyến thành công!');
        setTimeout(() => navigate('/routes'), 1200);
      } else {
        await routesApi.create(payload);
        setSuccess('Tạo tuyến mới thành công!');
        setTimeout(() => navigate('/routes'), 1200);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <Loader2 className="animate-spin text-gray-400" size={32} />
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/routes')} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-gray-800">{isEdit ? 'Chỉnh Sửa Tuyến' : 'Thêm Tuyến Mới'}</h1>
          <p className="text-sm text-gray-500">{isEdit ? `Tuyến #${id}` : 'Tạo tuyến xe mới trong hệ thống'}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Điểm khởi hành <span className="text-red-500">*</span></label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={form.departure}
                  onChange={e => setForm(f => ({ ...f, departure: e.target.value }))}
                  placeholder="VD: Hà Nội"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Điểm đến <span className="text-red-500">*</span></label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={form.destination}
                  onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                  placeholder="VD: TP. Hồ Chí Minh"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Khoảng cách (km)</label>
              <input
                type="number"
                value={form.distance}
                onChange={e => setForm(f => ({ ...f, distance: e.target.value }))}
                placeholder="VD: 1700"
                min="0"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Thời gian ước tính (giờ)</label>
              <input
                type="number"
                value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                placeholder="VD: 36"
                min="0"
                step="0.5"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo tuyến'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/routes')}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
