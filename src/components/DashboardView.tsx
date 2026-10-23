import React, { useState } from 'react';
import { 
  Ship, 
  Users, 
  Boxes, 
  Coins, 
  TrendingUp, 
  Compass, 
  Navigation, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  MapPin, 
  Wind, 
  Waves, 
  Flame, 
  PlusCircle, 
  Eye, 
  AlertTriangle,
  Truck
} from 'lucide-react';
import { Ship as ShipModel, Voyage, Passenger, Cargo, TrackingLog, Route as RouteModel } from '../types';

interface DashboardViewProps {
  ships: ShipModel[];
  routes: RouteModel[];
  voyages: Voyage[];
  passengers: Passenger[];
  cargoList: Cargo[];
  trackingLogs: TrackingLog[];
  onNavigate: (tab: string) => void;
  onOpenNewPassengerModal: () => void;
  onOpenNewCargoModal: () => void;
  onOpenNewLogModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  ships,
  routes,
  voyages,
  passengers,
  cargoList,
  trackingLogs,
  onNavigate,
  onOpenNewPassengerModal,
  onOpenNewCargoModal,
  onOpenNewLogModal,
}) => {
  const [selectedVoyageFilter, setSelectedVoyageFilter] = useState<string>('all');

  // KPI Calculations
  const activeShipsCount = ships.filter(s => s.status === 'sailing' || s.status === 'active').length;
  const sailingShipsCount = ships.filter(s => s.status === 'sailing').length;

  const totalPassengers = passengers.length;
  const boardedPassengers = passengers.filter(p => p.bookingStatus === 'boarded').length;

  const totalCargoTons = cargoList.reduce((acc, c) => acc + (Number(c.weightTons) || 0), 0);
  const totalVehicles = cargoList.filter(c => c.cargoType === 'vehicle').length;
  const dangerousGoodsCount = cargoList.filter(c => c.isDangerousGoods).length;

  const totalRevenue = 
    passengers.reduce((acc, p) => acc + (Number(p.ticketPrice) || 0), 0) +
    cargoList.reduce((acc, c) => acc + (Number(c.fee) || 0), 0);

  const activeVoyages = voyages.filter(v => v.status === 'sailing' || v.status === 'boarding');

  const filteredVoyages = selectedVoyageFilter === 'all'
    ? voyages
    : voyages.filter(v => v.id === selectedVoyageFilter);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/70 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              OPERATIONAL COMMAND CENTER
            </span>
            <span className="text-xs text-slate-400">
              • Pemantauan Real-Time 24/7
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Dashboard Performa Operasional Maritim
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Sistem terhubung langsung ke Cloud Firestore. Manifest penumpang, stabilitas muatan tonase kargo, dan histori pelayaran disinkronkan secara otomatis tanpa reload halaman.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={onOpenNewPassengerModal}
            className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-600/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Tiket Penumpang</span>
          </button>

          <button
            onClick={onOpenNewCargoModal}
            className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition"
          >
            <Boxes className="w-4 h-4" />
            <span>+ Muatan Kargo / Truk</span>
          </button>

          <button
            onClick={onOpenNewLogModal}
            className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>+ Update Posisi Kapal</span>
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ships */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Armada Kapal Aktif</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Ship className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{activeShipsCount}</span>
            <span className="text-xs text-slate-400">/ {ships.length} Kapal Total</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {sailingShipsCount} Sedang Berlayar
            </span>
            <button onClick={() => onNavigate('master')} className="text-cyan-400 hover:underline flex items-center">
              Lihat Armada <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Passengers */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Manifest Penumpang</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalPassengers}</span>
            <span className="text-xs text-slate-400">Tiket Terdaftar</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-medium">
              {boardedPassengers} Naik Kapal (Boarded)
            </span>
            <button onClick={() => onNavigate('transactions')} className="text-emerald-400 hover:underline flex items-center">
              Manifest Pax <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Card 3: Cargo & Vehicles */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Muatan Kargo & Truk</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalCargoTons.toFixed(1)}</span>
            <span className="text-xs text-slate-400">Ton Terangkut</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-indigo-300 font-medium flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              {totalVehicles} Unit Kendaraan
            </span>
            {dangerousGoodsCount > 0 ? (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Flame className="w-3 h-3" /> {dangerousGoodsCount} DG
              </span>
            ) : (
              <span className="text-slate-500">0 DG Alert</span>
            )}
          </div>
        </div>

        {/* Card 4: Operational Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pendapatan Tiket & Kargo</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{formatIDR(totalRevenue)}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-amber-300 font-medium">Tiket + Manifest Fee</span>
            <button onClick={() => onNavigate('reports')} className="text-amber-400 hover:underline flex items-center">
              Laporan Kas <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Operational Monitor: Active Voyages with Safety & Stability Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Live Voyages Monitor */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                Monitor Utilisasi Kapasitas & Stabilitas Beban Pelayaran
              </h2>
              <p className="text-xs text-slate-400">
                Kalkulasi otomatis beban penumpang vs batas tonase kargo & stabilitas kapal
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter:</span>
              <select
                value={selectedVoyageFilter}
                onChange={(e) => setSelectedVoyageFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">Semua Jadwal ({voyages.length})</option>
                {voyages.map(v => (
                  <option key={v.id} value={v.id}>{v.voyageNumber} - {v.shipName}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredVoyages.length === 0 ? (
            <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
              <Ship className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">Belum ada jadwal pelayaran aktif.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVoyages.map((voyage) => {
                const ship = ships.find(s => s.id === voyage.shipId);
                const maxPax = ship?.maxPassengers || 500;
                const maxCargo = ship?.maxCargoTons || 1000;
                const maxVehicles = ship?.maxVehicles || 100;

                const paxPercent = Math.min(100, Math.round(((voyage.currentPassengers || 0) / maxPax) * 100));
                const cargoPercent = Math.min(100, Math.round(((voyage.currentCargoTons || 0) / maxCargo) * 100));

                const isOverloaded = cargoPercent >= 95 || paxPercent >= 95;
                const isWarning = (cargoPercent >= 85 || paxPercent >= 85) && !isOverloaded;

                return (
                  <div
                    key={voyage.id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/60">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{voyage.shipName}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-800/50 text-cyan-300">
                            {voyage.voyageNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            voyage.status === 'sailing'
                              ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700/50'
                              : voyage.status === 'boarding'
                              ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {voyage.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{voyage.originPort}</span>
                          <span className="text-slate-600">➔</span>
                          <span>{voyage.destinationPort}</span>
                        </div>
                      </div>

                      {/* Safety Status Pill */}
                      <div className="flex items-center gap-2">
                        {isOverloaded ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-700/60 text-red-300 text-xs font-bold animate-pulse">
                            <ShieldAlert className="w-4 h-4 text-red-400" />
                            <span>OVERLOAD RISK!</span>
                          </div>
                        ) : isWarning ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-700/60 text-amber-300 text-xs font-semibold">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            <span>Kapasitas Padat</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-xs font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Stabilitas Aman</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress bars: Pax & Cargo */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      {/* Passenger Load */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-cyan-400" />
                            Beban Penumpang
                          </span>
                          <span className="font-mono font-semibold text-white">
                            {voyage.currentPassengers || 0} / {maxPax} Pax ({paxPercent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              paxPercent >= 95 ? 'bg-red-500' : paxPercent >= 80 ? 'bg-amber-400' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${paxPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Cargo Ton Load */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Boxes className="w-3.5 h-3.5 text-indigo-400" />
                            Beban Kargo Tonase
                          </span>
                          <span className="font-mono font-semibold text-white">
                            {voyage.currentCargoTons || 0} / {maxCargo} Ton ({cargoPercent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              cargoPercent >= 95 ? 'bg-red-500' : cargoPercent >= 80 ? 'bg-amber-400' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${cargoPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                      <span>Kendaraan: {voyage.currentVehicles || 0} / {maxVehicles} unit</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        Jadwal: {new Date(voyage.departureTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Column: Real-Time Maritime Radar & GPS Tracking */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-cyan-400" />
              Radar Pelayaran Laut
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
              AIS SIMULASI
            </span>
          </div>

          {/* Interactive Radar Graphic */}
          <div className="relative w-full aspect-square rounded-2xl bg-slate-950 border border-cyan-900/40 flex items-center justify-center overflow-hidden mb-4 shadow-inner">
            {/* Concentric distance rings */}
            <div className="absolute w-[85%] h-[85%] rounded-full border border-cyan-500/10" />
            <div className="absolute w-[60%] h-[60%] rounded-full border border-cyan-500/15" />
            <div className="absolute w-[35%] h-[35%] rounded-full border border-cyan-500/20" />
            <div className="absolute w-full h-[1px] bg-cyan-500/15" />
            <div className="absolute h-full w-[1px] bg-cyan-500/15" />

            {/* Sweep radar line */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-transparent animate-spin origin-center duration-1000" />

            {/* Simulated Vessel Blips */}
            <div className="absolute top-[35%] left-[45%] flex flex-col items-center">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <span className="text-[9px] font-bold text-cyan-300 bg-slate-950/80 px-1 rounded mt-0.5 border border-cyan-500/30">
                DR VII (14.8 kt)
              </span>
            </div>

            <div className="absolute bottom-[28%] right-[30%] flex flex-col items-center">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] font-bold text-emerald-300 bg-slate-950/80 px-1 rounded mt-0.5 border border-emerald-500/30">
                Kelimutu (Gate 2)
              </span>
            </div>

            <div className="absolute bottom-2 left-2 text-[10px] text-slate-500 font-mono">
              LAT: -5.8712° | LON: 105.8521°
            </div>
            <div className="absolute top-2 right-2 text-[10px] text-cyan-400 font-mono">
              Selat Sunda TSS
            </div>
          </div>

          {/* Latest Tracking Log */}
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>Posisi & Log Terkini</span>
              <button onClick={() => onNavigate('tracking')} className="text-cyan-400 hover:underline">
                Histori Lengkap ➔
              </button>
            </div>

            {trackingLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold text-white truncate max-w-[170px]">{log.eventType}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">{log.speedKnots || 0} Knots</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">{log.locationName}</div>
                {log.weatherCondition && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-300">
                    <Waves className="w-3 h-3 text-amber-400" />
                    <span>{log.weatherCondition}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Feeds: Recent Passenger Manifest & Cargo Manifest */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Passengers */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Manifest Penumpang Terbaru
              </h3>
              <p className="text-[11px] text-slate-400">Pendaftaran tiket & status boarding real-time</p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-cyan-400 hover:underline font-medium"
            >
              Semua Tiket ({passengers.length}) ➔
            </button>
          </div>

          <div className="space-y-2">
            {passengers.slice(0, 4).map((p) => (
              <div key={p.id} className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{p.passengerName}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-mono bg-slate-800 text-cyan-300">
                      {p.fareClass}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    No. Tiket: {p.ticketNumber} • Kursi: {p.seatNumber}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    p.bookingStatus === 'boarded'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {p.bookingStatus}
                  </span>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                    {formatIDR(p.ticketPrice)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Cargo */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-indigo-400" />
                Manifest Muatan Kargo & Truk Terbaru
              </h3>
              <p className="text-[11px] text-slate-400">Penempatan dek & klasifikasi muatan maritim</p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-indigo-400 hover:underline font-medium"
            >
              Semua Kargo ({cargoList.length}) ➔
            </button>
          </div>

          <div className="space-y-2">
            {cargoList.slice(0, 4).map((c) => (
              <div key={c.id} className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate max-w-[200px]">{c.description}</span>
                    {c.isDangerousGoods && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-950 border border-red-700 text-red-300">
                        DG
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {c.manifestNumber} • {c.deckPlacement} {c.vehiclePlateNumber ? `• Plat: ${c.vehiclePlateNumber}` : ''}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-white">
                    {c.weightTons} Ton
                  </span>
                  <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                    {formatIDR(c.fee)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
