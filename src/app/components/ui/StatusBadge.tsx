import React from 'react';

interface Props {
  status: string;
}

const statusMap: Record<string, { label: string; className: string }> = {
  Active: { label: 'Hoạt động', className: 'bg-green-100 text-green-700' },
  active: { label: 'Hoạt động', className: 'bg-green-100 text-green-700' },
  Inactive: { label: 'Ngừng HĐ', className: 'bg-gray-100 text-gray-600' },
  inactive: { label: 'Ngừng HĐ', className: 'bg-gray-100 text-gray-600' },
  Cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-600' },
  cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-600' },
  Departed: { label: 'Đã khởi hành', className: 'bg-blue-100 text-blue-700' },
  Completed: { label: 'Hoàn thành', className: 'bg-gray-100 text-gray-600' },
  Confirmed: { label: 'Xác nhận', className: 'bg-blue-100 text-blue-700' },
  Pending: { label: 'Chờ xử lý', className: 'bg-yellow-100 text-yellow-700' },
  Paid: { label: 'Đã thanh toán', className: 'bg-green-100 text-green-700' },
  Valid: { label: 'Hợp lệ', className: 'bg-green-100 text-green-700' },
  Used: { label: 'Đã dùng', className: 'bg-gray-100 text-gray-600' },
  Refunded: { label: 'Đã hoàn', className: 'bg-purple-100 text-purple-700' },
  true: { label: 'Kích hoạt', className: 'bg-green-100 text-green-700' },
  false: { label: 'Vô hiệu', className: 'bg-gray-100 text-gray-500' },
};

export function StatusBadge({ status }: Props) {
  const config = statusMap[String(status)] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${config.className}`} style={{ fontWeight: 500 }}>
      {config.label}
    </span>
  );
}
