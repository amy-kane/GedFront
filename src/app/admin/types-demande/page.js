// app/admin/types-demande/page.js
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Import dynamique pour éviter les problèmes de rendu côté serveur
const TypesDemandeManagement = dynamic(
  () => import('@/components/admin/types-demande/TypesDemandeManagement'),
  { ssr: false }
);

export default function TypesDemandePage() {
  return <TypesDemandeManagement />;
}