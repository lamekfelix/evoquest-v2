import type { Metadata } from 'next';
import './globals.css';
import { FluentShell } from '@/components/layout/FluentShell';

export const metadata: Metadata = {
  title: 'EvoQuest v2',
  description: 'Organização pessoal com gamificação RPG',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full">
        <FluentShell>{children}</FluentShell>
      </body>
    </html>
  );
}
