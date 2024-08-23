'use client'

import { usePathname } from 'next/navigation';
import LandingPage from './LandingPage';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return isHomePage ? <LandingPage /> : children;
}
