'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Button, Text, Tooltip, Divider,
  makeStyles, tokens,
} from '@fluentui/react-components';
import {
  HomeRegular, HomeFilled,
  CalendarRegular, CalendarFilled,
  NoteRegular, NoteFilled,
  TargetArrowRegular,
  FolderRegular,
  BookRegular,
  ArchiveRegular,
  CheckmarkCircleRegular,
  TrophyRegular,
  PersonRunningRegular,
  FoodRegular,
  WalletRegular,
  PersonRegular,
  DataBarVerticalRegular,
  SettingsRegular,
  NavigationRegular,
  ChevronDoubleLeftRegular,
  PeopleRegular,
  PeopleFilled,
  BoxRegular,
  BoxFilled,
  ReceiptRegular,
  ReceiptFilled,
  ArrowTrendingDownRegular,
  ArrowTrendingDownFilled,
} from '@fluentui/react-icons';
import { useAppStore } from '@/store/useAppStore';
import { getLevelFromXp } from '@/lib/xp';
import { calcTotalXp } from '@/lib/xp';

const useStyles = makeStyles({
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
    transition: 'width 0.3s ease',
    zIndex: 100,
  },
  logo: {
    padding: '16px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minHeight: '60px',
  },
  logoIcon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  section: {
    padding: '8px 8px 4px',
  },
  sectionLabel: {
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: tokens.colorNeutralForeground2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 8px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  navItemActive: {
    backgroundColor: tokens.colorBrandBackground,
    ':hover': {
      backgroundColor: tokens.colorBrandBackgroundHover,
    },
  },
  navLabel: {
    overflow: 'hidden',
    fontSize: '14px',
  },
  footer: {
    marginTop: 'auto',
    padding: '12px 8px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
});

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactElement;
  iconActive: React.ReactElement;
  exact?: boolean;
}

const principalNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <HomeRegular />, iconActive: <HomeFilled /> },
  { href: '/agenda', label: 'Agenda', icon: <CalendarRegular />, iconActive: <CalendarFilled /> },
  { href: '/journal', label: 'Diário', icon: <NoteRegular />, iconActive: <NoteFilled /> },
];

const sistemaNav: NavItem[] = [
  { href: '/projects', label: 'Projetos', icon: <TargetArrowRegular />, iconActive: <TargetArrowRegular /> },
  { href: '/areas', label: 'Áreas', icon: <FolderRegular />, iconActive: <FolderRegular /> },
  { href: '/resources', label: 'Resources', icon: <BookRegular />, iconActive: <BookRegular /> },
  { href: '/archives', label: 'Archives', icon: <ArchiveRegular />, iconActive: <ArchiveRegular /> },
];

const habitsNav: NavItem[] = [
  { href: '/habits', label: 'Hábitos', icon: <CheckmarkCircleRegular />, iconActive: <CheckmarkCircleRegular /> },
  { href: '/quests', label: 'Quests', icon: <TrophyRegular />, iconActive: <TrophyRegular /> },
];

const corpoNav: NavItem[] = [
  { href: '/workout', label: 'Treino', icon: <PersonRunningRegular />, iconActive: <PersonRunningRegular /> },
  { href: '/diet', label: 'Dieta', icon: <FoodRegular />, iconActive: <FoodRegular /> },
];

const financasNav: NavItem[] = [
  { href: '/finances', label: 'Dashboard Financeiro', icon: <WalletRegular />, iconActive: <WalletRegular />, exact: true },
  { href: '/finances/clients', label: 'Clientes', icon: <PeopleRegular />, iconActive: <PeopleFilled /> },
  { href: '/finances/products', label: 'Produtos & Serviços', icon: <BoxRegular />, iconActive: <BoxFilled /> },
  { href: '/finances/invoices', label: 'Faturas', icon: <ReceiptRegular />, iconActive: <ReceiptFilled /> },
  { href: '/finances/expenses', label: 'Despesas', icon: <ArrowTrendingDownRegular />, iconActive: <ArrowTrendingDownFilled /> },
];

const rpgNav: NavItem[] = [
  { href: '/character', label: 'Personagem', icon: <PersonRegular />, iconActive: <PersonRegular /> },
  { href: '/charts', label: 'Evolução', icon: <DataBarVerticalRegular />, iconActive: <DataBarVerticalRegular /> },
  { href: '/profile', label: 'Perfil', icon: <SettingsRegular />, iconActive: <SettingsRegular /> },
];

export function Sidebar() {
  const styles = useStyles();
  const pathname = usePathname();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const user = useAppStore((s) => s.user);
  const attrXp = useAppStore((s) => s.attrXp);

  const totalXp = calcTotalXp(attrXp);
  const { level } = getLevelFromXp(totalXp);

  function NavLink({ item }: { item: NavItem }) {
    const isActive = item.exact ? pathname === item.href : (pathname === item.href || pathname.startsWith(item.href + '/'));
    const content = (
      <Link
        href={item.href}
        className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
      >
        <span style={{ fontSize: 18, flexShrink: 0, color: isActive ? '#fff' : tokens.colorNeutralForeground1 }}>
          {isActive ? item.iconActive : item.icon}
        </span>
        {!collapsed && (
          <Text
            className={styles.navLabel}
            style={{ color: isActive ? '#fff' : tokens.colorNeutralForeground1, fontWeight: isActive ? 600 : 400 }}
          >
            {item.label}
          </Text>
        )}
      </Link>
    );

    if (collapsed) {
      return <Tooltip content={item.label} relationship="label" positioning="after">{content}</Tooltip>;
    }
    return content;
  }

  function NavSection({ label, items }: { label: string; items: NavItem[] }) {
    return (
      <div className={styles.section}>
        {!collapsed && <div className={styles.sectionLabel}>{label}</div>}
        {collapsed && <Divider style={{ margin: '4px 0' }} />}
        {items.map((item) => <NavLink key={item.href} item={item} />)}
      </div>
    );
  }

  return (
    <nav className={styles.sidebar} style={{ width: collapsed ? 60 : 240 }}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoIcon}>⚔️</span>
        {!collapsed && (
          <Text size={400} weight="semibold" style={{ color: tokens.colorBrandBackground }}>
            EvoQuest
          </Text>
        )}
      </div>

      {/* Usuário resumido */}
      {!collapsed && user && (
        <div style={{ padding: '0 12px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: tokens.colorBrandBackground,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0,
          }}>
            {user.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <Text size={200} weight="semibold" truncate block>{user.name}</Text>
            <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>Nv. {level} · {user.class}</Text>
          </div>
        </div>
      )}

      {/* Navegação */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <NavSection label="Principal" items={principalNav} />
        <NavSection label="Sistema Para" items={sistemaNav} />
        <NavSection label="Hábitos & Quests" items={habitsNav} />
        <NavSection label="Corpo" items={corpoNav} />
        <NavSection label="Finanças" items={financasNav} />
        <NavSection label="RPG" items={rpgNav} />
      </div>

      {/* Botão colapsar */}
      <div className={styles.footer}>
        <Tooltip content={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'} relationship="label" positioning="after">
          <Button
            appearance="subtle"
            icon={collapsed ? <NavigationRegular /> : <ChevronDoubleLeftRegular />}
            onClick={toggleSidebar}
            style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            {!collapsed && <Text size={200}>Colapsar</Text>}
          </Button>
        </Tooltip>
      </div>
    </nav>
  );
}
