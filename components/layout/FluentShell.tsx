'use client';

import { FluentProvider, SSRProvider } from '@fluentui/react-components';
import { useAppStore } from '@/store/useAppStore';
import { evoquestLightTheme, evoquestDarkTheme } from '@/lib/theme';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface FluentShellProps {
  children: React.ReactNode;
}

// Wrapper client-side que provê o FluentProvider e o layout principal
export function FluentShell({ children }: FluentShellProps) {
  const darkMode = useAppStore((s) => s.darkMode);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);

  return (
    <SSRProvider>
    <FluentProvider theme={darkMode ? evoquestDarkTheme : evoquestLightTheme} className="h-full">
      <div className="flex h-full min-h-screen">
        <Sidebar />
        <div
          className="flex flex-col flex-1 overflow-hidden transition-all duration-300"
          style={{ marginLeft: sidebarCollapsed ? 60 : 240 }}
        >
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </FluentProvider>
    </SSRProvider>
  );
}
