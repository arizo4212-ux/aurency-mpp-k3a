import React from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  CheckCircle2, 
  Clock, 
  Ship
} from 'lucide-react';
import { AppNotification } from '../types';
import { markNotificationAsRead, markAllNotificationsAsRead } from '../services/dataService';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
}) => {
  if (!isOpen) return null;

  const unreadList = notifications.filter(n => !n.isRead);

  const getIcon = (type: string) => {
    switch (type) {
      case 'danger':
        return <AlertOctagon className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getBorderColor = (type: string, isRead: boolean) => {
    if (isRead) return 'border-slate-800 bg-slate-950/40 text-slate-400';
    switch (type) {
      case 'danger':
        return 'border-red-600/40 bg-red-950/30 text-red-200';
      case 'warning':
        return 'border-amber-600/40 bg-amber-950/30 text-amber-200';
      case 'success':
        return 'border-emerald-600/40 bg-emerald-950/30 text-emerald-200';
      default:
        return 'border-cyan-600/40 bg-cyan-950/30 text-cyan-200';
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Notifikasi Otomatis
                {unreadList.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
                    {unreadList.length} Baru
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400">Peringatan operasional & keselamatan pelayaran</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadList.length > 0 && (
              <button
                onClick={() => markAllNotificationsAsRead(notifications)}
                className="p-1.5 rounded text-xs text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 flex items-center gap-1"
                title="Tandai semua telah dibaca"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="text-[10px]">Semua Dibaca</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-xs">Belum ada notifikasi operasional.</p>
              <p className="text-[10px] text-slate-600 mt-1">Notifikasi akan otomatis muncul ketika ada kargo berbahaya, kapal berlayar, atau kapasitas penuh.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const borderStyle = getBorderColor(notif.type, notif.isRead);
              return (
                <div
                  key={notif.id}
                  onClick={() => !notif.isRead && markNotificationAsRead(notif.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer relative ${borderStyle} hover:brightness-110`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-semibold ${notif.isRead ? 'text-slate-300' : 'text-white'}`}>
                          {notif.title}
                        </span>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] mt-1 text-slate-300 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {formatTimestamp(notif.createdAt)}
                        </span>
                        {notif.voyageId && (
                          <span className="text-cyan-400 flex items-center gap-1">
                            <Ship className="w-2.5 h-2.5" /> ID Pelayaran
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-center text-[10px] text-slate-500">
          Sinkronisasi realtime via Cloud Firestore • Tidak perlu refresh
        </div>
      </div>
    </div>
  );
};
