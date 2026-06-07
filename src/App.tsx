import React, { useState, useEffect } from 'react';
import { 
  User, 
  Garde, 
  GardeExchange, 
  SimulatedNotification, 
  UserRole, 
  ProfessionType 
} from './types';
import PhoneSimulator from './components/PhoneSimulator';
import MapComponent from './components/MapComponent';
import AdminConsole from './components/AdminConsole';
import NotificationPanel from './components/NotificationPanel';
import { 
  Compass, 
  LayoutDashboard, 
  ShieldAlert, 
  Activity, 
  Heart, 
  Server,
  HelpCircle,
  Smartphone,
  Layers,
  Bell
} from 'lucide-react';

export default function App() {
  // Global React States populated from API
  const [gardes, setGardes] = useState<Garde[]>([]);
  const [exchanges, setExchanges] = useState<GardeExchange[]>([]);
  const [notifications, setNotifications] = useState<SimulatedNotification[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  // Authentication status
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('switchgard_auth_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Active simulated role inside supervisor dashboard
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('n1');

  // Interactive selected coordinates mapping links
  const [selectedGardeId, setSelectedGardeId] = useState<string | null>(null);

  // Filter map categories
  const [mapTypeFilter, setMapTypeFilter] = useState<string>('all');

  // Mobile smartphone tabs selection
  const [phoneTab, setPhoneTab] = useState<string>('home');

  // Layout switches for responsive viewports (Mobile-Simulator focus vs Backoffice vs Full Dashboard)
  const [displayLayoutMode, setDisplayLayoutMode] = useState<'both' | 'phone_only' | 'dashboard_only'>('both');

  // Fetch data helpers
  const fetchAllData = async () => {
    try {
      const resG = await fetch('/api/gardes');
      const dataG = await resG.json();
      setGardes(dataG);

      const resEx = await fetch('/api/exchanges');
      const dataEx = await resEx.json();
      setExchanges(dataEx);

      const resNotif = await fetch('/api/notifications');
      const dataNotif = await resNotif.json();
      setNotifications(dataNotif);

      const resUsers = await fetch('/api/users');
      const dataUsers = await resUsers.json();
      setAllUsers(dataUsers);
    } catch (err) {
      console.error('Erreur lors du chargement des données depuis le backend Express.', err);
    }
  };

  // Check login credentials sequence
  useEffect(() => {
    fetchAllData();
    // Poll updates every 6 seconds to show background activities of validations
    const interval = setInterval(fetchAllData, 6000);
    return () => clearInterval(interval);
  }, []);

  // Sync session profile details on page loads
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          // Token expired or invalid
          handleLogout();
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.user) {
          setCurrentUser(data.user);
          // Set initial role choice
          setCurrentUserRole(data.user.role);
        }
      })
      .catch(err => console.error('Erreur session', err));
    } else {
      setCurrentUser(null);
    }
  }, [token]);

  const handleLogin = async (email: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erreur inconnue');
    }
    localStorage.setItem('switchgard_auth_token', data.token);
    setToken(data.token);
    setCurrentUser(data.user);
    if (data.user) {
      setCurrentUserRole(data.user.role);
    }
    fetchAllData();
  };

  const handleRegister = async (regForm: any) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regForm)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Impossible d’enregistrer le praticien');
    }
    localStorage.setItem('switchgard_auth_token', data.token);
    setToken(data.token);
    setCurrentUser(data.user);
    if (data.user) {
      setCurrentUserRole(data.user.role);
    }
    fetchAllData();
  };

  const handleLogout = () => {
    localStorage.removeItem('switchgard_auth_token');
    setToken(null);
    setCurrentUser(null);
    setCurrentUserRole('n1'); // fallback default
  };

  const handleCreateGarde = async (gardeForm: any) => {
    if (!token) return;
    const res = await fetch('/api/gardes', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(gardeForm)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erreur lors de la création de garde.');
    }
    setGardes(prev => [data, ...prev]);
    setSelectedGardeId(data.id);
    fetchAllData();
  };

  const handleDeleteGarde = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/gardes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Impossible de supprimer cette garde.');
    }
    setGardes(prev => prev.filter(g => g.id !== id));
    if (selectedGardeId === id) setSelectedGardeId(null);
    fetchAllData();
  };

  const handleCreateExchange = async (exchangeForm: any) => {
    if (!token) return;
    const res = await fetch('/api/exchanges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(exchangeForm)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erreur d’initiation d’échange.');
    }
    setExchanges(prev => [data, ...prev]);
    fetchAllData();
  };

  const handleApproveExchangeByAdmin = async (id: string, action: 'approved' | 'rejected', comment: string) => {
    if (!token) {
      // If user is not logged in on the smartphone, simulate with mock admin auth token
      // Let's call the endpoint using the custom roles of supervisor
    }
    
    const res = await fetch(`/api/exchanges/${id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || localStorage.getItem('switchgard_auth_token')}`
      },
      body: JSON.stringify({ action, comment })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Action d’approbation non autorisée.');
    }

    // Refresh state
    fetchAllData();
  };

  const handleResetDatabase = async () => {
    const res = await fetch('/api/test/reset', { method: 'POST' });
    if (res.ok) {
      fetchAllData();
      setSelectedGardeId(null);
    }
  };

  // Synchronise selected Gird on click with Mobile category
  const selectGardeFromMapAndSwitchTabOnPhone = (g: Garde) => {
    setSelectedGardeId(g.id);
    setPhoneTab('home'); // focus home listing
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex flex-col font-sans transition-colors duration-300 antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Premium Top Navigation Portal Bar */}
      <header className="border-b border-white/5 bg-[#121214] sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/10 border border-white/5 rounded-xl flex items-center justify-center">
            <Layers className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-blue-500">
                Switch<span className="text-white">Gard</span>
              </h1>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-white/5 text-gray-400 rounded-full border border-white/5 uppercase tracking-widest font-mono">
                Ségur de la Santé
              </span>
            </div>
            <p className="text-[11px] text-gray-550 font-sans">
              Écosystème mobile d’échanges de gardes hospitalières — Médecins, Pharmaciens, Pompiers & Urgences
            </p>
          </div>
        </div>

        {/* Server metrics line */}
        <div className="flex items-center gap-4 text-xs font-sans text-gray-400 flex-wrap justify-center">
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">REST API : CONNECTED</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">Canaux SMS/Email : ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Dynamic Display Mode Toggle Bar (For premium viewport simulation customization) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#121214] border border-white/5 rounded-2xl gap-3">
          <div className="space-y-0.5">
            <h3 className="font-bold text-xs uppercase tracking-widest text-blue-500">Workspace Layout Switcher</h3>
            <p className="text-[11px] text-gray-450">
              Affichez l'application mobile React Native et le portail administrateur côte-à-côte, ou isolez-les.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setDisplayLayoutMode('both')}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                displayLayoutMode === 'both' ? 'bg-blue-600 text-white border-white/10' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
              }`}
            >
              Vue Côte-à-Côte Dual (Mobile + Admin)
            </button>
            <button
              onClick={() => setDisplayLayoutMode('phone_only')}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                displayLayoutMode === 'phone_only' ? 'bg-blue-600 text-white border-white/10' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
              }`}
            >
              Uniquement Mobile (React Native)
            </button>
            <button
              onClick={() => setDisplayLayoutMode('dashboard_only')}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                displayLayoutMode === 'dashboard_only' ? 'bg-blue-600 text-white border-white/10' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
              }`}
            >
              Uniquement Admin Backoffice & Map
            </button>
          </div>
        </div>

        {/* Content columns based on Layout Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUMN 1: REACT NATIVE MOBILE DEVICE PREVIEW (LG COL 4 or 12) */}
          {(displayLayoutMode === 'both' || displayLayoutMode === 'phone_only') && (
            <div className={`${displayLayoutMode === 'phone_only' ? 'lg:col-span-12' : 'lg:col-span-4'} space-y-4`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-blue-500" />
                  Rendu Mobile (React Native simulator)
                </h3>
                {currentUser && (
                  <span className="text-[10px] bg-white/5 border border-white/5 text-gray-400 px-2 py-0.5 rounded-full font-semibold">
                    Rôle simulé : {currentUser.role.toUpperCase()}
                  </span>
                )}
              </div>

              <PhoneSimulator
                currentUser={currentUser}
                allUsers={allUsers}
                gardes={gardes}
                exchanges={exchanges}
                notifications={notifications}
                token={token}
                onLogin={handleLogin}
                onRegister={handleRegister}
                onLogout={handleLogout}
                onCreateGarde={handleCreateGarde}
                onDeleteGarde={handleDeleteGarde}
                onCreateExchange={handleCreateExchange}
                activeTab={phoneTab}
                setActiveTab={setPhoneTab}
                selectedGardeId={selectedGardeId}
                setSelectedGardeId={setSelectedGardeId}
              />
            </div>
          )}

          {/* COLUMN 2: GEOGRAPHIC CARD & WORKFLOW BOARD (LG COL 8 or 12) */}
          {(displayLayoutMode === 'both' || displayLayoutMode === 'dashboard_only') && (
            <div className={`${displayLayoutMode === 'dashboard_only' ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-6`}>
              
              {/* Category Filter + Map row */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-blue-500" />
                    Géolocalisation Tunis Cardio-Santé Ségur
                  </h3>

                  {/* Profession Map filters */}
                  <div className="flex flex-wrap gap-1 bg-[#121214] p-1.5 rounded-xl border border-white/5">
                    <button
                      onClick={() => setMapTypeFilter('all')}
                      className={`px-3 py-1 text-[10.5px] font-bold rounded-lg transition-all ${
                        mapTypeFilter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Tous
                    </button>
                    <button
                      onClick={() => setMapTypeFilter('doctor')}
                      className={`px-3 py-1 text-[10.5px] font-bold rounded-lg transition-all ${
                        mapTypeFilter === 'doctor' ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      Médecins
                    </button>
                    <button
                      onClick={() => setMapTypeFilter('pharmacist')}
                      className={`px-3 py-1 text-[10.5px] font-bold rounded-lg transition-all ${
                        mapTypeFilter === 'pharmacist' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      Pharmaciens
                    </button>
                    <button
                      onClick={() => setMapTypeFilter('firefighter')}
                      className={`px-3 py-1 text-[10.5px] font-bold rounded-lg transition-all ${
                        mapTypeFilter === 'firefighter' ? 'bg-rose-500/15 text-rose-450 border border-rose-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      Sapeurs-Pompiers
                    </button>
                    <button
                      onClick={() => setMapTypeFilter('emergency')}
                      className={`px-3 py-1 text-[10.5px] font-bold rounded-lg transition-all ${
                        mapTypeFilter === 'emergency' ? 'bg-amber-500/15 text-amber-500 border border-amber-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      Urgences
                    </button>
                  </div>
                </div>

                <div className="h-[340px]">
                  <MapComponent
                    gardes={gardes}
                    onSelectGarde={selectGardeFromMapAndSwitchTabOnPhone}
                    selectedGardeId={selectedGardeId || undefined}
                    activeProfessionFilter={mapTypeFilter}
                  />
                </div>
              </div>

              {/* Backoffice/Administrative Action Center */}
              <AdminConsole
                currentUserRole={currentUserRole}
                setCurrentUserRole={setCurrentUserRole}
                exchanges={exchanges}
                gardes={gardes}
                users={allUsers}
                onApproveExchange={handleApproveExchangeByAdmin}
                onResetDatabase={handleResetDatabase}
              />

              {/* Simulated Alerts / Outputs panel */}
              <NotificationPanel
                notifications={notifications}
              />

            </div>
          )}

        </div>
      </main>

      <footer className="border-t border-white/5 bg-[#121214] py-8 text-center text-gray-550 text-xs">
        <p>© 2026 SwitchGard Inc. Conçu conformément au référentiel Ségur d'interopérabilité des cadres hospitaliers.</p>
        <p className="text-[10px] text-gray-650 mt-1 uppercase tracking-widest font-semibold">
          Simulateur Mobile React Native interfacé avec REST-API (Express server).
        </p>
      </footer>
    </div>
  );
}
