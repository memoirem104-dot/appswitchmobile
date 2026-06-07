import React, { useState } from 'react';
import { 
  User, 
  Garde, 
  GardeExchange, 
  SimulatedNotification, 
  ProfessionType, 
  ExchangeType 
} from '../types';
import { 
  Wifi, 
  Battery, 
  Signal, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  User as UserIcon, 
  Send, 
  Bell, 
  Repeat, 
  BadgeEuro, 
  Trash2, 
  ShieldAlert, 
  CheckCircle, 
  Check, 
  LogOut,
  Hospital,
  AlertCircle
} from 'lucide-react';

interface PhoneSimulatorProps {
  currentUser: User | null;
  allUsers: User[];
  gardes: Garde[];
  exchanges: GardeExchange[];
  notifications: SimulatedNotification[];
  token: string | null;
  onLogin: (email: string) => Promise<void>;
  onRegister: (data: any) => Promise<void>;
  onLogout: () => void;
  onCreateGarde: (data: any) => Promise<void>;
  onDeleteGarde: (id: string) => Promise<void>;
  onCreateExchange: (data: any) => Promise<void>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedGardeId: string | null;
  setSelectedGardeId: (id: string | null) => void;
}

export default function PhoneSimulator({
  currentUser,
  allUsers,
  gardes,
  exchanges,
  notifications,
  token,
  onLogin,
  onRegister,
  onLogout,
  onCreateGarde,
  onDeleteGarde,
  onCreateExchange,
  activeTab,
  setActiveTab,
  selectedGardeId,
  setSelectedGardeId
}: PhoneSimulatorProps) {
  // Mobile UI States
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [emailInput, setEmailInput] = useState('dr.ahmed@switchgard.tn');
  
  // Register inputs
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regProfession, setRegProfession] = useState<ProfessionType>('doctor');
  const [regPhone, setRegPhone] = useState('');
  const [regHospital, setRegHospital] = useState('');
  
  // CRUD guard inputs
  const [isCreatingGarde, setIsCreatingGarde] = useState(false);
  const [gardeForm, setGardeForm] = useState({
    date: new Date().toISOString().split('T')[0],
    timeStart: '08:00',
    timeEnd: '20:00',
    lieu: 'Hôpital Militaire de Tunis',
    latitude: 36.7995,
    longitude: 10.1650,
    notes: 'Urgentiste de garde pour le service pédiatrique.'
  });

  // Exchange inputs
  const [isInitiatingExchange, setIsInitiatingExchange] = useState<Garde | null>(null);
  const [exchangeType, setExchangeType] = useState<ExchangeType>('exchange');
  const [targetUserId, setTargetUserId] = useState('');
  const [targetGardeId, setTargetGardeId] = useState('');
  const [salePrice, setSalePrice] = useState('150');
  const [motivationText, setMotivationText] = useState('Besoin de remplacer ma garde pour obligations de formation.');

  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    try {
      if (authMode === 'login') {
        await onLogin(emailInput);
      } else {
        await onRegister({
          email: regEmail,
          fullName: regFullName,
          role: 'professional',
          profession: regProfession,
          phoneNumber: regPhone || '+216 98 999 888',
          hospitalName: regHospital || 'Clinique Municipale Tunis'
        });
      }
    } catch (err: any) {
      setErrorText(err.message || 'Erreur lors de l’authentification.');
    }
  };

  const handleCreateGardeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setSuccessText(null);
    try {
      await onCreateGarde({
        ...gardeForm,
        type: currentUser?.profession || 'doctor'
      });
      setIsCreatingGarde(false);
      setSuccessText('Garde créée avec succès !');
      setTimeout(() => setSuccessText(null), 3000);
    } catch (err: any) {
      setErrorText(err.message || 'Impossible de créer la garde.');
    }
  };

  const handleRequestExchangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isInitiatingExchange) return;
    setErrorText(null);
    setSuccessText(null);
    try {
      await onCreateExchange({
        gardeId: isInitiatingExchange.id,
        type: exchangeType,
        proposedToUserId: targetUserId || undefined,
        targetGardeId: exchangeType === 'exchange' ? (targetGardeId || undefined) : undefined,
        price: exchangeType === 'sale' ? Number(salePrice) : undefined,
        motivation: motivationText
      });
      setIsInitiatingExchange(null);
      setSuccessText('Demande envoyée ! Workflow administratif initialisé (N1).');
      setTimeout(() => setSuccessText(null), 4000);
    } catch (err: any) {
      setErrorText(err.message || 'Impossible d\'initier la demande.');
    }
  };

  // Filter guards based on profession, status, etc.
  const myGardes = gardes.filter(g => g.creatorId === currentUser?.id);
  const activeExchanges = exchanges.filter(ex => ex.requesterId === currentUser?.id);
  const userNotifications = notifications.filter(n => n.userId === currentUser?.id);

  // Quick switch logins for testing
  const quickLogins = [
    { name: 'Dr. Ahmed (Méd)', email: 'dr.ahmed@switchgard.tn' },
    { name: 'Sarah (Pharm)', email: 'pharm.sarah@switchgard.tn' },
    { name: 'Ali (Pompier)', email: 'pompier.ali@switchgard.tn' },
    { name: 'Majdi (Urgence)', email: 'urg.majdi@switchgard.tn' }
  ];

  return (
    <div id="iphone-device-frame" className="relative mx-auto max-w-[390px] w-full h-[760px] bg-[#0A0A0B] rounded-[45px] p-3 shadow-2xl border-[9px] border-white/5 flex flex-col overflow-hidden">
      
      {/* Smartphone Notch & Status Bar */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-[18px] bg-[#121214] rounded-full z-50 flex items-center justify-center">
        <span className="w-1.5 h-1.5 bg-white/20 rounded-full mr-2"></span>
        <span className="w-8 h-1 bg-[#0A0A0B] rounded-full"></span>
      </div>

      <div className="pt-2 px-6 pb-2.5 flex justify-between items-center text-gray-400 text-[10px] font-mono select-none bg-[#0A0A0B] z-40">
        <span>09:41</span>
        <div className="flex items-center gap-1.5">
          <Signal className="w-3 h-3" />
          <span className="text-[9px]">4G</span>
          <Wifi className="w-3 h-3" />
          <Battery className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
        </div>
      </div>

      {/* Main Screen Container */}
      <div className="flex-1 rounded-[32px] bg-[#0A0A0B] border border-white/5 overflow-y-auto flex flex-col relative">
        
        {/* Alerts Center Message Bubble (Live alert preview on phone) */}
        {successText && (
          <div className="absolute top-4 left-3 right-3 bg-green-500/10 border border-green-500/25 text-green-400 p-2.5 rounded-xl text-[11px] flex items-center gap-2 z-50 shadow-lg">
            <CheckCircle className="w-4 h-4 shrink-0 text-green-400" />
            <div>
              <p className="font-bold text-green-300">Confirmation</p>
              <p className="text-[10px]">{successText}</p>
            </div>
          </div>
        )}

        {/* --- AUTH SCREEN --- */}
        {!token ? (
          <div className="flex-1 flex flex-col justify-between p-6 bg-[#0A0A0B] text-gray-200 font-sans">
            <div>
              <div className="text-center mt-6">
                <span className="inline-flex items-center justify-center p-3.5 bg-blue-500/10 rounded-3xl border border-white/5 mb-2">
                  <Repeat className="w-8 h-8 text-blue-500 animate-spin-slow" />
                </span>
                <h2 className="text-xl font-bold tracking-tight text-white">Switch<span className="text-blue-500">Gard</span> Mobile</h2>
                <p className="text-[11px] text-gray-400 mt-1 max-w-[240px] mx-auto leading-normal">
                  Échange de gardes certifié avec validation administrative multiniveau (N1, N2, Directeurs)
                </p>
              </div>

              {/* Login/Register Form */}
              <form onSubmit={handleAuth} className="mt-6 space-y-3">
                {errorText && (
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-[11px] flex gap-1.5 items-center">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorText}</span>
                  </div>
                )}

                {authMode === 'login' ? (
                  <div>
                    <label className="block text-[10px] text-gray-450 font-bold mb-1 uppercase tracking-wider">Identifiant Email Professionnel</label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full py-2 px-3 text-xs bg-[#121214] border border-white/5 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="votre_nom@switchgard.tn"
                    />
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] text-gray-450 font-bold mb-1 uppercase tracking-wider">Nom complet & Titre</label>
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        className="w-full py-2 px-3 text-xs bg-[#121214] border border-white/5 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="Dr. Meriem Ghrab"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-450 font-bold mb-1 uppercase tracking-wider">Email pro (Unique)</label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full py-2 px-3 text-xs bg-[#121214] border border-white/5 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="meriem@switchgard.tn"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-450 font-bold mb-1 uppercase tracking-wider">Métier / Corps</label>
                        <select
                          value={regProfession}
                          onChange={(e) => setRegProfession(e.target.value as ProfessionType)}
                          className="w-full py-2 px-2 text-xs bg-[#121214] border border-white/5 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="doctor">Médecin</option>
                          <option value="pharmacist">Pharmacien</option>
                          <option value="firefighter">Pompier</option>
                          <option value="emergency">Urgentiste</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-450 font-bold mb-1 uppercase tracking-wider">Service d'Attache</label>
                        <input
                          type="text"
                          value={regHospital}
                          onChange={(e) => setRegHospital(e.target.value)}
                          className="w-full py-2 px-2 text-xs bg-[#121214] border border-white/5 rounded-lg text-white focus:outline-none focus:border-blue-500"
                          placeholder="Hôpital Ch. Nicolle"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-450 font-bold mb-1 uppercase tracking-wider">Téléphone (Alerte SMS)</label>
                      <input
                        type="text"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full py-2 px-3 text-xs bg-[#121214] border border-white/5 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="+216 98 000 000"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 mt-2 text-xs font-bold text-center text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/10"
                >
                  {authMode === 'login' ? 'Se connecter' : 'Créer mon profil'}
                </button>
              </form>

              {/* Toggle Connection View */}
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="w-full text-center text-[11px] text-blue-400 mt-3.5 hover:underline"
              >
                {authMode === 'login' ? "Nouveau praticien ? Créer un profil" : "Déjà enregistré ? Connexion"}
              </button>
            </div>

            {/* Quick-simulate account selector */}
            <div className="border-t border-white/5 pt-3 mt-4">
              <span className="text-[9px] text-gray-500 block text-center mb-2 font-bold tracking-wider uppercase">SIMULER CONNEXION RAPIDE</span>
              <div className="grid grid-cols-2 gap-1.5">
                {quickLogins.map(l => (
                  <button
                    key={l.email}
                    onClick={() => {
                      setEmailInput(l.email);
                      onLogin(l.email);
                    }}
                    type="button"
                    className="py-1 px-2 text-[9px] font-bold bg-[#121214] hover:bg-white/5 border border-white/5 text-gray-300 rounded text-left truncate transition-colors"
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full font-sans text-gray-200">
            
            {/* Native Mobile Header banner */}
            <div className="px-4 py-3 bg-[#121214] border-b border-white/5 flex items-center justify-between sticky top-0 z-30">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  currentUser?.profession === 'doctor' ? 'bg-green-500' :
                  currentUser?.profession === 'pharmacist' ? 'bg-blue-500' :
                  currentUser?.profession === 'firefighter' ? 'bg-rose-500' : 'bg-amber-500'
                }`}></span>
                <div>
                  <h3 className="text-xs font-bold truncate max-w-[150px] text-white">{currentUser?.fullName}</h3>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                    {currentUser?.profession} • {currentUser?.hospitalName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={onLogout}
                  title="Déconnexion"
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg text-[10px] flex items-center gap-1 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Simulated inner content container body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              
              {/* TAB 1: LIVE MAPS & OFFERS */}
              {activeTab === 'home' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gardes de la Communauté</h2>
                    <span className="text-[10px] bg-white/5 border border-white/5 px-2 py-0.5 rounded-full text-gray-400 font-semibold">{gardes.length} total</span>
                  </div>

                  {/* Micro list of guard slots */}
                  <div className="space-y-2.5">
                    {gardes.map(g => {
                      const isOwner = g.creatorId === currentUser?.id;
                      const isProposed = g.status.includes('proposed');
                      const isCompleted = g.status.includes('completed');
                      
                      return (
                        <div 
                          key={g.id} 
                          onClick={() => setSelectedGardeId(g.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            selectedGardeId === g.id ? 'border-blue-500 bg-[#121214] shadow-lg shadow-blue-500/10' : 'border-white/5 hover:border-white/10 bg-[#121214]/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5 mb-1.5">
                            <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded uppercase ${
                              g.type === 'doctor' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                              g.type === 'pharmacist' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              g.type === 'firefighter' ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            }`}>
                              {g.type === 'doctor' ? 'Médecin' : g.type === 'pharmacist' ? 'Pharmacien' : g.type === 'firefighter' ? 'Pompier' : 'Urgence'}
                            </span>

                            <span className="text-[10px] font-bold text-gray-400">{g.date}</span>
                          </div>

                          <h3 className="text-xs font-bold text-white leading-snug line-clamp-1">{g.lieu}</h3>
                          
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-450 mt-1">
                            <Clock className="w-3.5 h-3.5 text-gray-500" />
                            <span>{g.timeStart} - {g.timeEnd}</span>
                            <span className="text-gray-650">•</span>
                            <span className="text-gray-300">Pr: {g.creatorName}</span>
                          </div>

                          {g.notes && <p className="text-[9.5px] text-gray-400 italic line-clamp-1 mt-1 font-sans">"{g.notes}"</p>}

                          {/* Quick interactions */}
                          <div className="mt-2.5 pt-2.5 border-t border-white/5 flex justify-between items-center bg-slate-910">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                              g.status === 'available' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                              isCompleted ? 'bg-white/5 border-white/5 text-gray-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}>
                              {g.status === 'available' ? 'Disponible' : isCompleted ? 'Exécuté' : 'Transaction initiée'}
                            </span>

                            {g.status === 'available' && !isOwner && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsInitiatingExchange(g);
                                }}
                                className="px-2.5 py-1 text-[9.5px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 shadow-sm transition-all"
                              >
                                <Repeat className="w-2.5 h-2.5" />
                                Échanger / Transférer
                              </button>
                            )}

                            {isOwner && (
                              <span className="text-[9px] text-blue-400 font-bold font-mono">Ma garde ⭐️</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: MES GARDES (My Guards & CRUD) */}
              {activeTab === 'my_guards' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mes Obligations de Garde</h2>
                    <button
                      onClick={() => setIsCreatingGarde(!isCreatingGarde)}
                      className="px-2.5 py-1 text-[10px] font-bold bg-blue-600 text-white rounded-lg flex items-center gap-1 hover:bg-blue-700 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isCreatingGarde ? 'Fermer' : 'Ajouter'}
                    </button>
                  </div>

                  {/* Create Guard Form Dropdown */}
                  {isCreatingGarde && (
                    <form onSubmit={handleCreateGardeSubmit} className="p-3.5 bg-[#121214] rounded-xl border border-white/5 space-y-2.5 animate-fadeIn">
                      <h3 className="text-xs font-bold text-blue-400">Nouvelle obligation de Garde</h3>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-gray-450 mb-0.5 font-bold">Date</label>
                          <input
                            type="date"
                            required
                            value={gardeForm.date}
                            onChange={(e) => setGardeForm({...gardeForm, date: e.target.value})}
                            className="w-full py-1.5 px-2 text-xs bg-[#0A0A0B] border border-white/5 rounded-lg text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-gray-450 mb-0.5 font-bold">Service</label>
                          <input
                            type="text"
                            disabled
                            value={currentUser?.profession?.toUpperCase() || 'MÉDECIN'}
                            className="w-full py-1.5 px-2 text-xs bg-[#0A0A0B]/65 border border-white/5 rounded-lg text-gray-400 font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-gray-450 mb-0.5 font-bold">Début</label>
                          <input
                            type="text"
                            required
                            value={gardeForm.timeStart}
                            placeholder="08:00"
                            onChange={(e) => setGardeForm({...gardeForm, timeStart: e.target.value})}
                            className="w-full py-1.5 px-2 text-xs bg-[#0A0A0B] border border-white/5 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-gray-450 mb-0.5 font-bold">Fin</label>
                          <input
                            type="text"
                            required
                            value={gardeForm.timeEnd}
                            placeholder="20:00"
                            onChange={(e) => setGardeForm({...gardeForm, timeEnd: e.target.value})}
                            className="w-full py-1.5 px-2 text-xs bg-[#0A0A0B] border border-white/5 rounded-lg text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-gray-450 mb-0.5 font-bold">Lieu / Établissement</label>
                        <input
                          type="text"
                          required
                          value={gardeForm.lieu}
                          onChange={(e) => setGardeForm({...gardeForm, lieu: e.target.value})}
                          className="w-full py-1.5 px-2 text-xs bg-[#0A0A0B] border border-white/5 rounded-lg text-white"
                          placeholder="ex: Clinique Amen Tunis"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-gray-450 mb-0.5 font-bold">Latitude (Map)</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={gardeForm.latitude}
                            onChange={(e) => setGardeForm({...gardeForm, latitude: Number(e.target.value)})}
                            className="w-full py-1.5 px-2 text-xs bg-[#0A0A0B] border border-white/5 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-gray-450 mb-0.5 font-bold">Longitude (Map)</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={gardeForm.longitude}
                            onChange={(e) => setGardeForm({...gardeForm, longitude: Number(e.target.value)})}
                            className="w-full py-1.5 px-2 text-xs bg-[#0A0A0B] border border-white/5 rounded-lg text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-gray-450 mb-0.5 font-bold">Notes internes</label>
                        <textarea
                          value={gardeForm.notes}
                          onChange={(e) => setGardeForm({...gardeForm, notes: e.target.value})}
                          rows={2}
                          className="w-full py-1.5 px-2 text-[11px] bg-[#0A0A0B] border border-white/5 rounded-lg text-white focus:outline-none"
                          placeholder="Précisez votre service..."
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition"
                      >
                        Enregistrer l'obligation
                      </button>
                    </form>
                  )}

                  {/* List of my own guards */}
                  <div className="space-y-2.5">
                    {myGardes.length === 0 ? (
                      <div className="p-4 bg-[#121214] rounded-xl border border-white/5 text-center">
                        <Calendar className="w-6 h-6 text-gray-500 mx-auto mb-1.5" />
                        <p className="text-[11px] text-gray-400">Vous n'avez pas de garde assignée.</p>
                      </div>
                    ) : (
                      myGardes.map(g => (
                        <div key={g.id} className="p-3 bg-[#121214] rounded-xl border border-white/5 space-y-2">
                          <div className="flex justify-between items-start gap-1">
                            <div>
                               <p className="text-[10px] text-gray-400 font-mono font-bold">{g.date} • {g.timeStart}-{g.timeEnd}</p>
                               <h4 className="text-xs font-bold text-white leading-tight">{g.lieu}</h4>
                            </div>
                            <button
                              onClick={() => onDeleteGarde(g.id)}
                              title="Annuler/Supprimer de mon planning"
                              className="p-1 text-gray-500 hover:text-rose-400 hover:bg-[#0A0A0B] rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-[10px] pt-2 border-t border-white/5">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                              g.status === 'available' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                            }`}>
                              Status: {g.status.toUpperCase()}
                            </span>

                            {g.status === 'available' && (
                              <button
                                onClick={() => setIsInitiatingExchange(g)}
                                className="px-2 py-0.5 text-[9.5px] bg-[#0A0A0B] border border-blue-500/30 text-blue-400 font-bold rounded-lg hover:bg-blue-500/15"
                              >
                                Initier Échange / Vente
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* DOCK OVERLAY: EXCHANGE INITIATOR PROMPT */}
              {isInitiatingExchange && (
                <div className="p-4 bg-[#121214] border border-white/5 rounded-xl animate-fadeIn space-y-3 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                    <h3 className="text-xs font-bold text-blue-400 flex items-center gap-1">
                      <Repeat className="w-3.5 h-3.5" /> Échange de Garde
                    </h3>
                    <button onClick={() => setIsInitiatingExchange(null)} className="text-xs text-gray-400 hover:text-white">
                      Fermer
                    </button>
                  </div>

                  <p className="text-[10.5px] text-gray-300 leading-normal">
                    Proposer l'obligation à <b className="text-white">{isInitiatingExchange.lieu} ({isInitiatingExchange.date})</b>.
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setExchangeType('exchange')}
                      className={`py-1.5 text-[10.5px] font-bold rounded-lg border text-center transition-all ${
                        exchangeType === 'exchange' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-[#0A0A0B] text-gray-400 border-white/5'
                      }`}
                    >
                      Échanger
                    </button>
                    <button
                      type="button"
                      onClick={() => setExchangeType('sale')}
                      className={`py-1.5 text-[10.5px] font-bold rounded-lg border text-center transition-all ${
                        exchangeType === 'sale' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-[#0A0A0B] text-gray-400 border-white/5'
                      }`}
                    >
                      Vendre la Garde
                    </button>
                  </div>

                  {exchangeType === 'exchange' ? (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-gray-450 font-bold mb-0.5">Collègue ciblé (Facultatif)</label>
                        <select
                          value={targetUserId}
                          onChange={(e) => setTargetUserId(e.target.value)}
                          className="w-full py-1.5 px-2.5 text-[11px] bg-[#0A0A0B] border border-white/5 text-white rounded-lg focus:outline-none"
                        >
                          <option value="">-- Tout collègue volontaire --</option>
                          {allUsers
                            .filter(u => u.id !== currentUser?.id && u.role === 'professional')
                            .map(u => (
                              <option key={u.id} value={u.id}>{u.fullName} ({u.profession})</option>
                            ))
                          }
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-gray-450 font-bold mb-0.5">En Échange de (Offrir une autre garde)</label>
                        <select
                          value={targetGardeId}
                          onChange={(e) => setTargetGardeId(e.target.value)}
                          className="w-full py-1.5 px-2.5 text-[11px] bg-[#0A0A0B] border border-white/5 text-white rounded-lg focus:outline-none"
                        >
                          <option value="">-- Aucune garde en retour --</option>
                          {gardes
                            .filter(g => g.creatorId !== currentUser?.id && g.status === 'available')
                            .map(g => (
                              <option key={g.id} value={g.id}>{g.lieu} ({g.date})</option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-gray-450 font-bold mb-0.5">Acheteur Ciblé (Optionnel)</label>
                        <select
                          value={targetUserId}
                          onChange={(e) => setTargetUserId(e.target.value)}
                          className="w-full py-1.5 px-2.5 text-[11px] bg-[#0A0A0B] border border-white/5 text-white rounded-lg focus:outline-none"
                        >
                          <option value="">-- Tout praticien disponible --</option>
                          {allUsers
                            .filter(u => u.id !== currentUser?.id && u.role === 'professional')
                            .map(u => (
                              <option key={u.id} value={u.id}>{u.fullName} ({u.profession})</option>
                            ))
                          }
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-gray-450 font-bold mb-0.5">Indemnité de transfert (€ / TND)</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={salePrice}
                            onChange={(e) => setSalePrice(e.target.value)}
                            className="w-full py-1.5 pl-8 pr-2.5 text-xs bg-[#0A0A0B] border border-white/5 rounded-lg text-white focus:outline-none"
                          />
                          <BadgeEuro className="w-4 h-4 text-gray-450 absolute left-2.5 top-2" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-gray-450 font-bold mb-0.5">Motivation du changement</label>
                    <textarea
                      value={motivationText}
                      onChange={(e) => setMotivationText(e.target.value)}
                      rows={2}
                      className="w-full py-1.5 px-2.5 text-[10.5px] bg-[#0A0A0B] border border-white/5 text-white rounded-lg focus:outline-none"
                      placeholder="Indiquez la raison règlementaire..."
                    />
                  </div>

                  <button
                    onClick={handleRequestExchangeSubmit}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 shadow transition"
                  >
                    <Send className="w-3 h-3" /> Transmettre pour Validation
                  </button>
                </div>
              )}

              {/* TAB 3: WORKFLOW STATUS / TRANSACTIONS */}
              {activeTab === 'transactions' && (
                <div className="space-y-4">
                  <h2 className="text-xs font-bold text-gray-450 uppercase tracking-wider">Suivi des Validations Ségur</h2>
                  
                  {activeExchanges.length === 0 ? (
                    <div className="p-4 bg-[#121214] rounded-xl border border-white/5 text-center">
                      <Repeat className="w-6 h-6 text-gray-550 mx-auto mb-1.5" />
                      <p className="text-[11px] text-gray-400">Aucun échange ou transfert en cours.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeExchanges.map(ex => {
                        const originalG = gardes.find(g => g.id === ex.gardeId);
                        
                        return (
                          <div key={ex.id} className="p-3.5 bg-[#121214] rounded-xl border border-white/5 space-y-3">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className={`px-2 py-0.5 text-[8.5px] border font-mono font-bold rounded-full uppercase ${
                                  ex.type === 'exchange' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'
                                }`}>
                                  {ex.type === 'exchange' ? 'Échange' : 'Vente'}
                                </span>
                                <span className="text-[9px] text-gray-500 font-bold">{new Date(ex.createdAt).toLocaleDateString()}</span>
                              </div>
                              <h4 className="text-xs font-bold text-white line-clamp-1">{originalG?.lieu || 'Obligation'}</h4>
                              <p className="text-[10px] text-blue-400 font-bold">Bénéficiaire : {ex.proposedToUserName || 'Candidat libre'}</p>
                            </div>

                            {/* Workflow Step Tracker (N1 -> N2 -> Health Director -> Project Director) */}
                            <div className="bg-[#0A0A0B]/80 p-2.5 rounded-lg border border-white/5 space-y-2">
                              <span className="text-[9px] text-gray-400 font-bold uppercase block">Workflow validation</span>
                              
                              <div className="flex items-center justify-between relative pt-1 pb-1">
                                {/* Connecting line */}
                                <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-white/5 -translate-y-1/2 z-0"></div>
                                
                                {/* Status pipeline levels */}
                                {[
                                  { label: 'N1', key: 'n1', labelFull: 'Resp. N1' },
                                  { label: 'N2', key: 'n2', labelFull: 'Resp. N2' },
                                  { label: 'DS', key: 'health_director', labelFull: 'Dir. Santé' },
                                  { label: 'DP', key: 'project_director', labelFull: 'Dir. Projet' }
                                ].map((step, idx) => {
                                  // Determine status of this step
                                  let isComplete = false;
                                  let isCurrent = false;

                                  const stepOrder = ['n1', 'n2', 'health_director', 'project_director', 'done'];
                                  const currentIdx = stepOrder.indexOf(ex.currentStep);
                                  const thisIdx = stepOrder.indexOf(step.key);

                                  if (thisIdx < currentIdx) {
                                    isComplete = true;
                                  } else if (thisIdx === currentIdx) {
                                    isCurrent = true;
                                  }

                                  const historyForStep = ex.history.find(h => h.step === step.key);
                                  const isRejected = historyForStep?.action === 'rejected';

                                  return (
                                    <div key={step.key} className="flex flex-col items-center z-10">
                                      <div title={step.labelFull} className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border transition-colors ${
                                        isRejected ? 'bg-rose-500/10 border-rose-500/35 text-rose-400' :
                                        isComplete ? 'bg-blue-600 border-blue-500 text-white' :
                                        isCurrent ? 'bg-amber-500/15 border-amber-500/25 text-amber-500 animate-pulse' :
                                        'bg-[#0A0A0B] border-white/5 text-gray-550'
                                      }`}>
                                        {isRejected ? '✕' : isComplete ? '✓' : step.label}
                                      </div>
                                      <span className="text-[7.5px] mt-1 text-gray-450 uppercase font-bold tracking-tight">{step.label}</span>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Latest History review message */}
                              {ex.history.length > 0 && (
                                <div className="mt-1 pb-1 border-t border-white/5 pt-1.5">
                                  {(() => {
                                    const latest = ex.history[ex.history.length - 1];
                                    return (
                                      <p className="text-[9.5px] text-gray-400 leading-normal">
                                        <b className="text-gray-300 font-bold">{latest.reviewerName}</b> : 
                                        <span className={`mx-1 text-[9px] font-bold font-mono rounded px-1.5 py-0.5 ${latest.action === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                          {latest.action === 'approved' ? 'Approuvé' : 'Rejeté'}
                                        </span>
                                        {latest.comment && <span className="text-gray-405 italic">"{latest.comment}"</span>}
                                      </p>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ALERTES (Notifications output log) */}
              {activeTab === 'notifications' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">SMS, Emails & Push reçus</h2>
                    <span className="text-[9px] bg-slate-850 px-2 py-0.5 rounded text-slate-400 font-semibold">{userNotifications.length} reçus</span>
                  </div>

                  <div className="space-y-2">
                    {userNotifications.length === 0 ? (
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center text-slate-500">
                        <Bell className="w-6 h-6 mx-auto mb-1 text-slate-650" />
                        <p className="text-[11px]">Aucune notification reçue pour le moment.</p>
                      </div>
                    ) : (
                      userNotifications.map(n => {
                        let badgeColor = "bg-indigo-950 text-indigo-400";
                        if (n.medium === 'sms') badgeColor = "bg-emerald-950 text-emerald-400";
                        if (n.medium === 'email') badgeColor = "bg-sky-950 text-sky-400";
                        
                        return (
                          <div key={n.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 animate-fadeIn">
                            <div className="flex justify-between items-start">
                              <span className={`px-1.5 py-0.5 text-[8px] font-mono uppercase rounded-full ${badgeColor}`}>
                                {n.medium}
                              </span>
                              <span className="text-[8px] text-slate-550 font-mono text-slate-500">
                                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-slate-200">{n.title}</h4>
                            <p className="text-[10.5px] text-slate-400 leading-normal">{n.message}</p>
                            
                            <div className="pt-1.5 border-t border-slate-900 flex justify-between items-center bg-slate-910">
                              <span className="text-[8.5px] text-slate-500 font-mono truncate">{n.destination}</span>
                              <span className="text-[8.5px] text-emerald-500 font-bold tracking-tight">Délivré ✓</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Simulated iPhone Navigation Tab Bar */}
            <div className="px-3 py-2.5 bg-[#121214] border-t border-white/5 flex justify-around items-center sticky bottom-0 z-30 select-none">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                  activeTab === 'home' ? 'text-blue-400 bg-white/5' : 'text-gray-500 hover:text-white'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span className="text-[8.5px] font-bold">Flux / Carte</span>
              </button>

              <button
                onClick={() => setActiveTab('my_guards')}
                className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                  activeTab === 'my_guards' ? 'text-blue-400 bg-white/5' : 'text-gray-500 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="text-[8.5px] font-bold">Planning</span>
              </button>

              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex flex-col items-center gap-1 py-1 px-2.5 relative rounded-xl transition-all ${
                  activeTab === 'transactions' ? 'text-blue-400 bg-white/5' : 'text-gray-500 hover:text-white'
                }`}
              >
                <Repeat className="w-4 h-4" />
                <span className="text-[8.5px] font-bold">Validations</span>
                {activeExchanges.length > 0 && (
                  <span className="absolute top-1 right-2.5 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex flex-col items-center gap-1 py-1 px-2.5 relative rounded-xl transition-all ${
                  activeTab === 'notifications' ? 'text-blue-400 bg-white/5' : 'text-gray-500 hover:text-white'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span className="text-[8.5px] font-bold">Alertes</span>
                {userNotifications.length > 0 && (
                  <span className="absolute top-1 right-2.5 w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
                )}
              </button>
            </div>
            
          </div>
        )}
      </div>

      {/* Decorative Home Indicator Bar for iPhone */}
      <div className="absolute bottom-1 right-1/2 translate-x-1/2 w-28 h-1 bg-white/10 rounded-full"></div>
    </div>
  );
}
