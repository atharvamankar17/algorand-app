import { NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, BarChart3, Settings } from 'lucide-react';

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border z-50">
      <div className="flex items-center justify-around py-1.5">
        {tabs.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-0.5 px-2 py-1 min-w-0"
            >
              <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[11px] leading-tight truncate ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
