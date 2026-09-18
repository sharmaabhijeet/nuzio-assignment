import RequireAuth from '../../components/layout/RequireAuth';
import AppHeader from '../../components/layout/AppHeader';
import BottomNavigation from '../../components/layout/BottomNavigation';
export default function AppLayout({ children }) {
  return (
    <RequireAuth>
      <AppHeader />
      {children}
      <BottomNavigation />
    </RequireAuth>
  );
}
