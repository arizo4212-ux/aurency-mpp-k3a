import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Compass, 
  Clock, 
  Wind, 
  Waves, 
  Ship, 
  Anchor, 
  Navigation, 
  UserCheck, 
  Filter, 
  CheckCircle2, 
  AlertTriangle,
  X
} from 'lucide-react';
import { TrackingLog, Voyage, Ship as ShipModel } from '../types';
import { addTrackingLog } from '../services/dataService';

interface TrackingViewProps {
  trackingLogs: TrackingLog[];
  voyages: Voyage[];
  ships: ShipModel[];
  isNewLogModalOpenDirect?: boolean;
  onCloseNewLogModalDirect?: () => void;
}

export const TrackingView: React.FC<TrackingViewProps> = ({
  trackingLogs,
  voyages,
  ships,
  isNewLogModalOpenDirect,
  onCloseNewLogModalDirect,
}) => {
  const [selectedVoyageFilter, setSelectedVoyageFilter] = useState('all');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync direct modal trigger from dashboard
  React.useEffect(() => {
    if (isNewLogModalOpenDirect) {
      setIsLogModalOpen(true);
    }
  }, [isNewLogModalOpenDirect]);

  // Form State
  const [voyageId, setVoyageId] = useState(voyages[0]?.id || '');
  const [eventType, setEventType] = useState('Posisi Tengah Laut');
  const [locationName, setLocationName] = useState('Selat Sunda TSS (Traffic Separation Scheme)');
  const [latitude, setLatitude] = useState<number>(-5.8712);
  const [longitude, setLongitude] = useState<number>(105.8521);
  const [speedKnots, setSpeedKnots] = useState<number>(14.5);
  const [weatherCondition, setWeatherCondition] = useState('Cerah Berawan, Angin 10 knot, Gelombang 0.8m');
  const [notes, setNotes] = useState('Kapal melaju stabil, koordinasi dengan VTS Merak & Bakauheni aktif.');
  const [reporterName, setReporterName] = useState('Mualim I Bagus Santoso');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedVoyage = voyages.find(v => v.id === voyageId);
      await addTrackingLog({
        voyageId,
        shipId: selectedVoyage?.shipId,
        eventType,
        locationName,
        latitude: Number(latitude),
        longitude: Number(longitude),
        speedKnots: Number(speedKnots),
        weatherCondition,
        notes,
        reporterName,
      });
      setIsLogModalOpen(false);
      if (onCloseNewLogModalDirect) onCloseNewLogModalDirect();
    } catch (err: any) {
      alert('Gagal menyimpan log pelacakan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = selectedVoyageFilter === 'all'
    ? trackingLogs
    : trackingLogs.filter(l => l.voyageId === selectedVoyageFilter);

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ' • ' +
        d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              AUDIT TRAIL & LOGISTIK
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-cyan-400" />
            Histori Pelacakan Posisi Kapal & Muatan
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kronologi riil pelayaran, checkpoint laut, kondisi cuaca perairan, serta catatan perwira kapal
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={selectedVoyageFilter}
              onChange={(e) => setSelectedVoyageFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 w-full sm:w-auto"
            >
              <option value="all">Semua Pelayaran ({trackingLogs.length} Log)</option>
              {voyages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.voyageNumber} ({v.shipName})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Input Posisi Baru</span>
          </button>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Belum ada histori pelacakan untuk filter ini.</p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-blue-500 before:to-slate-800">
            {filteredLogs.map((log) => {
              const voyage = voyages.find(v => v.id === log.voyageId);
              return (
                <div key={log.id} className="relative group">
                  {/* Timeline Node Dot */}
                  <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/30 transition shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/60">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{log.eventType}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                            {voyage?.voyageNumber || 'Voyage'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 mt-1 flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{log.locationName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-right">
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {formatTimestamp(log.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Metadata: Coordinates, Speed, Weather */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 text-xs">
                      {log.latitude !== undefined && log.longitude !== undefined && (
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Koordinat GPS</span>
                          <span className="font-mono text-cyan-300 font-semibold">
                            {log.latitude.toFixed(4)}°, {log.longitude.toFixed(4)}°
                          </span>
                        </div>
                      )}

                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Kecepatan Kapal</span>
                        <span className="font-mono text-emerald-300 font-bold">
                          {log.speedKnots || 0} Knots ({((log.speedKnots || 0) * 1.852).toFixed(1)} km/h)
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Kondisi Laut & Cuaca</span>
                        <span className="text-amber-300 font-medium truncate block">
                          {log.weatherCondition || 'Normal'}
                        </span>
                      </div>
                    </div>

                    {log.notes && (
                      <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 italic">
                        "{log.notes}"
                      </p>
                    )}

                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-slate-400" />
                        Pelapor: <strong className="text-slate-400">{log.reporterName}</strong>
                      </span>
                      <span>{voyage?.shipName}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: INPUT LOG FORM */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Navigation className="w-5 h-5 text-cyan-400" />
                Catat Posisi & Audit Trail Pelayaran
              </h3>
              <button 
                onClick={() => {
                  setIsLogModalOpen(false);
                  if (onCloseNewLogModalDirect) onCloseNewLogModalDirect();
                }} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Pilih Pelayaran (Voyage)</label>
                <select
                  value={voyageId}
                  onChange={(e) => setVoyageId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  {voyages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.voyageNumber} - {v.shipName} ({v.originPort} ➔ {v.destinationPort})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Peristiwa / Status Log</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="Lepas Tali (Cast Off / Berangkat)">Lepas Tali (Berangkat)</option>
                    <option value="Posisi Tengah Laut">Posisi Tengah Laut</option>
                    <option value="Palka Ditutup & Lashing Selesai">Palka Ditutup & Lashing Selesai</option>
                    <option value="Peringatan Cuaca Buruk / Gelombang">Peringatan Cuaca Buruk / Gelombang</option>
                    <option value="Memasuki Alur Pelabuhan (Approaching)">Memasuki Alur Pelabuhan</option>
                    <option value="Sandar di Dermaga (Docked)">Sandar di Dermaga</option>
                    <option value="Bongkar Muatan Selesai">Bongkar Muatan Selesai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kecepatan Kapal (Knots)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={speedKnots}
                    onChange={(e) => setSpeedKnots(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Lokasi / Checkpoint Laut</label>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="contoh: Alur TSS Selat Sunda - Koordinat Alpha"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Latitude (°)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Longitude (°)</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Kondisi Cuaca Laut & Gelombang</label>
                <input
                  type="text"
                  required
                  value={weatherCondition}
                  onChange={(e) => setWeatherCondition(e.target.value)}
                  placeholder="Cerah, Angin 8 knot, Gelombang 0.5 meter"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Catatan Tambahan Nahkoda / Mualim</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Petugas Pelapor</label>
                <input
                  type="text"
                  required
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogModalOpen(false);
                    if (onCloseNewLogModalDirect) onCloseNewLogModalDirect();
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Log Posisi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
