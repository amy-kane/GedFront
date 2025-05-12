// app/admin/layout.js
'use client';

import AdminLayout from '@/components/layouts/AdminLayout';

export default function AdminLayoutWrapper({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}