import React, { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, Crosshair, Check, Layers, AlertCircle } from 'lucide-react';
import { Header } from '../common/Header';
import { useApp } from '../../context/AppContext';
import { canManageSPPGName } from '../../types';
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  ZoomControl,
  LayersControl,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';

// Custom distinctive marker icon for SPPG Location
const sppgMarkerIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to handle map clicks and update coordinates
function MapEvents({
  setLat,
  setLng,
  setAddress,
}: {
  setLat: (val: number) => void;
  setLng: (val: number) => void;
  setAddress: (val: string) => void;
}) {
  useMapEvents({
    click(e) {
      const newLat = Number(e.latlng.lat.toFixed(6));
      const newLng = Number(e.latlng.lng.toFixed(6));
      setLat(newLat);
      setLng(newLng);
      setAddress(`Titik Terpilih (${newLat}, ${newLng})`);
    },
  });
  return null;
}

// Invalidate size on mount to completely prevent grey tiles/blanks in Leaflet
function InvalidateMapSize() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 400);
    const t3 = setTimeout(() => map.invalidateSize(), 800);

    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', onResize);
    };
  }, [map]);
  return null;
}

// Center view when coordinate changes
function CenterMapWatcher({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

// Floating 'Current Location' button inside .leaflet-container
function CurrentLocationButton({
  onLocated,
}: {
  onLocated: (lat: number, lng: number, address: string) => void;
}) {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const handleGetCurrentLocation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!navigator.geolocation) {
      alert('Geolokasi tidak didukung oleh browser Anda.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const userLat = Number(pos.coords.latitude.toFixed(6));
        const userLng = Number(pos.coords.longitude.toFixed(6));
        const addr = `Lokasi GPS Terkini (${userLat}, ${userLng})`;
        onLocated(userLat, userLng, addr);
        map.flyTo([userLat, userLng], 17, {
          animate: true,
          duration: 1.2,
        });
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        alert(
          'Tidak dapat mendeteksi lokasi perangkat. Pastikan izin akses lokasi (GPS) telah diizinkan di peramban Anda.'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div
      className="leaflet-bottom leaflet-right"
      style={{
        pointerEvents: 'auto',
        marginBottom: '20px',
        marginRight: '14px',
        zIndex: 1000,
      }}
    >
      <button
        type="button"
        onClick={handleGetCurrentLocation}
        disabled={isLocating}
        title="Pusatkan ke Lokasi Saya Sekarang (GPS)"
        className="flex items-center gap-2 px-3.5 py-2.5 bg-white/95 backdrop-blur-sm text-slate-800 hover:text-[#024b3a] hover:bg-white active:scale-95 transition-all rounded-2xl shadow-xl border border-slate-200/90 cursor-pointer font-bold text-xs group"
      >
        <Navigation
          className={`w-4 h-4 text-[#024b3a] ${
            isLocating ? 'animate-spin' : 'group-hover:rotate-45 transition-transform'
          }`}
        />
        <span className="font-bold text-slate-700">
          {isLocating ? 'Mencari GPS...' : 'Lokasi Saya'}
        </span>
      </button>
    </div>
  );
}

interface LocationSettingsScreenProps {
  onBack: () => void;
}

export const LocationSettingsScreen: React.FC<LocationSettingsScreenProps> = ({ onBack }) => {
  const { settings, updateSettings, currentUser } = useApp();
  const canEditName = canManageSPPGName(currentUser?.role);

  const [lat, setLat] = useState(settings.lat);
  const [lng, setLng] = useState(settings.lng);
  const [radius, setRadius] = useState(settings.radius);
  const [address, setAddress] = useState(settings.address);
  const [sppgName, setSppgName] = useState(settings.name);
  const [sppgCode, setSppgCode] = useState(settings.code || 'SPPG-MDR');
  const [sppgPhone, setSppgPhone] = useState(settings.phone || '(0341) 362222');
  const [sppgEmail, setSppgEmail] = useState(settings.email || 'info@sppg.id');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const newLat = parseFloat(item.lat);
        const newLng = parseFloat(item.lon);
        setLat(newLat);
        setLng(newLng);
        setAddress(item.display_name);
      }
    } catch {
      // Ignored
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = () => {
    updateSettings({
      name: canEditName ? sppgName : settings.name,
      code: canEditName ? sppgCode : settings.code,
      phone: canEditName ? sppgPhone : settings.phone,
      email: canEditName ? sppgEmail : settings.email,
      lat,
      lng,
      radius,
      address,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2000);
  };

  return (
    <div className="relative flex flex-col bg-[#f4f7fb] rounded-2xl overflow-hidden shadow-xs border border-slate-200/60 select-none">
      {/* Top Header */}
      <div className="relative z-20 bg-white/95 backdrop-blur-xs border-b border-slate-100">
        <Header title="Update Lokasi Kantor (Leaflet Map)" onBack={onBack} />

        {/* Search bar */}
        <div className="px-4 sm:px-6 pb-3 pt-1">
          <form
            onSubmit={handleSearch}
            className="relative flex items-center bg-slate-100/90 rounded-2xl px-3.5 py-2.5 border border-slate-200/50"
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari alamat, nama jalan, atau kota..."
              className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
            />
            {isSearching && (
              <span className="text-[10px] text-slate-400 animate-pulse shrink-0">
                Mencari...
              </span>
            )}
          </form>
        </div>
      </div>

      {/* OpenStreetMap Component Container */}
      <div className="relative w-full bg-slate-100 z-10">
        <div className="relative w-full h-[440px] sm:h-[480px]">
          <MapContainer
            center={[lat, lng]}
            zoom={16}
            zoomControl={false}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            className="w-full h-full"
          >
            {/* Automatic sizing recalculation to eliminate grey tile bug */}
            <InvalidateMapSize />

            {/* Layer Control with Standard OSM, Esri Street, Satellite Imagery & OSM HOT */}
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="OpenStreetMap Standar">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maxZoom={19}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Peta Jalan (Esri Street)">
                <TileLayer
                  attribution="Tiles &copy; Esri &mdash; Source: Esri, USGS, TomTom"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={19}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Satelit (Esri World Imagery)">
                <TileLayer
                  attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={19}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Peta Kemanusiaan (OSM HOT)">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, HOT'
                  url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                  subdomains="abc"
                  maxZoom={19}
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            {/* Standard Leaflet Zoom Control */}
            <ZoomControl position="topright" />

            {/* Floating 'Current Location' button inside .leaflet-container */}
            <CurrentLocationButton
              onLocated={(newLat, newLng, newAddr) => {
                setLat(newLat);
                setLng(newLng);
                setAddress(newAddr);
              }}
            />

            {/* Office Center Marker */}
            <Marker position={[lat, lng]} icon={sppgMarkerIcon}>
              <Popup>
                <div className="text-xs p-1">
                  <p className="font-bold text-[#024b3a]">{sppgName}</p>
                  <p className="text-[10px] text-slate-600 mt-1">{address}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                    {lat.toFixed(6)}, {lng.toFixed(6)}
                  </p>
                  <p className="text-[10px] font-bold text-emerald-700 mt-1">
                    Radius: {radius}m
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Geofence Radius Circle */}
            <Circle
              center={[lat, lng]}
              radius={radius}
              pathOptions={{
                color: '#024b3a',
                fillColor: '#024b3a',
                fillOpacity: 0.16,
                weight: 2,
              }}
            />

            <MapEvents setLat={setLat} setLng={setLng} setAddress={setAddress} />
            <CenterMapWatcher lat={lat} lng={lng} />
          </MapContainer>

          {/* Floating guidance badge */}
          <div className="absolute top-3 left-4 z-20 pointer-events-none space-y-1.5 max-w-[280px]">
            <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-slate-200/80 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold text-slate-800 leading-tight">
                  Klik peta untuk pindah titik
                </p>
                <p className="text-[9px] text-slate-500 font-mono truncate">
                  {lat.toFixed(5)}, {lng.toFixed(5)}
                </p>
              </div>
            </div>
            <div className="bg-[#024b3a]/90 text-white backdrop-blur-md px-3 py-1 rounded-xl shadow-md flex items-center justify-between text-[10px] font-bold">
              <span>Radius Absen:</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-md font-mono">{radius} M</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Settings Card */}
      <div className="bg-white px-5 sm:px-6 py-4 border-t border-slate-100 space-y-3.5 z-20">
        {canEditName && (
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-black text-slate-900 uppercase">
              Profil Instansi / SPPG (Pengaturan Developer & Kepala SPPG)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Instansi / SPPG:
                </label>
                <input
                  type="text"
                  value={sppgName}
                  onChange={(e) => setSppgName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#024b3a]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ID SPPG / Kode Surat:
                </label>
                <input
                  type="text"
                  value={sppgCode}
                  onChange={(e) => setSppgCode(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:border-[#024b3a]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nomor Telepon:
                </label>
                <input
                  type="text"
                  value={sppgPhone}
                  onChange={(e) => setSppgPhone(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#024b3a]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Email Resmi SPPG:
                </label>
                <input
                  type="text"
                  value={sppgEmail}
                  onChange={(e) => setSppgEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#024b3a]"
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Latitude:</label>
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-[#024b3a]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Longitude:</label>
            <input
              type="number"
              step="any"
              value={lng}
              onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-[#024b3a]"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-bold text-slate-600">
              Radius Toleransi Absensi:
            </label>
            <span className="text-[11px] font-extrabold text-[#024b3a]">{radius} Meter</span>
          </div>
          <input
            type="range"
            min="20"
            max="500"
            step="10"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value) || 100)}
            className="w-full accent-[#024b3a] cursor-pointer"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div className="flex items-start gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-600 truncate max-w-sm">{address}</p>
          </div>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#024b3a] text-white text-xs font-bold shadow-md hover:bg-[#023b2d] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Lokasi Tersimpan!</span>
              </>
            ) : (
              <span>Simpan Titik Lokasi</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
