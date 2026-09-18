'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
const NoticeContext = createContext(null);
export function NoticeProvider({ children }) {
  const [notice, setNotice] = useState('');
  const pathname = usePathname();
  useEffect(() => setNotice(''), [pathname]);
  return <NoticeContext.Provider value={{ notice, setNotice }}>{children}</NoticeContext.Provider>;
}
export const useNotice = () => useContext(NoticeContext);
