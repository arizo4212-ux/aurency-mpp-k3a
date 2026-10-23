import React, { useState } from 'react';
import { 
  Compass, 
  Users, 
  Boxes, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Printer, 
  QrCode, 
  Barcode, 
  CheckCircle2, 
  Clock, 
  Ship, 
  MapPin, 
  Flame, 
  Truck, 
  AlertTriangle, 
  X, 
  ArrowRight,
  ShieldAlert,
  Calendar,
  Ticket
} from 'lucide-react';
import { 
  Voyage, 
  Passenger, 
  Cargo, 
  Ship as ShipModel, 
  Route as RouteModel,
  VoyageStatus,
  PassengerBookingStatus,
  CargoStatus,
  CargoType,
  FareClass,
  Gender,
  AgeCategory
} from '../types';
import { 
  createVoyage, 
  updateVoyage, 
  deleteVoyage, 
  createPassenger, 
  updatePassenger, 
  deletePassenger, 
  createCargo, 
  updateCargo, 
  deleteCargo 
} from '../services/dataService';

interface TransactionViewProps {
  voyages: Voyage[];
  passengers: Passenger[];
  cargoList: Cargo[];
  ships: ShipModel[];
  routes: RouteModel[];
  initialSubTab?: 'voyages' | 'passengers' | 'cargo';
  isPassengerModalOpenDirect?: boolean;
  onClosePassengerModalDirect?: () => void;
  isCargoModalOpenDirect?: boolean;
  onCloseCargoModalDirect?: () => void;
}

export const TransactionView: React.FC<TransactionViewProps> = ({
  voyages,
  passengers,
  cargoList,
  ships,
  routes,
  initialSubTab = 'voyages',
  isPassengerModalOpenDirect,
  onClosePassengerModalDirect,
  isCargoModalOpenDirect,
  onCloseCargoModalDirect,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'voyages' | 'passengers' | 'cargo'>(initialSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVoyageFilter, setSelectedVoyageFilter] = useState('all');

  // Modals state
  const [isVoyageModalOpen, setIsVoyageModalOpen] = useState(false);
  const [editingVoyage, setEditingVoyage] = useState<Voyage | null>(null);

  const [isPassengerModalOpen, setIsPassengerModalOpen] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);

  const [isCargoModalOpen, setIsCargoModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);

  const [boardingPassPassenger, setBoardingPassPassenger] = useState<Passenger | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'voyage' | 'passenger' | 'cargo'; id: string; name: string; extraId?: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Sync direct modals from dashboard
  React.useEffect(() => {
    if (isPassengerModalOpenDirect) {
      openPassengerModal();
    }
  }, [isPassengerModalOpenDirect]);

  React.useEffect(() => {
    if (isCargoModalOpenDirect) {
      openCargoModal();
    }
  }, [isCargoModalOpenDirect]);

  // VOYAGE FORM STATE
  const [vVoyageNumber, setVVoyageNumber] = useState('');
  const [vShipId, setVShipId] = useState('');
  const [vRouteId, setVRouteId] = useState('');
  const [vDepartureTime, setVDepartureTime] = useState('');
  const [vArrivalTime, setVArrivalTime] = useState('');
  const [vStatus, setVStatus] = useState<VoyageStatus>('scheduled');
  const [vNotes, setVNotes] = useState('');

  // PASSENGER FORM STATE
  const [pVoyageId, setPVoyageId] = useState('');
  const [pTicketNumber, setPTicketNumber] = useState('');
  const [pPassengerName, setPPassengerName] = useState('');
  const [pIdCardNumber, setPIdCardNumber] = useState('');
  const [pGender, setPGender] = useState<Gender>('L');
  const [pAgeCategory, setPAgeCategory] = useState<AgeCategory>('dewasa');
  const [pSeatNumber, setPSeatNumber] = useState('');
  const [pFareClass, setPFareClass] = useState<FareClass>('ekonomi');
  const [pTicketPrice, setPTicketPrice] = useState<number>(50000);
  const [pBookingStatus, setPBookingStatus] = useState<PassengerBookingStatus>('boarded');
  const [pContactPhone, setPContactPhone] = useState('');
  const [pEmergencyContact, setPEmergencyContact] = useState('');

  // CARGO FORM STATE
  const [cVoyageId, setCVoyageId] = useState('');
  const [cManifestNumber, setCManifestNumber] = useState('');
  const [cCargoType, setCCargoType] = useState<CargoType>('vehicle');
  const [cDescription, setCDescription] = useState('');
  const [cSenderName, setCSenderName] = useState('');
  const [cReceiverName, setCReceiverName] = useState('');
  const [cWeightTons, setCWeightTons] = useState<number>(10);
  const [cVehiclePlateNumber, setCVehiclePlateNumber] = useState('');
  const [cDeckPlacement, setCDeckPlacement] = useState('Main Deck - Bay A1');
  const [cIsDangerousGoods, setCIsDangerousGoods] = useState(false);
  const [cDangerousGoodsClass, setCDangerousGoodsClass] = useState('');
  const [cHandlingNotes, setCHandlingNotes] = useState('');
  const [cFee, setCFee] = useState<number>(1500000);
  const [cStatus, setCStatus] = useState<CargoStatus>('loaded');

  // Open Voyage Modal
  const openVoyageModal = (voyageToEdit?: Voyage) => {
    if (voyageToEdit) {
      setEditingVoyage(voyageToEdit);
      setVVoyageNumber(voyageToEdit.voyageNumber);
      setVShipId(voyageToEdit.shipId);
      setVRouteId(voyageToEdit.routeId);
      setVDepartureTime(voyageToEdit.departureTime.slice(0, 16));
      setVArrivalTime(voyageToEdit.arrivalTime.slice(0, 16));
      setVStatus(voyageToEdit.status);
      setVNotes(voyageToEdit.notes || '');
    } else {
      setEditingVoyage(null);
      setVVoyageNumber(`VY-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
      setVShipId(ships[0]?.id || '');
      setVRouteId(routes[0]?.id || '');
      const now = new Date();
      setVDepartureTime(now.toISOString().slice(0, 16));
      const arr = new Date(now.getTime() + 3 * 3600 * 1000);
      setVArrivalTime(arr.toISOString().slice(0, 16));
      setVStatus('scheduled');
      setVNotes('');
    }
    setIsVoyageModalOpen(true);
  };

  const handleSaveVoyage = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const selectedShip = ships.find(s => s.id === vShipId);
      const selectedRoute = routes.find(r => r.id === vRouteId);

      if (!selectedShip || !selectedRoute) {
        throw new Error('Pilih kapal dan rute terlebih dahulu');
      }

      if (editingVoyage) {
        await updateVoyage(editingVoyage.id, {
          voyageNumber: vVoyageNumber,
          shipId: vShipId,
          shipName: selectedShip.name,
          routeId: vRouteId,
          originPort: selectedRoute.originPort,
          destinationPort: selectedRoute.destinationPort,
          departureTime: new Date(vDepartureTime).toISOString(),
          arrivalTime: new Date(vArrivalTime).toISOString(),
          status: vStatus,
          notes: vNotes,
        });
      } else {
        await createVoyage({
          voyageNumber: vVoyageNumber,
          shipId: vShipId,
          shipName: selectedShip.name,
          routeId: vRouteId,
          originPort: selectedRoute.originPort,
          destinationPort: selectedRoute.destinationPort,
          departureTime: new Date(vDepartureTime).toISOString(),
          arrivalTime: new Date(vArrivalTime).toISOString(),
          status: vStatus,
          notes: vNotes,
        });
      }
      setIsVoyageModalOpen(false);
    } catch (err: any) {
      alert('Gagal menyimpan jadwal: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Open Passenger Modal
  const openPassengerModal = (passengerToEdit?: Passenger) => {
    if (passengerToEdit) {
      setEditingPassenger(passengerToEdit);
      setPVoyageId(passengerToEdit.voyageId);
      setPTicketNumber(passengerToEdit.ticketNumber);
      setPPassengerName(passengerToEdit.passengerName);
      setPIdCardNumber(passengerToEdit.idCardNumber);
      setPGender(passengerToEdit.gender);
      setPAgeCategory(passengerToEdit.ageCategory);
      setPSeatNumber(passengerToEdit.seatNumber);
      setPFareClass(passengerToEdit.fareClass);
      setPTicketPrice(passengerToEdit.ticketPrice);
      setPBookingStatus(passengerToEdit.bookingStatus);
      setPContactPhone(passengerToEdit.contactPhone);
      setPEmergencyContact(passengerToEdit.emergencyContact || '');
    } else {
      setEditingPassenger(null);
      setPVoyageId(voyages[0]?.id || '');
      setPTicketNumber(`TKT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`);
      setPPassengerName('');
      setPIdCardNumber('32' + Math.floor(10000000000000 + Math.random() * 90000000000000));
      setPGender('L');
      setPAgeCategory('dewasa');
      setPSeatNumber(`DEK-A-${Math.floor(1 + Math.random() * 80)}`);
      setPFareClass('ekonomi');
      setPTicketPrice(55000);
      setPBookingStatus('boarded');
      setPContactPhone('0812' + Math.floor(10000000 + Math.random() * 90000000));
      setPEmergencyContact('');
    }
    setIsPassengerModalOpen(true);
  };

  const handleSavePassenger = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingPassenger) {
        await updatePassenger(editingPassenger.id, {
          voyageId: pVoyageId,
          ticketNumber: pTicketNumber,
          passengerName: pPassengerName,
          idCardNumber: pIdCardNumber,
          gender: pGender,
          ageCategory: pAgeCategory,
          seatNumber: pSeatNumber,
          fareClass: pFareClass,
          ticketPrice: Number(pTicketPrice),
          bookingStatus: pBookingStatus,
          contactPhone: pContactPhone,
          emergencyContact: pEmergencyContact,
        });
      } else {
        await createPassenger({
          voyageId: pVoyageId,
          ticketNumber: pTicketNumber,
          passengerName: pPassengerName,
          idCardNumber: pIdCardNumber,
          gender: pGender,
          ageCategory: pAgeCategory,
          seatNumber: pSeatNumber,
          fareClass: pFareClass,
          ticketPrice: Number(pTicketPrice),
          bookingStatus: pBookingStatus,
          contactPhone: pContactPhone,
          emergencyContact: pEmergencyContact,
        }, voyages, ships);
      }
      setIsPassengerModalOpen(false);
      if (onClosePassengerModalDirect) onClosePassengerModalDirect();
    } catch (err: any) {
      alert('Gagal menyimpan penumpang: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Open Cargo Modal
  const openCargoModal = (cargoToEdit?: Cargo) => {
    if (cargoToEdit) {
      setEditingCargo(cargoToEdit);
      setCVoyageId(cargoToEdit.voyageId);
      setCManifestNumber(cargoToEdit.manifestNumber);
      setCCargoType(cargoToEdit.cargoType);
      setCDescription(cargoToEdit.description);
      setCSenderName(cargoToEdit.senderName);
      setCReceiverName(cargoToEdit.receiverName);
      setCWeightTons(cargoToEdit.weightTons);
      setCVehiclePlateNumber(cargoToEdit.vehiclePlateNumber || '');
      setCDeckPlacement(cargoToEdit.deckPlacement);
      setCIsDangerousGoods(cargoToEdit.isDangerousGoods);
      setCDangerousGoodsClass(cargoToEdit.dangerousGoodsClass || '');
      setCHandlingNotes(cargoToEdit.handlingNotes || '');
      setCFee(cargoToEdit.fee);
      setCStatus(cargoToEdit.status);
    } else {
      setEditingCargo(null);
      setCVoyageId(voyages[0]?.id || '');
      setCManifestNumber(`CRG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setCCargoType('vehicle');
      setCDescription('Truk Fuso Muatan Sembako & Logistik');
      setCSenderName('PT Logistik Bahari Nusantara');
      setCReceiverName('Gudang Distribusi Utama');
      setCWeightTons(18.5);
      setCVehiclePlateNumber('B 9' + Math.floor(100 + Math.random() * 900) + ' UEN');
      setCDeckPlacement('Main Deck - Bay C' + Math.floor(1 + Math.random() * 6));
      setCIsDangerousGoods(false);
      setCDangerousGoodsClass('');
      setCHandlingNotes('Ikat lashing rantai standar KSOP.');
      setCFee(2400000);
      setCStatus('loaded');
    }
    setIsCargoModalOpen(true);
  };

  const handleSaveCargo = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingCargo) {
        await updateCargo(editingCargo.id, {
          voyageId: cVoyageId,
          manifestNumber: cManifestNumber,
          cargoType: cCargoType,
          description: cDescription,
          senderName: cSenderName,
          receiverName: cReceiverName,
          weightTons: Number(cWeightTons),
          vehiclePlateNumber: cVehiclePlateNumber,
          deckPlacement: cDeckPlacement,
          isDangerousGoods: cIsDangerousGoods,
          dangerousGoodsClass: cDangerousGoodsClass,
          handlingNotes: cHandlingNotes,
          fee: Number(cFee),
          status: cStatus,
        });
      } else {
        await createCargo({
          voyageId: cVoyageId,
          manifestNumber: cManifestNumber,
          cargoType: cCargoType,
          description: cDescription,
          senderName: cSenderName,
          receiverName: cReceiverName,
          weightTons: Number(cWeightTons),
          vehiclePlateNumber: cVehiclePlateNumber,
          deckPlacement: cDeckPlacement,
          isDangerousGoods: cIsDangerousGoods,
          dangerousGoodsClass: cDangerousGoodsClass,
          handlingNotes: cHandlingNotes,
          fee: Number(cFee),
          status: cStatus,
        }, voyages, ships);
      }
      setIsCargoModalOpen(false);
      if (onCloseCargoModalDirect) onCloseCargoModalDirect();
    } catch (err: any) {
      alert('Gagal menyimpan manifest muatan: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setActionLoading(true);
    try {
      if (deleteConfirm.type === 'voyage') {
        await deleteVoyage(deleteConfirm.id);
      } else if (deleteConfirm.type === 'passenger') {
        await deletePassenger(deleteConfirm.id, deleteConfirm.extraId || '', voyages);
      } else {
        const item = cargoList.find(c => c.id === deleteConfirm.id);
        if (item) {
          await deleteCargo(deleteConfirm.id, item, voyages);
        }
      }
      setDeleteConfirm(null);
    } catch (err: any) {
      alert('Gagal menghapus: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const filteredPassengers = passengers.filter(p => {
    const matchesSearch = p.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.idCardNumber.includes(searchQuery);
    const matchesVoyage = selectedVoyageFilter === 'all' || p.voyageId === selectedVoyageFilter;
    return matchesSearch && matchesVoyage;
  });

  const filteredCargo = cargoList.filter(c => {
    const matchesSearch = c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.manifestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.vehiclePlateNumber && c.vehiclePlateNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesVoyage = selectedVoyageFilter === 'all' || c.voyageId === selectedVoyageFilter;
    return matchesSearch && matchesVoyage;
  });

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Global Voyage Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            onClick={() => setActiveSubTab('voyages')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'voyages'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>1. Jadwal Pelayaran ({voyages.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('passengers')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'passengers'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2. Manifest Penumpang ({passengers.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('cargo')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'cargo'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>3. Manifest Muatan Kargo ({cargoList.length})</span>
          </button>
        </div>

        {/* Primary Action Button */}
        <div>
          {activeSubTab === 'voyages' && (
            <button
              onClick={() => openVoyageModal()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Jadwal Pelayaran</span>
            </button>
          )}

          {activeSubTab === 'passengers' && (
            <button
              onClick={() => openPassengerModal()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Tiket Penumpang</span>
            </button>
          )}

          {activeSubTab === 'cargo' && (
            <button
              onClick={() => openCargoModal()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Muatan Kargo/Truk</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeSubTab === 'voyages'
                ? 'Cari no perjalanan, nama kapal...'
                : activeSubTab === 'passengers'
                ? 'Cari nama penumpang, nomor tiket atau NIK KTP...'
                : 'Cari no manifest, deskripsi muatan, pengirim atau plat nomor...'
            }
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {activeSubTab !== 'voyages' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400">Voyage:</span>
            <select
              value={selectedVoyageFilter}
              onChange={(e) => setSelectedVoyageFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 w-full sm:w-auto"
            >
              <option value="all">Semua Pelayaran ({voyages.length})</option>
              {voyages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.voyageNumber} ({v.shipName})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 1. SUBTAB: JADWAL PELAYARAN (VOYAGES) */}
      {activeSubTab === 'voyages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {voyages.map((v) => {
            const ship = ships.find((s) => s.id === v.shipId);
            const maxPax = ship?.maxPassengers || 500;
            const maxCargo = ship?.maxCargoTons || 1000;
            const paxRatio = Math.round(((v.currentPassengers || 0) / maxPax) * 100);
            const cargoRatio = Math.round(((v.currentCargoTons || 0) / maxCargo) * 100);

            return (
              <div
                key={v.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-cyan-500/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {v.voyageNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          v.status === 'sailing'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : v.status === 'boarding'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : v.status === 'docked'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {v.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-2">{v.shipName}</h3>
                    </div>

                    {/* Quick Status Advance Dropdown */}
                    <select
                      value={v.status}
                      onChange={async (e) => {
                        await updateVoyage(v.id, { status: e.target.value as VoyageStatus });
                      }}
                      className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 focus:outline-none"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="boarding">Boarding</option>
                      <option value="sailing">Sailing (Berlayar)</option>
                      <option value="docked">Docked (Sandar)</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-300 mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-semibold text-white">{v.originPort}</span>
                    <span className="text-slate-500">➔</span>
                    <span className="font-semibold text-white">{v.destinationPort}</span>
                  </div>

                  {/* Departure & Arrival */}
                  <div className="grid grid-cols-2 gap-3 my-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Jadwal Keberangkatan</span>
                      <span className="font-mono text-slate-200">
                        {new Date(v.departureTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {new Date(v.departureTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Estimasi Tiba (ETA)</span>
                      <span className="font-mono text-slate-200">
                        {new Date(v.arrivalTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {new Date(v.arrivalTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </span>
                    </div>
                  </div>

                  {/* Real-time Load Capacity Bars */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Penumpang: {v.currentPassengers || 0}/{maxPax} pax</span>
                        <span className="font-mono text-cyan-300 font-bold">{paxRatio}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full ${paxRatio >= 90 ? 'bg-red-500' : 'bg-cyan-500'}`}
                          style={{ width: `${Math.min(100, paxRatio)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Muatan Tonase: {v.currentCargoTons || 0}/{maxCargo} ton</span>
                        <span className="font-mono text-indigo-300 font-bold">{cargoRatio}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full ${cargoRatio >= 90 ? 'bg-red-500' : 'bg-indigo-500'}`}
                          style={{ width: `${Math.min(100, cargoRatio)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {v.notes && (
                    <p className="mt-3 text-[11px] text-slate-400 italic">
                      "{v.notes}"
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedVoyageFilter(v.id);
                        setActiveSubTab('passengers');
                      }}
                      className="text-[11px] text-cyan-400 hover:underline font-medium"
                    >
                      Buka Manifest Pax ➔
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openVoyageModal(v)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                      title="Edit Jadwal"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'voyage', id: v.id, name: `Voyage ${v.voyageNumber}` })}
                      className="p-1.5 rounded-lg bg-red-950/40 text-red-300 hover:text-red-100"
                      title="Hapus Jadwal"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. SUBTAB: MANIFEST PENUMPANG (PASSENGERS) */}
      {activeSubTab === 'passengers' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Daftar Manifest Penumpang (Passenger Manifest)
              </h3>
              <p className="text-[11px] text-slate-400">Total {filteredPassengers.length} tiket terdaftar di database</p>
            </div>
            <button
              onClick={() => openPassengerModal()}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tiket Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">No. Tiket</th>
                  <th className="py-3 px-4">Nama Penumpang & NIK</th>
                  <th className="py-3 px-4">Kelas / Kursi</th>
                  <th className="py-3 px-4">Pelayaran & Kapal</th>
                  <th className="py-3 px-4">Tarif Tiket</th>
                  <th className="py-3 px-4">Status Boarding</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredPassengers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      Tidak ada manifest penumpang yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredPassengers.map((p) => {
                    const voyage = voyages.find(v => v.id === p.voyageId);
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                          {p.ticketNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{p.passengerName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            NIK: {p.idCardNumber} ({p.gender === 'L' ? 'Laki-laki' : 'Perempuan'}, {p.ageCategory})
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-950 text-cyan-300 border border-slate-800">
                            {p.fareClass}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">Kursi: {p.seatNumber}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white font-medium">{voyage?.shipName || 'Kapal'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{voyage?.voyageNumber || '-'}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                          {formatIDR(p.ticketPrice)}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={p.bookingStatus}
                            onChange={async (e) => {
                              await updatePassenger(p.id, { bookingStatus: e.target.value as PassengerBookingStatus });
                            }}
                            className={`px-2 py-1 rounded text-[10px] font-semibold uppercase bg-slate-950 border focus:outline-none ${
                              p.bookingStatus === 'boarded'
                                ? 'text-emerald-300 border-emerald-800'
                                : p.bookingStatus === 'checked_in'
                                ? 'text-cyan-300 border-cyan-800'
                                : 'text-amber-300 border-amber-800'
                            }`}
                          >
                            <option value="booked">Booked</option>
                            <option value="checked_in">Checked In</option>
                            <option value="boarded">Boarded (Naik Kapal)</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Boarding pass preview */}
                            <button
                              onClick={() => setBoardingPassPassenger(p)}
                              className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 transition"
                              title="Cetak Boarding Pass Digital"
                            >
                              <Ticket className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openPassengerModal(p)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                              title="Edit Data Penumpang"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ type: 'passenger', id: p.id, name: p.passengerName, extraId: p.voyageId })}
                              className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 hover:text-red-100 transition"
                              title="Hapus Penumpang"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SUBTAB: MANIFEST MUATAN KARGO (CARGO) */}
      {activeSubTab === 'cargo' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-indigo-400" />
                Daftar Manifest Muatan Kargo & Kendaraan (Cargo Manifest)
              </h3>
              <p className="text-[11px] text-slate-400">Total {filteredCargo.length} muatan logistik terdaftar</p>
            </div>
            <button
              onClick={() => openCargoModal()}
              className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Muatan Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">No. Manifest</th>
                  <th className="py-3 px-4">Deskripsi Muatan & Tipe</th>
                  <th className="py-3 px-4">Berat Tonase & Plat No.</th>
                  <th className="py-3 px-4">Penempatan Dek</th>
                  <th className="py-3 px-4">Pengirim & Penerima</th>
                  <th className="py-3 px-4">Biaya / Fee</th>
                  <th className="py-3 px-4">Status Muatan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredCargo.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      Tidak ada data muatan kargo yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredCargo.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                        {c.manifestNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          {c.description}
                          {c.isDangerousGoods && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-950 border border-red-700 text-red-300 flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5" /> DG
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">{c.cargoType.replace('_', ' ')}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white">{c.weightTons} Ton</div>
                        {c.vehiclePlateNumber && (
                          <div className="text-[10px] font-mono text-cyan-300">Plat: {c.vehiclePlateNumber}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">
                        {c.deckPlacement}
                      </td>
                      <td className="py-3 px-4 text-[11px]">
                        <div className="text-white truncate max-w-[140px]">{c.senderName}</div>
                        <div className="text-slate-400 text-[10px] truncate max-w-[140px]">➔ {c.receiverName}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                        {formatIDR(c.fee)}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={c.status}
                          onChange={async (e) => {
                            await updateCargo(c.id, { status: e.target.value as CargoStatus });
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-semibold uppercase bg-slate-950 border focus:outline-none ${
                            c.status === 'loaded'
                              ? 'text-indigo-300 border-indigo-800'
                              : c.status === 'in_transit'
                              ? 'text-cyan-300 border-cyan-800'
                              : c.status === 'unloaded'
                              ? 'text-emerald-300 border-emerald-800'
                              : 'text-slate-400 border-slate-800'
                          }`}
                        >
                          <option value="queued">Queued (Antrean)</option>
                          <option value="loaded">Loaded (Di Palka)</option>
                          <option value="in_transit">In-Transit</option>
                          <option value="unloaded">Unloaded (Bongkar)</option>
                          <option value="claimed">Claimed</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openCargoModal(c)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Edit Data Kargo"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'cargo', id: c.id, name: c.manifestNumber })}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 hover:text-red-100 transition"
                            title="Hapus Kargo"
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

      {/* MODAL: VOYAGE FORM */}
      {isVoyageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                {editingVoyage ? 'Ubah Jadwal Pelayaran' : 'Terbitkan Jadwal Pelayaran Baru'}
              </h3>
              <button onClick={() => setIsVoyageModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVoyage} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nomor Voyage / Pelayaran</label>
                <input
                  type="text"
                  required
                  value={vVoyageNumber}
                  onChange={(e) => setVVoyageNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Armada Kapal</label>
                  <select
                    value={vShipId}
                    onChange={(e) => setVShipId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {ships.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Rute Penyeberangan</label>
                  <select
                    value={vRouteId}
                    onChange={(e) => setVRouteId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.originPort} ➔ {r.destinationPort}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Jadwal Berangkat</label>
                  <input
                    type="datetime-local"
                    required
                    value={vDepartureTime}
                    onChange={(e) => setVDepartureTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Estimasi Tiba (ETA)</label>
                  <input
                    type="datetime-local"
                    required
                    value={vArrivalTime}
                    onChange={(e) => setVArrivalTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Status Keberangkatan</label>
                <select
                  value={vStatus}
                  onChange={(e) => setVStatus(e.target.value as VoyageStatus)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="scheduled">Scheduled (Dijadwalkan)</option>
                  <option value="boarding">Boarding (Proses Naik Penumpang & Kargo)</option>
                  <option value="sailing">Sailing (Sedang Berlayar)</option>
                  <option value="docked">Docked (Bersandar)</option>
                  <option value="completed">Completed (Selesai)</option>
                  <option value="cancelled">Cancelled (Batal)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Catatan Operasional / Nahkoda</label>
                <textarea
                  rows={2}
                  value={vNotes}
                  onChange={(e) => setVNotes(e.target.value)}
                  placeholder="Informasi pasang surut, cuaca laut, kesiapan ramp door..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsVoyageModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PASSENGER FORM */}
      {isPassengerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                {editingPassenger ? 'Ubah Data Penumpang' : 'Registrasi Tiket & Manifest Penumpang'}
              </h3>
              <button 
                onClick={() => {
                  setIsPassengerModalOpen(false);
                  if (onClosePassengerModalDirect) onClosePassengerModalDirect();
                }} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePassenger} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nomor Tiket</label>
                  <input
                    type="text"
                    required
                    value={pTicketNumber}
                    onChange={(e) => setPTicketNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Pilih Pelayaran (Voyage)</label>
                  <select
                    value={pVoyageId}
                    onChange={(e) => setPVoyageId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    {voyages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.voyageNumber} - {v.shipName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nama Lengkap Penumpang</label>
                  <input
                    type="text"
                    required
                    value={pPassengerName}
                    onChange={(e) => setPPassengerName(e.target.value)}
                    placeholder="sesuai KTP / Paspor"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nomor Identitas (NIK KTP)</label>
                  <input
                    type="text"
                    required
                    value={pIdCardNumber}
                    onChange={(e) => setPIdCardNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Jenis Kelamin</label>
                  <select
                    value={pGender}
                    onChange={(e) => setPGender(e.target.value as Gender)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kategori Usia</label>
                  <select
                    value={pAgeCategory}
                    onChange={(e) => setPAgeCategory(e.target.value as AgeCategory)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="dewasa">Dewasa (&gt;12 thn)</option>
                    <option value="anak">Anak-anak (2-12)</option>
                    <option value="bayi">Bayi (&lt;2 thn)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kelas Kursi</label>
                  <select
                    value={pFareClass}
                    onChange={(e) => setPFareClass(e.target.value as FareClass)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="ekonomi">Ekonomi</option>
                    <option value="bisnis">Bisnis</option>
                    <option value="vip">VIP / Eksekutif</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nomor Kursi / Dek</label>
                  <input
                    type="text"
                    required
                    value={pSeatNumber}
                    onChange={(e) => setPSeatNumber(e.target.value)}
                    placeholder="DEK-A-12"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tarif Tiket (Rp)</label>
                  <input
                    type="number"
                    required
                    value={pTicketPrice}
                    onChange={(e) => setPTicketPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Status Boarding</label>
                  <select
                    value={pBookingStatus}
                    onChange={(e) => setPBookingStatus(e.target.value as PassengerBookingStatus)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="booked">Booked (Pesan)</option>
                    <option value="checked_in">Checked In</option>
                    <option value="boarded">Boarded (Naik Kapal)</option>
                    <option value="cancelled">Batal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={pContactPhone}
                    onChange={(e) => setPContactPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kontak Darurat (Opsional)</label>
                  <input
                    type="text"
                    value={pEmergencyContact}
                    onChange={(e) => setPEmergencyContact(e.target.value)}
                    placeholder="0811xxxx (Keluarga)"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsPassengerModalOpen(false);
                    if (onClosePassengerModalDirect) onClosePassengerModalDirect();
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan Tiket Penumpang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CARGO FORM */}
      {isCargoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Boxes className="w-5 h-5 text-indigo-400" />
                {editingCargo ? 'Ubah Data Muatan Kargo' : 'Manifest Muatan Kargo / Truk Baru'}
              </h3>
              <button 
                onClick={() => {
                  setIsCargoModalOpen(false);
                  if (onCloseCargoModalDirect) onCloseCargoModalDirect();
                }} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCargo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">No. Manifest Kargo</label>
                  <input
                    type="text"
                    required
                    value={cManifestNumber}
                    onChange={(e) => setCManifestNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Pilih Pelayaran (Voyage)</label>
                  <select
                    value={cVoyageId}
                    onChange={(e) => setCVoyageId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    {voyages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.voyageNumber} - {v.shipName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Jenis Kategori Muatan</label>
                  <select
                    value={cCargoType}
                    onChange={(e) => setCCargoType(e.target.value as CargoType)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="vehicle">Kendaraan (Truk / Bus / Mobil)</option>
                    <option value="container">Kontainer Peti Kemas</option>
                    <option value="breakbulk">Breakbulk (Pallet / Zak)</option>
                    <option value="general_cargo">General Cargo</option>
                    <option value="dangerous_goods">Barang Berbahaya (DG)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Plat Nomor (Jika Kendaraan)</label>
                  <input
                    type="text"
                    value={cVehiclePlateNumber}
                    onChange={(e) => setCVehiclePlateNumber(e.target.value)}
                    placeholder="B 9876 XYZ"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Deskripsi Muatan</label>
                <input
                  type="text"
                  required
                  value={cDescription}
                  onChange={(e) => setCDescription(e.target.value)}
                  placeholder="contoh: Truk Tronton Muatan Bahan Pokok / Sembako"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Pengirim (Shipper / Ekspedisi)</label>
                  <input
                    type="text"
                    required
                    value={cSenderName}
                    onChange={(e) => setCSenderName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Penerima (Consignee)</label>
                  <input
                    type="text"
                    required
                    value={cReceiverName}
                    onChange={(e) => setCReceiverName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Berat Timbang (Ton)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={cWeightTons}
                    onChange={(e) => setCWeightTons(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Penempatan Dek Palka</label>
                  <input
                    type="text"
                    required
                    value={cDeckPlacement}
                    onChange={(e) => setCDeckPlacement(e.target.value)}
                    placeholder="Main Deck - Bay C1"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Biaya Kargo (Rp)</label>
                  <input
                    type="number"
                    required
                    value={cFee}
                    onChange={(e) => setCFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Dangerous Goods Flag */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cIsDangerousGoods}
                    onChange={(e) => setCIsDangerousGoods(e.target.checked)}
                    className="w-4 h-4 rounded text-red-500 focus:ring-red-400 bg-slate-900 border-slate-700"
                  />
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-red-400" />
                    Kargo Mengandung Barang Berbahaya (IMDG Dangerous Goods)
                  </span>
                </label>

                {cIsDangerousGoods && (
                  <div className="pt-2">
                    <label className="block text-[11px] text-slate-400 mb-1">Klasifikasi IMDG DG</label>
                    <input
                      type="text"
                      value={cDangerousGoodsClass}
                      onChange={(e) => setCDangerousGoodsClass(e.target.value)}
                      placeholder="contoh: IMDG Class 3 (Flammable Liquid)"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-red-800/60 text-xs text-white font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCargoModalOpen(false);
                    if (onCloseCargoModalDirect) onCloseCargoModalDirect();
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan Kargo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOARDING PASS DIGITAL PREVIEW MODAL */}
      {boardingPassPassenger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Ticket className="w-4 h-4" />
                Boarding Pass Maritim Digital
              </span>
              <button onClick={() => setBoardingPassPassenger(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Boarding Pass Design */}
            <div className="bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-700/80 rounded-xl p-5 shadow-inner text-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-dashed border-slate-700 pb-3">
                <div>
                  <div className="text-sm font-extrabold text-white">NusaVessel Marine Lines</div>
                  <div className="text-[10px] text-cyan-400 font-mono">TIKET RESMI PENYEBERANGAN</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-emerald-400">{boardingPassPassenger.ticketNumber}</div>
                  <div className="text-[10px] text-slate-400 uppercase">{boardingPassPassenger.fareClass} CLASS</div>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">NAMA PENUMPANG</span>
                <span className="text-base font-bold text-white">{boardingPassPassenger.passengerName}</span>
                <div className="text-[11px] text-slate-400 font-mono">NIK: {boardingPassPassenger.idCardNumber}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">NOMOR KURSI / DEK</span>
                  <span className="font-mono font-bold text-cyan-300 text-sm">{boardingPassPassenger.seatNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">STATUS</span>
                  <span className="font-bold text-emerald-400 uppercase">{boardingPassPassenger.bookingStatus}</span>
                </div>
              </div>

              {/* Barcode Mock */}
              <div className="pt-3 border-t border-dashed border-slate-700 text-center">
                <div className="font-mono text-2xl tracking-[0.25em] text-slate-400 font-bold select-none">
                  ||||| | |||| ||| ||||||| | ||||
                </div>
                <div className="text-[9px] text-slate-500 font-mono mt-1">
                  Pindai di Gerbang Boarding Dermaga KSOP
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Boarding Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-red-900/60 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Konfirmasi Pembatalan / Hapus</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus data <strong className="text-white">{deleteConfirm.name}</strong>? Sinkronisasi instan akan memperbarui tonase beban kapal dan database tanpa reload.
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
                {actionLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
