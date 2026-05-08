// Test script để chẩn đoán lỗi DELETE API
// Chạy: node test-delete.mjs

const BASE = 'http://nvthang-bus-api.somee.com';

// Đọc token từ args hoặc để trống
const token = process.argv[2] || '';

async function req(path, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  return { status: res.status, ok: res.ok, body: text };
}

async function main() {
  console.log('=== TEST DELETE API ===');
  console.log('Token:', token ? token.substring(0, 30) + '...' : 'NONE (will get 401)');
  console.log('');

  // 1. Login để lấy token
  if (!token) {
    console.log('Thử login...');
    const loginRes = await req('/api/auth/login', 'POST', { username: 'admin', password: 'admin123' });
    console.log('Login status:', loginRes.status, loginRes.body.substring(0, 200));
    console.log('');
    console.log('-> Chạy lại: node test-delete.mjs <YOUR_TOKEN>');
    return;
  }

  // 2. Lấy danh sách staff
  console.log('--- GET /api/admin/staff ---');
  const staffRes = await req('/api/admin/staff');
  console.log('Status:', staffRes.status);
  if (staffRes.ok) {
    const staff = JSON.parse(staffRes.body);
    console.log(`Found ${staff.length} staff. First:`, JSON.stringify(staff[0]));
    
    if (staff.length > 0) {
      const firstId = staff[0].staffId ?? staff[0].id;
      console.log(`\n--- DELETE /api/admin/staff/${firstId} ---`);
      const delRes = await req(`/api/admin/staff/${firstId}`, 'DELETE');
      console.log('Status:', delRes.status);
      console.log('Body:', delRes.body || '(empty)');
    }
  } else {
    console.log('Error:', staffRes.body);
  }

  // 3. Lấy danh sách drivers
  console.log('\n--- GET /api/admin/drivers ---');
  const driversRes = await req('/api/admin/drivers');
  console.log('Status:', driversRes.status);
  if (driversRes.ok) {
    const drivers = JSON.parse(driversRes.body);
    console.log(`Found ${drivers.length} drivers. First:`, JSON.stringify(drivers[0]));
    
    if (drivers.length > 0) {
      const firstId = drivers[0].driverId ?? drivers[0].id;
      console.log(`\n--- DELETE /api/admin/drivers/${firstId} ---`);
      const delRes = await req(`/api/admin/drivers/${firstId}`, 'DELETE');
      console.log('Status:', delRes.status);
      console.log('Body:', delRes.body || '(empty)');
    }
  } else {
    console.log('Error:', driversRes.body);
  }

  // 4. BusRoutes
  console.log('\n--- GET /api/BusRoutes ---');
  const routesRes = await req('/api/BusRoutes');
  console.log('Status:', routesRes.status);
  if (routesRes.ok) {
    const routes = JSON.parse(routesRes.body);
    console.log(`Found ${routes.length} routes. First:`, JSON.stringify(routes[0]));
    
    if (routes.length > 0) {
      const firstId = routes[0].routeId ?? routes[0].busRouteId ?? routes[0].id;
      console.log(`\n--- DELETE /api/BusRoutes/${firstId} ---`);
      const delRes = await req(`/api/BusRoutes/${firstId}`, 'DELETE');
      console.log('Status:', delRes.status);
      console.log('Body:', delRes.body || '(empty)');
    }
  } else {
    console.log('Error:', routesRes.body);
  }

  // 5. Users  
  console.log('\n--- GET /api/admin/users ---');
  const usersRes = await req('/api/admin/users');
  console.log('Status:', usersRes.status);
  if (usersRes.ok) {
    const usersData = JSON.parse(usersRes.body);
    const users = Array.isArray(usersData) ? usersData : usersData?.items ?? usersData?.data ?? [];
    const nonAdmin = users.find(u => (u.Role ?? u.role) !== 'Admin');
    console.log(`Found ${users.length} users. Non-admin:`, JSON.stringify(nonAdmin));
    
    if (nonAdmin) {
      const uid = nonAdmin.UserId ?? nonAdmin.userId ?? nonAdmin.id;
      console.log(`\n--- DELETE /api/admin/users/${uid} ---`);
      const delRes = await req(`/api/admin/users/${uid}`, 'DELETE');
      console.log('Status:', delRes.status);
      console.log('Body:', delRes.body || '(empty)');
    }
  } else {
    console.log('Error:', usersRes.body);
  }
}

main().catch(console.error);
