import React, { useState } from 'react';
import { 
  Ship, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Anchor, 
  MapPin, 
  Clock, 
  Users, 
  Boxes, 
  AlertCircle,
  CheckCircle2,
  X,
  Gauge,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Ship as ShipModel, Route as RouteModel, ShipType, ShipStatus, RouteStatus } from '../types';
import { createShip, updateShip, deleteShip, createRoute, updateRoute, deleteRoute } from '../services/dataService';

interface MasterDataViewProps {
  ships: ShipModel[];
  routes: RouteModel[];
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({ ships, routes }) => {
  const [activeSubTab, setActiveSubTab] = useState<'ships' | 'routes'>('ships');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Modals state
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [editingShip, setEditingShip] = useState<ShipModel | null>(null);

  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteModel | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'ship' | 'route'; id: string; name: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states for Ship
  const [shipCode, setShipCode] = useState('');
  const [shipName, setShipName] = useState('');
  const [shipType, setShipType] = useState<ShipType>('ferry_roro');
  const [grossTonnage, setGrossTonnage] = useState<number>(5000);
  const [maxPassengers, setMaxPassengers] = useState<number>(500);
  const [maxCargoTons, setMaxCargoTons] = useState<number>(1000);
  const [maxVehicles, setMaxVehicles] = useState<number>(100);
  const [yearBuilt, setYearBuilt] = useState<number>(2020);
  const [captainName, setCaptainName] = useState('');
  const [shipStatus, setShipStatus] = useState<ShipStatus>('active');
  const [currentRoute, setCurrentRoute] = useState('');

  // Form states for Route
  const [routeCode, setRouteCode] = useState('');
  const [originPort, setOriginPort] = useState('');
  const [destinationPort, setDestinationPort] = useState('');
  const [distanceNauticalMiles, setDistanceNauticalMiles] = useState<number>(25);
  const [estTravelHours, setEstTravelHours] = useState<number>(2);
  const [basePassengerPrice, setBasePassengerPrice] = useState<number>(50000);
  const [baseCargoPricePerTon, setBaseCargoPricePerTon] = useState<number>(200000);
  const [routeStatus, setRouteStatus] = useState<RouteStatus>('active');

  // Open Ship Form
  const openShipModal = (shipToEdit?: ShipModel) => {
    if (shipToEdit) {
      setEditingShip(shipToEdit);
      setShipCode(shipToEdit.code);
      setShipName(shipToEdit.name);
      setShipType(shipToEdit.type);
      setGrossTonnage(shipToEdit.grossTonnage);
      setMaxPassengers(shipToEdit.maxPassengers);
      setMaxCargoTons(shipToEdit.maxCargoTons);
      setMaxVehicles(shipToEdit.maxVehicles);
      setYearBuilt(shipToEdit.yearBuilt);
      setCaptainName(shipToEdit.captainName);
      setShipStatus(shipToEdit.status);
      setCurrentRoute(shipToEdit.currentRoute || '');
    } else {
      setEditingShip(null);
      setShipCode(`KMP-${Math.floor(100 + Math.random() * 900)}`);
      setShipName('');
      setShipType('ferry_roro');
      setGrossTonnage(7500);
      setMaxPassengers(600);
      setMaxCargoTons(1200);
      setMaxVehicles(120);
      setYearBuilt(2021);
      setCaptainName('Capt. ');
      setShipStatus('active');
      setCurrentRoute(routes[0]?.originPort ? `${routes[0].originPort} - ${routes[0].destinationPort}` : 'Merak - Bakauheni');
    }
    setIsShipModalOpen(true);
  };

  const handleSaveShip = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingShip) {
        await updateShip(editingShip.id, {
          code: shipCode,
          name: shipName,
          type: shipType,
          grossTonnage: Number(grossTonnage),
          maxPassengers: Number(maxPassengers),
          maxCargoTons: Number(maxCargoTons),
          maxVehicles: Number(maxVehicles),
          yearBuilt: Number(yearBuilt),
          captainName,
          status: shipStatus,
          currentRoute,
        });
      } else {
        await createShip({
          code: shipCode,
          name: shipName,
          type: shipType,
          grossTonnage: Number(grossTonnage),
          maxPassengers: Number(maxPassengers),
          maxCargoTons: Number(maxCargoTons),
          maxVehicles: Number(maxVehicles),
          yearBuilt: Number(yearBuilt),
          captainName,
          status: shipStatus,
          currentRoute,
        });
      }
      setIsShipModalOpen(false);
    } catch (err: any) {
      alert('Gagal menyimpan kapal: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Open Route Form
  const openRouteModal = (routeToEdit?: RouteModel) => {
    if (routeToEdit) {
      setEditingRoute(routeToEdit);
      setRouteCode(routeToEdit.code);
      setOriginPort(routeToEdit.originPort);
      setDestinationPort(routeToEdit.destinationPort);
      setDistanceNauticalMiles(routeToEdit.distanceNauticalMiles);
      setEstTravelHours(routeToEdit.estTravelHours);
      setBasePassengerPrice(routeToEdit.basePassengerPrice);
      setBaseCargoPricePerTon(routeToEdit.baseCargoPricePerTon);
      setRouteStatus(routeToEdit.status);
    } else {
      setEditingRoute(null);
      setRouteCode(`RT-${Math.floor(100 + Math.random() * 900)}`);
      setOriginPort('');
      setDestinationPort('');
      setDistanceNauticalMiles(20);
      setEstTravelHours(2);
      setBasePassengerPrice(50000);
      setBaseCargoPricePerTon(250000);
      setRouteStatus('active');
    }
    setIsRouteModalOpen(true);
  };

  const handleSaveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingRoute) {
        await updateRoute(editingRoute.id, {
          code: routeCode,
          originPort,
          destinationPort,
          distanceNauticalMiles: Number(distanceNauticalMiles),
          estTravelHours: Number(estTravelHours),
          basePassengerPrice: Number(basePassengerPrice),
          baseCargoPricePerTon: Number(baseCargoPricePerTon),
          status: routeStatus,
        });
      } else {
        await createRoute({
          code: routeCode,
          originPort,
          destinationPort,
          distanceNauticalMiles: Number(distanceNauticalMiles),
          estTravelHours: Number(estTravelHours),
          basePassengerPrice: Number(basePassengerPrice),
          baseCargoPricePerTon: Number(baseCargoPricePerTon),
          status: routeStatus,
        });
      }
      setIsRouteModalOpen(false);
    } catch (err: any) {
      alert('Gagal menyimpan rute: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setActionLoading(true);
    try {
      if (deleteConfirm.type === 'ship') {
        await deleteShip(deleteConfirm.id);
      } else {
        await deleteRoute(deleteConfirm.id);
      }
      setDeleteConfirm(null);
    } catch (err: any) {
      alert('Gagal menghapus: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredShips = ships.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.captainName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || s.type === filterType;
    return matchesSearch && matchesType;
  });

  const filteredRoutes = routes.filter(r => {
    return r.originPort.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destinationPort.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            onClick={() => { setActiveSubTab('ships'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'ships'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ship className="w-4 h-4" />
            <span>Master Armada Kapal ({ships.length})</span>
          </button>
          <button
            onClick={() => { setActiveSubTab('routes'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'routes'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Master Rute & Pelabuhan ({routes.length})</span>
          </button>
        </div>

        <button
          onClick={() => activeSubTab === 'ships' ? openShipModal() : openRouteModal()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>{activeSubTab === 'ships' ? '+ Tambah Kapal Baru' : '+ Tambah Rute Baru'}</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeSubTab === 'ships' ? 'Cari nama kapal, kode atau nama nahkoda...' : 'Cari rute, pelabuhan asal atau tujuan...'}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {activeSubTab === 'ships' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 w-full sm:w-auto"
            >
              <option value="all">Semua Tipe Kapal</option>
              <option value="ferry_roro">Ferry Ro-Ro</option>
              <option value="cargo_container">Cargo Container</option>
              <option value="passenger_express">Passenger Express</option>
              <option value="bulk_carrier">Bulk Carrier</option>
              <option value="tanker">Tanker</option>
            </select>
          </div>
        )}
      </div>

      {/* SHIPS LIST */}
      {activeSubTab === 'ships' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredShips.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
              <Ship className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs">Tidak ada data kapal yang sesuai kriteria.</p>
            </div>
          ) : (
            filteredShips.map((ship) => (
              <div
                key={ship.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-cyan-500/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                        {ship.code}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5">{ship.name}</h3>
                      <p className="text-xs text-slate-400 capitalize">
                        {ship.type.replace('_', ' ')} • Thn {ship.yearBuilt}
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      ship.status === 'sailing'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : ship.status === 'active'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : ship.status === 'docked'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {ship.status}
                    </span>
                  </div>

                  {/* Technical Specifications Grid */}
                  <div className="grid grid-cols-2 gap-2 my-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Gross Tonnage (GT)</span>
                      <span className="font-mono font-bold text-white">{ship.grossTonnage.toLocaleString()} GT</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Kapasitas Penumpang</span>
                      <span className="font-mono font-bold text-cyan-300">{ship.maxPassengers} Pax</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Batas Muatan Kargo</span>
                      <span className="font-mono font-bold text-indigo-300">{ship.maxCargoTons} Ton</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Kapasitas Kendaraan</span>
                      <span className="font-mono font-bold text-emerald-300">{ship.maxVehicles} Unit</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Anchor className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-slate-300 font-medium">{ship.captainName}</span>
                    </div>
                    {ship.currentRoute && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>Rute: {ship.currentRoute}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions (CRUD) */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openShipModal(ship)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs"
                    title="Edit Spesifikasi Kapal"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Ubah</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ type: 'ship', id: ship.id, name: ship.name })}
                    className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 hover:text-red-100 transition flex items-center gap-1 text-xs"
                    title="Hapus Kapal dari Master Data"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ROUTES LIST */}
      {activeSubTab === 'routes' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Kode Rute</th>
                  <th className="py-3 px-4">Pelabuhan Asal & Tujuan</th>
                  <th className="py-3 px-4">Jarak Laut & Durasi</th>
                  <th className="py-3 px-4">Tarif Dasar Penumpang</th>
                  <th className="py-3 px-4">Tarif Dasar Kargo/Ton</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredRoutes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      Tidak ada master rute yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredRoutes.map((route) => (
                    <tr key={route.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                        {route.code}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{route.originPort}</span>
                          <ArrowRight className="w-3 h-3 text-cyan-400" />
                          <span className="font-semibold text-white">{route.destinationPort}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-300">{route.distanceNauticalMiles} Mil Laut</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          ± {route.estTravelHours} Jam Tempuh
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                        {formatIDR(route.basePassengerPrice)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-indigo-400">
                        {formatIDR(route.baseCargoPricePerTon)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          route.status === 'active'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-red-950 text-red-300 border border-red-800'
                        }`}>
                          {route.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openRouteModal(route)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Edit Rute"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'route', id: route.id, name: `${route.originPort} ➔ ${route.destinationPort}` })}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 hover:text-red-100 transition"
                            title="Hapus Rute"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: SHIP FORM (CREATE / EDIT) */}
      {isShipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Ship className="w-5 h-5 text-cyan-400" />
                {editingShip ? 'Ubah Data Armada Kapal' : 'Tambah Armada Kapal Baru'}
              </h3>
              <button onClick={() => setIsShipModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShip} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kode Kapal / Call Sign</label>
                  <input
                    type="text"
                    required
                    value={shipCode}
                    onChange={(e) => setShipCode(e.target.value)}
                    placeholder="KMP-DR7"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nama Resmi Kapal</label>
                  <input
                    type="text"
                    required
                    value={shipName}
                    onChange={(e) => setShipName(e.target.value)}
                    placeholder="KMP Dharma Rucitra VII"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Jenis / Tipe Kapal</label>
                  <select
                    value={shipType}
                    onChange={(e) => setShipType(e.target.value as ShipType)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ferry_roro">Ferry Ro-Ro (Penumpang & Kendaraan)</option>
                    <option value="cargo_container">Cargo Container (Peti Kemas)</option>
                    <option value="passenger_express">Passenger Express (Cepat)</option>
                    <option value="bulk_carrier">Bulk Carrier (Curah)</option>
                    <option value="tanker">Tanker</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Gross Tonnage (GT)</label>
                  <input
                    type="number"
                    required
                    value={grossTonnage}
                    onChange={(e) => setGrossTonnage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kapasitas Max Pax</label>
                  <input
                    type="number"
                    required
                    value={maxPassengers}
                    onChange={(e) => setMaxPassengers(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Max Kargo (Ton)</label>
                  <input
                    type="number"
                    required
                    value={maxCargoTons}
                    onChange={(e) => setMaxCargoTons(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Max Kendaraan</label>
                  <input
                    type="number"
                    required
                    value={maxVehicles}
                    onChange={(e) => setMaxVehicles(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nama Nahkoda (Kapten)</label>
                  <input
                    type="text"
                    required
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    placeholder="Capt. Hendra Wicaksono"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Status Operasional</label>
                  <select
                    value={shipStatus}
                    onChange={(e) => setShipStatus(e.target.value as ShipStatus)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="active">Active (Siap Operasi)</option>
                    <option value="sailing">Sailing (Sedang Berlayar)</option>
                    <option value="docked">Docked (Bersandar di Dermaga)</option>
                    <option value="maintenance">Maintenance (Perawatan Docking)</option>
                    <option value="standby">Standby</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Rute Penugasan</label>
                <input
                  type="text"
                  value={currentRoute}
                  onChange={(e) => setCurrentRoute(e.target.value)}
                  placeholder="Merak - Bakauheni"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsShipModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan Data Kapal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ROUTE FORM (CREATE / EDIT) */}
      {isRouteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                {editingRoute ? 'Ubah Data Rute Pelabuhan' : 'Tambah Rute Baru'}
              </h3>
              <button onClick={() => setIsRouteModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoute} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Kode Rute</label>
                <input
                  type="text"
                  required
                  value={routeCode}
                  onChange={(e) => setRouteCode(e.target.value)}
                  placeholder="RT-MRK-BKH"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Pelabuhan Asal</label>
                  <input
                    type="text"
                    required
                    value={originPort}
                    onChange={(e) => setOriginPort(e.target.value)}
                    placeholder="Pelabuhan Merak"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Pelabuhan Tujuan</label>
                  <input
                    type="text"
                    required
                    value={destinationPort}
                    onChange={(e) => setDestinationPort(e.target.value)}
                    placeholder="Pelabuhan Bakauheni"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Jarak (Mil Laut / NM)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={distanceNauticalMiles}
                    onChange={(e) => setDistanceNauticalMiles(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Estimasi Durasi (Jam)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={estTravelHours}
                    onChange={(e) => setEstTravelHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tarif Dasar Pax (Rp)</label>
                  <input
                    type="number"
                    required
                    value={basePassengerPrice}
                    onChange={(e) => setBasePassengerPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tarif Kargo per Ton (Rp)</label>
                  <input
                    type="number"
                    required
                    value={baseCargoPricePerTon}
                    onChange={(e) => setBaseCargoPricePerTon(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRouteModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan Rute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-red-900/60 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Konfirmasi Penghapusan</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus data <strong className="text-white">{deleteConfirm.name}</strong> dari Master Database? Aksi ini akan tersinkronisasi online ke Firestore.
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                {actionLoading ? 'Menghapus...' : 'Ya, Hapus Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
