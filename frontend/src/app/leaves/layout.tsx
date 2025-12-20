'use client';

import React from 'react';
import './leaves-theme.css';

export const dynamic = 'force-dynamic';

export default function LeavesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
