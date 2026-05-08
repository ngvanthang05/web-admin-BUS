import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { tripApi, routeApi, vehicleApi } from '../services/api';
import { ArrowLeft, Save, Loader2, CalendarClock } from 'lucide-react';

export default function TripForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');

  const [form, setForm] = useState({
    routeId: '',
    vehicleId: '',
    departureTime: '',
    arrivalTime: '',
    price: '',
    status: 'Active',
  });

  const [routes, setRoutes] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadSelects = async () => {
      try {
        const [r, v] = await Promise.all([routeApi.getAll(), vehicleApi.getAll()]);
        setRoutes(Array.isArray(r) ? r : []);
        setVehicles(Array.isArray(v) ? v : []);
      } catch {
        // Dùng dữ liệu mẫu nếu backend offline
        setRoutes([
          { routeId: 1, departure: 'Hà Nội', destination: 'TP.HCM' },
          { routeId: 2, departure: 'Đà Nẵng', destination: 'TP.HCM' },
          { routeId: 3, departure: 'Hà Nội', destination: 'Đà Nẵng' },
          { routeId: 4, departure: 'TP.HCM', destination: 'Cần Thơ' },
        ]);
        setVehicles([
          { vehicleId: 1, licensePlate: '29B-12345', vehicleType: 'Sleeper', seatCount: 40 },
          { vehicleId: 2, licensePlate: '51G-67890', vehicleType: 'Limousine', seatCount: 34 },
          { vehicleId: 3, licensePlate: '43A-11111', vehicleType: 'Express', seatCount: 45 },
        ]);
      }
    };
    loadSelects();

    if (isEdit) {
      setLoading(true);
      tripApi.getById(Number(id))
        .then(d => {
          setForm({
            routeId: String(d.routeId || d.route?.routeId || ''),
            vehicleId: String(d.vehicleId || ''),
            departureTime: d.departureTime ? d.departureTime.slice(0, 16) : '',
            arrivalTime: d.arrivalTime ? d.arrivalTime.slice(0, 16) : '',
            price: String(d.price || ''),
            status: d.status || 'Active',
          });
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    // Đảm bảo format ISO 8601 đầy đủ (HH:mm:ss) mà backend ASP.NET yêu cầu
    const toIso = (dt: string) => dt ? (dt.length === 16 ? dt + ':00' : dt) : '';
    // Chỉ gửi FK — backend EF Core tự map, không cần navigation object
    // Nhưng do backend validation yêu cầu Route/Vehicle object, ta phải gửi kèm dummy hoặc object thực
    const selectedRoute = routes.find(r => (r.routeId || r.busRouteId || r.id) == form.routeId);
    const selectedVehicle = vehicles.find(v => (v.vehicleId || v.id) == form.vehicleId);

    // Bỏ qua navigation properties bị lặp (Seats, Trips) để tránh lỗi ASP.NET Core Validation
    const cleanRoute = selectedRoute ? { ...selectedRoute, trips: [], Trips: [] } : null;
    const cleanVehicle = selectedVehicle ? { ...selectedVehicle, seats: [], Seats: [], trips: [], Trips: [] } : null;

    const payload = {
      routeId: Number(form.routeId),
      vehicleId: Number(form.vehicleId),
      departureTime: toIso(form.departureTime),
      arrivalTime: toIso(form.arrivalTime),
      price: Number(form.price),
      status: form.status,
      route: cleanRoute,
      vehicle: cleanVehicle,
    };
    try {
      if (isEdit) {
        await tripApi.update(Number(id), { ...payload, tripId: Number(id) });
        setSuccess('Cập nhật chuyến thành công!');
        setTimeout(() => navigate('/trips'), 1200);
      } else {
        await tripApi.create(payload);
        setSuccess('Tạo chuyến mới thành công!');
        setTimeout(() => navigate('/trips'), 1200);
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
        <button onClick={() => navigate('/trips')} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-gray-800 flex items-center gap-2">
            <CalendarClock size={20} className="text-gray-500" />
            {isEdit ? 'Chỉnh Sửa Chuyến' : 'Tạo Chuyến Mới'}
          </h1>
          <p className="text-sm text-gray-500">{isEdit ? `Chuyến #${id}` : 'Tạo chuyến xe mới trong hệ thống'}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Route */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Tuyến xe <span className="text-red-500">*</span></label>
            <select
              value={form.routeId}
              onChange={e => setForm(f => ({ ...f, routeId: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              required
            >
              <option value="">— Chọn tuyến —</option>
              {routes.map(r => {
                const rid = r.routeId || r.busRouteId || r.id;
                return (
                  <option key={rid} value={rid}>
                    {r.departure || r.Departure} → {r.destination || r.Destination}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Vehicle */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Xe <span className="text-red-500">*</span></label>
            <select
              value={form.vehicleId}
              onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              required
            >
              <option value="">— Chọn xe —</option>
              {vehicles.map(v => {
                const vid = v.vehicleId || v.id;
                return (
                  <option key={vid} value={vid}>
                    {v.licensePlate} — {({ Sleeper: 'Giường nằm', Express: 'Xe thường', Limousine: 'Limousine', VIP: 'VIP' } as Record<string, string>)[v.vehicleType] ?? v.vehicleType} ({v.seatCount} ghế)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Giờ khởi hành <span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                value={form.departureTime}
                onChange={e => setForm(f => ({ ...f, departureTime: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Giờ dự kiến đến</label>
              <input
                type="datetime-local"
                value={form.arrivalTime}
                onChange={e => setForm(f => ({ ...f, arrivalTime: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
          </div>

          {/* Price & Status */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Giá vé (VNĐ) <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="VD: 350000"
                min={0}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Trạng thái</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="Active">Hoạt động</option>
                <option value="Departed">Đã khởi hành</option>
                <option value="Completed">Hoàn thành</option>
                <option value="Cancelled">Đã hủy</option>
              </select>
            </div>
          </div>

          {/* Preview */}
          {form.price && (
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 border border-gray-100">
              <p className="font-medium text-gray-700 mb-2">Xem trước</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Giá vé</span>
                  <span className="font-medium text-gray-800">
                    {new Intl.NumberFormat('vi-VN').format(Number(form.price))}₫
                  </span>
                </div>
                {form.departureTime && (
                  <div className="flex justify-between">
                    <span>Khởi hành</span>
                    <span>{new Date(form.departureTime).toLocaleString('vi-VN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Trạng thái</span>
                  <span className={form.status === 'Active' ? 'text-green-600' : 'text-gray-600'}>
                    {({ Active: 'Hoạt động', Departed: 'Đã khởi hành', Completed: 'Hoàn thành', Cancelled: 'Đã hủy' } as Record<string, string>)[form.status] || form.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors"
              style={{ fontWeight: 500 }}
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo chuyến'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/trips')}
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
