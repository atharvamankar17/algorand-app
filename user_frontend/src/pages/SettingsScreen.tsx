import AppLayout from '@/components/layout/AppLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Monitor, Tag, User, Shield, ChevronRight } from 'lucide-react';

const SettingsScreen = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

  const menuItems = [
    { icon: Tag, label: 'Manage Categories', onClick: () => navigate('/categories') },
    { icon: User, label: 'Profile', onClick: () => {} },
    { icon: Shield, label: 'Security', onClick: () => {} },
  ];

  return (
    <AppLayout title="Settings" showBack showSettings={false}>
      <div className="px-4 py-4 space-y-6">
        {/* Theme */}
        <section className="space-y-3">
          <h2 className="text-title text-foreground">Appearance</h2>
          <div className="flex gap-2">
            {themeOptions.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex-1 flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-colors ${
                  theme === value ? 'border-primary bg-primary/10' : 'border-border bg-card'
                }`}
              >
                <Icon className={`h-5 w-5 ${theme === value ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-small font-medium ${theme === value ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Menu */}
        <section className="space-y-1">
          {menuItems.map(({ icon: Icon, label, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="w-full flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors text-left"
            >
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-body text-foreground">{label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </section>

        <p className="text-small text-muted-foreground text-center pt-4">
          Campus Wallet v1.0.0
        </p>
      </div>
    </AppLayout>
  );
};

export default SettingsScreen;
