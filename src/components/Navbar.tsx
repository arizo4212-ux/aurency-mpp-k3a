import React, { useState } from 'react';
import { 
  Ship, 
  LayoutDashboard, 
  Database, 
  ArrowLeftRight, 
  MapPin, 
  FileText, 
  Bell, 
  LogOut, 
  RefreshCw, 
  Wifi, 
  Shield, 
  CheckCircle2,
  Menu,
  X,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppNotification } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  onSeedData: () => void;
  seeding: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  notifications,
  onOpenNotifications,
  onSeedData,
  seeding,
}) => {
  const { userProfile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Analitik', icon: LayoutDashboard },
    { id: 'master', label: 'Master Data', icon: Database },
    { id: 'transactions', label: 'Transaksi & Manifest', icon: ArrowLeftRight },
    { id: 'tracking', label: 'Histori Pelacakan', icon: MapPin },
    { id: 'reports', label: 'Laporan & Ekspor', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Online Status */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center gap-2.5 focus:outline-none text-left"
            >
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Ship className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  Nusa<span className="text-cyan-400">Vessel</span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-700/50 text-cyan-300">
                    ERP
                  </span>
                </span>
                <p className="text-[10px] text-slate-400 hidden sm:block">Muatan Kapal & Penumpang</p>
              </div>
            </button>

            {/* Cloud Real-Time Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-[11px] text-emerald-300 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Firestore Sync Online (Tanpa Reload)</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right actions: Demo Seeder, Notifications, User & Logout */}
          <div className="flex items-center gap-2.5">
            {/* Quick Seed Button if needed */}
            <button
              onClick={onSeedData}
              disabled={seeding}
              title="Isi database dengan data kapal, jadwal, manifest dan tracking awal"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
              <span className="hidden xl:inline">{seeding ? 'Menyinkronkan...' : 'Refresh Demo Data'}</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white transition"
              title="Notifikasi Otomatis Sistem"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-lg animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User profile capsule */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="text-right">
                <div className="text-xs font-semibold text-white max-w-[130px] truncate">
                  {userProfile?.displayName || 'Petugas Maritim'}
                </div>
                <div className="text-[10px] text-cyan-400 font-mono capitalize">
                  {userProfile?.role?.replace('_', ' ') || 'admin'}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-cyan-900/60 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
                {userProfile?.displayName?.charAt(0) || 'U'}
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Keluar dari akun"
              className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 hover:text-red-100 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 px-2 border-t border-slate-800 space-y-1">
            <div className="px-3 py-2 mb-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">{userProfile?.displayName}</div>
                <div className="text-[10px] text-cyan-400 capitalize">{userProfile?.role?.replace('_', ' ')} • {userProfile?.portLocation}</div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                <Wifi className="w-3 h-3" /> Online
              </div>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}

            <div className="pt-2">
              <button
                onClick={() => {
                  onSeedData();
                  setMobileMenuOpen(false);
                }}
                disabled={seeding}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 text-xs text-slate-300"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
                Muat Ulang Data Demo Pelabuhan
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
