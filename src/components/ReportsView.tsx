import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Filter, 
  Calendar, 
  Ship, 
  Users, 
  Boxes, 
  Coins, 
  CheckCircle2, 
  Flame, 
  ShieldCheck,
  Building2,
  Table
} from 'lucide-react';
import { Voyage, Passenger, Cargo, Ship as ShipModel, Route as RouteModel } from '../types';

interface ReportsViewProps {
  voyages: Voyage[];
  passengers: Passenger[];
  cargoList: Cargo[];
  ships: ShipModel[];
  routes: RouteModel[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  voyages,
  passengers,
  cargoList,
  ships,
  routes,
}) => {
  const [reportType, setReportType] = useState<'passengers' | 'cargo' | 'summary'>('passengers');
  const [selectedVoyageId, setSelectedVoyageId] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week'>('all');

  const selectedVoyage = voyages.find(v => v.id === selectedVoyageId);

  // Filter passengers
  const filteredPassengers = passengers.filter(p => {
    if (selectedVoyageId !== 'all' && p.voyageId !== selectedVoyageId) return false;
    return true;
  });

  // Filter cargo
  const filteredCargo = cargoList.filter(c => {
    if (selectedVoyageId !== 'all' && c.voyageId !== selectedVoyageId) return false;
    return true;
  });

  // Financial calculations
  const totalPassengerRevenue = filteredPassengers.reduce((sum, p) => sum + (Number(p.ticketPrice) || 0), 0);
  const totalCargoRevenue = filteredCargo.reduce((sum, c) => sum + (Number(c.fee) || 0), 0);
  const totalRevenue = totalPassengerRevenue + totalCargoRevenue;

  const totalCargoTons = filteredCargo.reduce((sum, c) => sum + (Number(c.weightTons) || 0), 0);
  const totalVehicles = filteredCargo.filter(c => c.cargoType === 'vehicle').length;
  const dangerousGoods = filteredCargo.filter(c => c.isDangerousGoods);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Export to CSV
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (reportType === 'passengers') {
      csvContent += "No,No Tiket,Nama Penumpang,NIK,Gender,Kategori,Kelas,Kursi,Tarif (IDR),Status\n";
      filteredPassengers.forEach((p, idx) => {
        csvContent += `"${idx + 1}","${p.ticketNumber}","${p.passengerName}","${p.idCardNumber}","${p.gender}","${p.ageCategory}","${p.fareClass}","${p.seatNumber}","${p.ticketPrice}","${p.bookingStatus}"\n`;
      });
    } else if (reportType === 'cargo') {
      csvContent += "No,No Manifest,Tipe Kargo,Deskripsi,Pengirim,Penerima,Berat (Ton),Plat Nomor,Dek,Biaya (IDR),Status,Dangerous Goods\n";
      filteredCargo.forEach((c, idx) => {
        csvContent += `"${idx + 1}","${c.manifestNumber}","${c.cargoType}","${c.description}","${c.senderName}","${c.receiverName}","${c.weightTons}","${c.vehiclePlateNumber || '-'}","${c.deckPlacement}","${c.fee}","${c.status}","${c.isDangerousGoods ? 'YES' : 'NO'}"\n`;
      });
    } else {
      csvContent += "Ringkasan Operasional Maritim NusaVessel\n";
      csvContent += `Total Penumpang,${filteredPassengers.length}\n`;
      csvContent += `Total Tonase Kargo,${totalCargoTons.toFixed(2)} Ton\n`;
      csvContent += `Total Kendaraan,${totalVehicles} Unit\n`;
      csvContent += `Pendapatan Tiket,${totalPassengerRevenue}\n`;
      csvContent += `Pendapatan Kargo,${totalCargoRevenue}\n`;
      csvContent += `Total Pendapatan,${totalRevenue}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_NusaVessel_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Report Controls & Actions */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              STANDAR KSOP & DITJEN HUBLA
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Laporan Resmi & Rekapitulasi Manifest Pelayaran
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dokumen resmi manifes angkutan laut, kargo muatan, serta rekapitulasi keuangan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Cetak Dokumen</span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Selectors and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Report Type Tabs */}
        <div className="sm:col-span-2 flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            onClick={() => setReportType('passengers')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition ${
              reportType === 'passengers'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>1. Manifest Penumpang</span>
          </button>

          <button
            onClick={() => setReportType('cargo')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition ${
              reportType === 'cargo'
                ? 'bg-indigo-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>2. Manifest Kargo & DG</span>
          </button>

          <button
            onClick={() => setReportType('summary')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition ${
              reportType === 'summary'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>3. Rekap Keuangan</span>
          </button>
        </div>

        {/* Voyage Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={selectedVoyageId}
            onChange={(e) => setSelectedVoyageId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Semua Pelayaran ({voyages.length})</option>
            {voyages.map(v => (
              <option key={v.id} value={v.id}>
                {v.voyageNumber} - {v.shipName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards for Report */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 block uppercase">Total Penumpang</span>
          <span className="text-xl font-extrabold text-white">{filteredPassengers.length} Orang</span>
          <span className="text-[10px] text-emerald-400 mt-1 block font-mono">{formatIDR(totalPassengerRevenue)}</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 block uppercase">Muatan Kargo</span>
          <span className="text-xl font-extrabold text-white">{totalCargoTons.toFixed(1)} Ton</span>
          <span className="text-[10px] text-indigo-400 mt-1 block font-mono">{totalVehicles} Kendaraan</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 block uppercase">Kargo Berbahaya (DG)</span>
          <span className={`text-xl font-extrabold ${dangerousGoods.length > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
            {dangerousGoods.length} Unit
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">IMDG Code Certified</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 block uppercase">Total Pendapatan</span>
          <span className="text-xl font-extrabold text-amber-400 font-mono">{formatIDR(totalRevenue)}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Tiket + Manifest Fee</span>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl printable-area">
        {/* Official Header */}
        <div className="border-b-2 border-slate-800 pb-5 mb-6 text-center">
          <div className="text-xs uppercase tracking-widest text-slate-400 font-mono">
            REPUBLIK INDONESIA • KEMENTERIAN PERHUBUNGAN LAUT
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            {reportType === 'passengers'
              ? 'DAFTAR MANIFEST PENUMPANG KAPAL LAUT'
              : reportType === 'cargo'
              ? 'DAFTAR MANIFEST MUATAN KARGO & KENDARAAN (CARGO MANIFEST)'
              : 'REKAPITULASI LAPORAN OPERASIONAL & PENDAPATAN PELAYARAN'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Sistem Informasi Operasional Pelabuhan NusaVessel • Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
          </p>

          {selectedVoyage && (
            <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 max-w-2xl mx-auto text-left text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-slate-500 text-[10px] block">No. Pelayaran:</span>
                <span className="font-mono font-bold text-cyan-400">{selectedVoyage.voyageNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Armada Kapal:</span>
                <span className="font-bold text-white">{selectedVoyage.shipName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Pelabuhan Asal:</span>
                <span className="text-slate-200">{selectedVoyage.originPort}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Pelabuhan Tujuan:</span>
                <span className="text-slate-200">{selectedVoyage.destinationPort}</span>
              </div>
            </div>
          )}
        </div>

        {/* 1. Passenger Table */}
        {reportType === 'passengers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">No. Tiket</th>
                  <th className="py-2.5 px-3">Nama Lengkap</th>
                  <th className="py-2.5 px-3">NIK KTP</th>
                  <th className="py-2.5 px-3">L/P</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Kelas / Dek</th>
                  <th className="py-2.5 px-3">Tarif Tiket</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredPassengers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      Tidak ada data penumpang pada filter ini.
                    </td>
                  </tr>
                ) : (
                  filteredPassengers.map((p, idx) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{p.ticketNumber}</td>
                      <td className="py-2.5 px-3 font-semibold text-white">{p.passengerName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{p.idCardNumber}</td>
                      <td className="py-2.5 px-3">{p.gender}</td>
                      <td className="py-2.5 px-3 capitalize">{p.ageCategory}</td>
                      <td className="py-2.5 px-3 font-mono">{p.fareClass} ({p.seatNumber})</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-emerald-400">{formatIDR(p.ticketPrice)}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-slate-950 text-slate-300 border border-slate-800">
                          {p.bookingStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Cargo Table */}
        {reportType === 'cargo' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">No. Manifest</th>
                  <th className="py-2.5 px-3">Deskripsi Barang & Kendaraan</th>
                  <th className="py-2.5 px-3">Berat (Ton)</th>
                  <th className="py-2.5 px-3">Plat No.</th>
                  <th className="py-2.5 px-3">Palka / Dek</th>
                  <th className="py-2.5 px-3">Pengirim ➔ Penerima</th>
                  <th className="py-2.5 px-3">Biaya / Fee</th>
                  <th className="py-2.5 px-3">Dangerous Goods</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredCargo.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      Tidak ada data kargo pada filter ini.
                    </td>
                  </tr>
                ) : (
                  filteredCargo.map((c, idx) => (
                    <tr key={c.id}>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-400">{c.manifestNumber}</td>
                      <td className="py-2.5 px-3 font-semibold text-white">{c.description}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">{c.weightTons} Ton</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">{c.vehiclePlateNumber || '-'}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{c.deckPlacement}</td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-300">
                        {c.senderName} ➔ {c.receiverName}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-emerald-400">{formatIDR(c.fee)}</td>
                      <td className="py-2.5 px-3">
                        {c.isDangerousGoods ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-700">
                            {c.dangerousGoodsClass || 'IMDG DG'}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Summary Report */}
        {reportType === 'summary' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Rekapitulasi Muatan & Penumpang
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Total Tiket Penumpang Terdaftar:</span>
                    <span className="font-bold text-white font-mono">{filteredPassengers.length} Jiwa</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Total Berat Muatan Kargo:</span>
                    <span className="font-bold text-white font-mono">{totalCargoTons.toFixed(2)} Tonase Metrik</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Total Unit Kendaraan Roda 4+:</span>
                    <span className="font-bold text-white font-mono">{totalVehicles} Unit</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Kargo Berbahaya (IMDG DG):</span>
                    <span className="font-bold text-amber-400 font-mono">{dangerousGoods.length} Pengiriman</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Rekapitulasi Keuangan & Kas
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Pendapatan Tiket Penumpang:</span>
                    <span className="font-bold text-white font-mono">{formatIDR(totalPassengerRevenue)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Pendapatan Tarif Kargo & Truk:</span>
                    <span className="font-bold text-white font-mono">{formatIDR(totalCargoRevenue)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-slate-800 text-sm">
                    <span className="font-bold text-amber-400">TOTAL PENDAPATAN OPERASIONAL:</span>
                    <span className="font-bold text-amber-400 font-mono">{formatIDR(totalRevenue)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Signatures standard */}
        <div className="mt-12 pt-8 border-t border-slate-800 grid grid-cols-2 text-center text-xs text-slate-400">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold text-white mt-1">Perwira Muatan & Tiket</p>
            <div className="h-16 flex items-end justify-center font-mono text-[10px] text-slate-500">
              [ Tanda Tangan Digital ]
            </div>
            <p className="font-semibold text-slate-300 border-t border-slate-700 pt-1 w-48 mx-auto">
              Petugas Operasional KSOP
            </p>
          </div>

          <div>
            <p>Disetujui untuk Berlayar,</p>
            <p className="font-bold text-white mt-1">Nahkoda / Syahbandar Pelabuhan</p>
            <div className="h-16 flex items-end justify-center font-mono text-[10px] text-slate-500">
              [ Cap & Verifikasi Pelabuhan ]
            </div>
            <p className="font-semibold text-slate-300 border-t border-slate-700 pt-1 w-48 mx-auto">
              Capt. Hendra Wicaksono, M.Mar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
