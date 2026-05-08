import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { vehiclesApi } from '../services/api';
import { ArrowLeft, Save, Loader2, Armchair } from 'lucide-react';

type SeatType = 'Normal' | 'VIP' | 'Sleeper';

interface SeatConfig {
  seatNumber: string;
  seatType: SeatType;
}

// ─── Layout mặc định theo từng loại xe ──────────────────────────────────────

// Giường nằm 34 ghế: 2 tầng, mỗi tầng 3 cột (trái-giữa-phải), 17 ghế/tầng = 34 ghế
const SLEEPER_FLOOR_1: Array<[string | null, string | null, string | null]> = [
  ['A1', null, 'A3'],
  ['A4', 'A2', 'A6'],
  ['A7', 'A5', 'A9'],
  ['A10', 'A8', 'A12'],
  ['A13', 'A11', 'A14'],
  ['A15', 'A16', 'A17'],
];

const SLEEPER_FLOOR_2: Array<[string | null, string | null, string | null]> = [
  ['B1', null, 'B3'],
  ['B4', 'B2', 'B6'],
  ['B7', 'B5', 'B9'],
  ['B10', 'B8', 'B12'],
  ['B13', 'B11', 'B14'],
  ['B15', 'B16', 'B17'],
];

// Limousine: 1 tầng, 2 cột, 18 ghế (hàng 2+2, ghế rộng)
const LIMOUSINE_ROWS: Array<[string | null, string | null]> = [
  ['A1', 'A2'],
  ['A3', 'A4'],
  ['A5', 'A6'],
  ['A7', 'A8'],
  ['A9', 'A10'],
  ['A11', 'A12'],
  ['A13', 'A14'],
  ['A15', 'A16'],
  ['A17', 'A18'],
];

// Xe thường (Express): 2 tầng
// Mỗi tầng: hàng 1 = 3 ghế xám (A1,A2,A3), hàng 2-6 = 3 ghế/hàng (trái|aisle|phải), hàng cuối = 5 ghế
// Cấu trúc mỗi hàng: [cột trái, cột giữa trái, cột giữa phải] hoặc 5 ghế cuối
// Dùng kiểu: { seats: (string|null)[], bottomRow?: boolean, grayRow?: boolean }
interface ExpressRow {
  seats: (string | null)[];
  //grayRow?: boolean;   // hàng xám (hàng đầu)
  bottomRow?: boolean; // hàng cuối 5 ghế liền
}

const EXPRESS_FLOOR_1: ExpressRow[] = [
  { seats: ['A1', 'A2', 'A3'] },
  { seats: ['A4', 'A5', 'A6'] },
  { seats: ['A7', 'A8', 'A9'] },
  { seats: ['A10', 'A11', 'A12'] },
  { seats: ['A13', 'A14', 'A15'] },
  { seats: ['A16', 'A17', 'A18', 'A19', 'A20'], bottomRow: true },
];

const EXPRESS_FLOOR_2: ExpressRow[] = [
  { seats: ['B1', 'B2', 'B3'] },
  { seats: ['B4', 'B5', 'B6'] },
  { seats: ['B7', 'B8', 'B9'] },
  { seats: ['B10', 'B11', 'B12'] },
  { seats: ['B13', 'B14', 'B15'] },
  { seats: ['B16', 'B17', 'B18', 'B19', 'B20'], bottomRow: true },
];

// VIP: 1 tầng, 3 cột, 24 ghế (hàng 1+2)
const VIP_ROWS: Array<[string | null, string | null, string | null]> = [
  ['A1', null, 'A2'],
  ['A3', null, 'A4'],
  ['A5', 'A6', 'A7'],
  ['A8', 'A9', 'A10'],
  ['A11', 'A12', 'A13'],
  ['A14', 'A15', 'A16'],
  ['A17', 'A18', 'A19'],
  ['A20', 'A21', 'A22'],
];

const SEAT_COUNTS: Record<string, number> = {
  Sleeper: 34,
  Limousine: 18,
  Express: 40,
  VIP: 22,
};

// ─── Component: tầng Sleeper ─────────────────────────────────────────────────
function SleeperFloor({
  label,
  rows,
  showDriver,
}: {
  label: string;
  rows: Array<[string | null, string | null, string | null]>;
  showDriver?: boolean;
}) {
  return (
    <div className="flex-1 border border-gray-200 rounded-2xl bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between mb-3 px-1">
        {showDriver ? (
          <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="3" />
              <path d="M3 12h3M18 12h3M12 3v3M12 18v3" />
            </svg>
          </div>
        ) : (
          <div />
        )}
        <span className="text-sm font-semibold text-gray-600">{label}</span>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {rows.map((row, ri) =>
          row.map((id, ci) => {
            if (!id) return <div key={`${ri}-${ci}`} className="w-full aspect-square" />;
            return (
              <div
                key={`${ri}-${ci}`}
                className="w-full aspect-square rounded-xl border-2 text-xs font-semibold flex items-center justify-center select-none bg-white border-green-400 text-green-700"
              >
                {id}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Component: Limousine (2 cột) ────────────────────────────────────────────
function LimousineLayout({ rows }: { rows: Array<[string | null, string | null]> }) {
  return (
    <div className="border border-gray-200 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-500">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" />
            <path d="M3 12h3M18 12h3M12 3v3M12 18v3" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-gray-600">Limousine</span>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {rows.map((row, ri) =>
          row.map((id, ci) => {
            if (!id) return <div key={`${ri}-${ci}`} className="w-full aspect-square" />;
            return (
              <div key={`${ri}-${ci}`}
                className="w-full aspect-square rounded-xl border-2 text-xs font-semibold flex items-center justify-center select-none bg-white border-purple-400 text-purple-700">
                {id}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Component: một tầng Express ─────────────────────────────────────────────
// 5-column grid: col0=ghế | col1=lối đi | col2=ghế | col3=lối đi | col4=ghế
// Hàng cuối 5 ghế lấp kín → A14 thẳng A18, A15 thẳng A20
function ExpressFloor({
  label,
  rows,
  showDriver,
}: {
  label: string;
  rows: ExpressRow[];
  showDriver?: boolean;
}) {
  const S = 'w-8 h-8 text-[9px] rounded-xl border-2 font-semibold flex items-center justify-center select-none bg-white border-green-400 text-green-700';

  return (
    <div className="min-w-0 flex-1 border border-gray-200 rounded-2xl bg-white p-3 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        {showDriver ? (
          <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="3" />
              <path d="M3 12h3M18 12h3M12 3v3M12 18v3" />
            </svg>
          </div>
        ) : (
          <div />
        )}
        <span className="text-sm font-semibold text-gray-600">{label}</span>
      </div>

      {/* Grid 5 cột cố định — đảm bảo căn thẳng hoàn hảo giữa các hàng */}
      <div
        className="grid gap-y-1.5"
        style={{ gridTemplateColumns: 'repeat(5, 2rem)', columnGap: '0px' }}
      >
        {rows.flatMap((row, ri) => {
          const { seats, bottomRow } = row;

          if (bottomRow) {
            // Hàng cuối: A16 A17 A18 A19 A20 lấp đầy 5 cột
            return seats.map((id, ci) => (
              <div key={`${ri}-${ci}`} className={S}>{id}</div>
            ));
          }

          // Hàng thường: ghế(c0) | [rỗng](c1) | ghế(c2) | [rỗng](c3) | ghế(c4)
          return [
            <div key={`${ri}-0`} className={S}>{seats[0]}</div>,
            <div key={`${ri}-1`} className="w-8 h-8" />,
            <div key={`${ri}-2`} className={S}>{seats[1]}</div>,
            <div key={`${ri}-3`} className="w-8 h-8" />,
            <div key={`${ri}-4`} className={S}>{seats[2]}</div>,
          ];
        })}
      </div>
    </div>
  );
}


// ─── Component: VIP (3 cột, 1+aisle+2) ──────────────────────────────────────
function VIPLayout({ rows }: { rows: Array<[string | null, string | null, string | null]> }) {
  return (
    <div className="border border-gray-200 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-500">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" />
            <path d="M3 12h3M18 12h3M12 3v3M12 18v3" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-gray-600">VIP</span>
      </div>
      <div className="space-y-1.5">
        {rows.map((row, ri) => (
          <div key={ri} className="flex gap-1.5 items-center">
            {/* Cột trái (1 ghế) */}
            {(() => {
              const id = row[0];
              if (!id) return <div className="w-10 h-10" />;
              return (
                <div className="w-10 h-10 rounded-xl border-2 text-xs font-semibold flex items-center justify-center select-none bg-white border-amber-400 text-amber-700">
                  {id}
                </div>
              );
            })()}
            {/* Lối đi */}
            <div className="w-4" />
            {/* Cột phải (2 ghế) */}
            {[1, 2].map(ci => {
              const id = row[ci];
              if (!id) return <div key={ci} className="w-10 h-10" />;
              return (
                <div key={ci} className="w-10 h-10 rounded-xl border-2 text-xs font-semibold flex items-center justify-center select-none bg-white border-amber-400 text-amber-700">
                  {id}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SeatDiagram tổng hợp ────────────────────────────────────────────────────
function SeatDiagram({ vehicleType }: { vehicleType: string }) {
  if (vehicleType === 'Sleeper') {
    return (
      <div className="flex gap-3">
        <SleeperFloor label="Tầng 1" rows={SLEEPER_FLOOR_1} showDriver />
        <SleeperFloor label="Tầng 2" rows={SLEEPER_FLOOR_2} />
      </div>
    );
  }
  if (vehicleType === 'Limousine') {
    return <LimousineLayout rows={LIMOUSINE_ROWS} />;
  }
  if (vehicleType === 'Express') {
    return (
      <div className="flex gap-3">
        <ExpressFloor label="Tầng 1" rows={EXPRESS_FLOOR_1} showDriver />
        <ExpressFloor label="Tầng 2" rows={EXPRESS_FLOOR_2} />
      </div>
    );
  }
  if (vehicleType === 'VIP') {
    return <VIPLayout rows={VIP_ROWS} />;
  }
  return null;
}


export function VehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');

  const [form, setForm] = useState({
    licensePlate: '',
    vehicleType: 'Sleeper',
    brand: '',
    status: 'Active',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      vehiclesApi.getById(Number(id)).then(d => {
        setForm({
          licensePlate: d.licensePlate || '',
          vehicleType: d.vehicleType || 'Sleeper',
          brand: d.brand || '',
          status: d.status || 'Active',
        });
      }).catch(err => setError(err.message)).finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const seatCount = SEAT_COUNTS[form.vehicleType] ?? 40;

    const payload = {
      licensePlate: form.licensePlate,
      vehicleType: form.vehicleType,
      seatCount,
      brand: form.brand,
      status: form.status,
      Seats: [],   // backend tự tạo từ seatCount
      Trips: [],
    };

    try {
      if (isEdit) {
        await vehiclesApi.update(Number(id), { ...payload, vehicleId: Number(id) });
        setSuccess('Cập nhật xe thành công!');
        setTimeout(() => navigate('/vehicles'), 1200);
      } else {
        await vehiclesApi.create(payload);
        setSuccess('Thêm xe thành công!');
        setTimeout(() => navigate('/vehicles'), 1200);
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

  const seatCount = SEAT_COUNTS[form.vehicleType] ?? 40;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/vehicles')} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-gray-800">{isEdit ? 'Chỉnh Sửa Xe' : 'Thêm Xe Mới'}</h1>
          <p className="text-sm text-gray-500">{isEdit ? `Xe #${id}` : 'Thêm phương tiện vào hệ thống'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Biển số xe <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.licensePlate}
                  onChange={e => setForm(f => ({ ...f, licensePlate: e.target.value.toUpperCase() }))}
                  placeholder="VD: 29B-12345"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Thương hiệu</label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                  placeholder="VD: Hyundai, Setra..."
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Loại xe <span className="text-red-500">*</span></label>
                <select
                  value={form.vehicleType}
                  onChange={e => setForm(f => ({ ...f, vehicleType: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <option value="Sleeper">Giường nằm 34 chỗ</option>
                  <option value="Limousine">Limousine 22 chỗ</option>
                  <option value="Express">Xe thường 40 chỗ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Trạng thái</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <option value="Active">Hoạt động</option>
                  <option value="Maintenance">Bảo dưỡng</option>
                  <option value="Inactive">Ngừng hoạt động</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm xe'}
              </button>
              <button type="button" onClick={() => navigate('/vehicles')}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors">
                Hủy
              </button>
            </div>
          </form>
        </div>

        {/* Seat Diagram */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-gray-700 mb-4 flex items-center gap-2">
            <Armchair size={16} /> Sơ đồ ghế ({seatCount} ghế)
          </h3>
          <SeatDiagram vehicleType={form.vehicleType} />
        </div>
      </div>
    </div>
  );
}
