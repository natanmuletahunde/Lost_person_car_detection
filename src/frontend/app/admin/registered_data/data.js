// app/admin/data/data.js
export const INITIAL_DATA = [
  { id: 1, brand: 'Toyota Corolla', model: 'Sedan', user: 'Hibrewerk Mossie', status: 'Verified', plate: 'AA 2345', date: '2026-02-05', dateObj: new Date('2026-02-05'), alerts: 2 },
  { id: 2, brand: 'Hyundai Atos', model: 'Hatchback', user: 'John Doe', status: 'Unverified', plate: 'B 9912', date: '2026-02-06', dateObj: new Date('2026-02-06'), alerts: 0 },
  { id: 3, brand: 'Abebe Bikila', model: 'Person', user: 'Admin', status: 'Verified', plate: 'ID-990', date: '2026-02-07', dateObj: new Date('2026-02-07'), alerts: 5 },
  { id: 4, brand: 'Suzuki Swift', model: 'Compact', user: 'User1', status: 'Unverified', plate: 'C 4452', date: '2026-02-07', dateObj: new Date('2026-02-07'), alerts: 1 },
  { id: 5, brand: 'Tesla Model 3', model: 'Sedan', user: 'Alice', status: 'Verified', plate: 'AA 1234', date: '2026-02-01', dateObj: new Date('2026-02-01'), alerts: 0 },
  { id: 6, brand: 'Ford Focus', model: 'Hatchback', user: 'Bob', status: 'Unverified', plate: 'C 7890', date: '2026-01-28', dateObj: new Date('2026-01-28'), alerts: 3 },
];

// Helper to get a record by ID
export const getRecordById = (id) => INITIAL_DATA.find(item => item.id === id);