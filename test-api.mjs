import fs from 'fs';

async function test() {
  const token = ""; // We might need to fetch a real token if the API needs one, but wait, the API is running at http://nvthang-bus-api.somee.com
  
  try {
    const r1 = await fetch('http://nvthang-bus-api.somee.com/api/admin/users');
    const users = await r1.json();
    console.log("Users:", users.slice(0, 2));

    const r2 = await fetch('http://nvthang-bus-api.somee.com/api/admin/staff');
    const staff = await r2.json();
    console.log("Staff:", staff.slice(0, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
