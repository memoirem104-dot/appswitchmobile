import React, { useState } from 'react';
import { 
  User, 
  Garde, 
  GardeExchange, 
  UserRole, 
  SimulatedNotification 
} from '../types';
import { 
  Users, 
  FileCheck, 
  Check, 
  X, 
  MessageSquare, 
  ArrowRight, 
  Briefcase, 
  Hospital, 
  Info,
  RefreshCw,
  TrendingDown,
  BadgeEuro
} from 'lucide-react';

interface AdminConsoleProps {
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  exchanges: GardeExchange[];
  gardes: Garde[];
  users: User[];
  onApproveExchange: (id: string, action: 'approved' | 'rejected', comment: string) => Promise<void>;
  onResetDatabase: () => Promise<void>;
}

export default function AdminConsole({
  currentUserRole,
  setCurrentUserRole,
  exchanges,
  gardes,
  users,
  onApproveExchange,
  onResetDatabase
}: AdminConsoleProps) {
  const [selectedExchangeId, setSelectedExchangeId] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('Dossier administratif approuvé. Conforme à la charte hospitalière Ségur.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Filter exchanges that are pending validation at some levels
  const pendingExchanges = exchanges.filter(e => e.status !== 'approved' && e.status !== 'rejected');
  const pastExchanges = exchanges.filter(e => e.status === 'approved' || e.status === 'rejected');

  const selectedEx = exchanges.find(e => e.id === selectedExchangeId);

  // Roles details
  const validatorRoles: { role: UserRole; label: string; desc: string; color: string }[] = [
    { role: 'n1', label: 'Validateur N1', desc: 'Surveillant général d’établissement', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { role: 'n2', label: 'Validateur N2', desc: 'Directeur des ressources humaines', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { role: 'director_health', label: 'Directeur Santé', desc: 'Comité de la santé régionale', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
    { role: 'director_project', label: 'Directeur Projet', desc: 'Maître d’ouvrage SwitchGard', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    { role: 'admin', label: 'Administrateur', desc: 'Contrôleur suprême (peut forcer toute étape)', color: 'bg-amber-500/10 text-amber-500 border-amber-500/25' },
    { role: 'professional', label: 'Praticien', desc: 'Profil médecin/pharmacien (vue mobile)', color: 'bg-white/5 text-gray-400 border-white/5' }
  ];

  const getStepAssigneeRole = (step: string): UserRole => {
    switch (step) {
      case 'n1': return 'n1';
      case 'n2': return 'n2';
      case 'health_director': return 'director_health';
      case 'project_director': return 'director_project';
      default: return 'admin';
    }
  };

  const currentRoleDetails = validatorRoles.find(r => r.role === currentUserRole);

  const handleReview = async (action: 'approved' | 'rejected') => {
    if (!selectedExchangeId) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await onApproveExchange(selectedExchangeId, action, reviewComment);
      setFeedback(`Transaction traitée : ${action === 'approved' ? 'Approuvée ✓' : 'Refusée ✕'}. Le workflow de garde a été mis à jour.`);
      setReviewComment('Dossier approuvé.');
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback(`Erreur: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="admin-management-console" className="bg-[#0A0A0B] border border-white/5 rounded-2xl p-5 shadow-2xl flex flex-col h-full space-y-4">
      
      {/* Top Banner & Reset Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-3">
        <div>
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400 animate-pulse" />
            Console administrative de Validation Ségur (N1, N2, Directeurs)
          </h2>
          <p className="text-xs text-gray-450 font-bold mt-0.5">
            Simulez la chaîne de validation interne pour approuver les mutations de gardes d'un clic.
          </p>
        </div>
        
        <button
          onClick={onResetDatabase}
          className="px-3 py-1.5 text-[11px] self-start md:self-auto font-bold bg-[#121214] hover:bg-white/5 text-gray-300 border border-white/5 rounded-xl flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
          Réinitialiser Simulation
        </button>
      </div>

      {/* Role Switcher Toolbar */}
      <div className="bg-[#121214] p-4 rounded-2xl border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-450 uppercase tracking-wider">Identité Simulée Actuelle (Sélectionnez un rôle pour tester)</span>
          <span className="px-2.5 py-0.5 text-[10px] font-bold font-mono rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {currentUserRole.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {validatorRoles.map((v) => {
            const isSelected = currentUserRole === v.role;
            return (
              <button
                key={v.role}
                onClick={() => {
                  setCurrentUserRole(v.role);
                  setFeedback(null);
                }}
                className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-900/10' : 'bg-[#0A0A0B] hover:bg-[#121214] text-gray-400 border-white/5'
                }`}
              >
                <div className="font-bold text-[11px] truncate">{v.label}</div>
                <div className="text-[8px] text-gray-500 font-bold mt-0.5 truncate">{v.role === 'professional' ? 'Flux Pro' : 'Validateur'}</div>
              </button>
            );
          })}
        </div>
        
        <p className="text-[11px] text-gray-400 animate-fadeIn italic leading-tight">
          👉 <b>Actuel :</b> {currentRoleDetails?.desc}
        </p>
      </div>

      {/* Main Validation workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        
        {/* Left pane: Pending validation requests */}
        <div className="lg:col-span-5 space-y-3 flex flex-col min-h-[220px]">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Demandes en attente de visa</h3>
          
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[260px] lg:max-h-none border border-white/5 p-2 rounded-xl bg-[#121214]/30">
            {pendingExchanges.length === 0 ? (
              <div className="p-6 text-center text-gray-550 flex flex-col justify-center items-center h-full">
                <FileCheck className="w-8 h-8 text-gray-600 mb-2" />
                <p className="text-xs font-bold">Aucune transaction active</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Toutes les demandes de garde ont été approuvées ou archivées.</p>
              </div>
            ) : (
              pendingExchanges.map(ex => {
                const originalG = gardes.find(g => g.id === ex.gardeId);
                const isMyValidationStep = currentUserRole === 'admin' || currentUserRole === getStepAssigneeRole(ex.currentStep);
                
                return (
                  <div
                    key={ex.id}
                    onClick={() => {
                      setSelectedExchangeId(ex.id);
                      setFeedback(null);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedExchangeId === ex.id 
                        ? 'bg-[#121214] border-blue-500/50 shadow-lg' 
                        : 'bg-[#121214]/60 hover:bg-[#121214] border-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase border ${
                        ex.type === 'exchange' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}>
                        {ex.type === 'exchange' ? 'Échange' : 'Vente'}
                      </span>
                      <span className="text-[8px] font-mono font-bold text-amber-500 bg-amber-500/15 border border-amber-500/25 px-1.5 py-0.5 rounded-lg uppercase">
                        Étape : {ex.currentStep.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-1">{originalG?.lieu}</h4>
                    <p className="text-[10px] text-gray-400 mt-1"> Demandeur : <span className="text-gray-300 font-bold">{ex.requesterName}</span></p>
                    
                    {isMyValidationStep ? (
                      <div className="mt-2 text-[9.5px] font-bold text-blue-400 animate-pulse flex items-center gap-1">
                        ● Action requise sous votre rôle actuel !
                      </div>
                    ) : (
                      <div className="mt-2 text-[8.5px] text-gray-550 font-bold">
                        En attente du rôle: {getStepAssigneeRole(ex.currentStep).toUpperCase()}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right pane: Review transaction form details */}
        <div className="lg:col-span-7 bg-[#121214]/60 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
          {selectedEx ? (
            <div className="space-y-4">
              <div className="border-b border-white/5 pb-2">
                <h3 className="text-sm font-bold text-white">Détails d'approbation réglementaire</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">ID: {selectedEx.id} • Proposé le {new Date(selectedEx.createdAt).toLocaleDateString()}</p>
              </div>

              {feedback && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs leading-normal font-bold">
                  {feedback}
                </div>
              )}

              {/* Core Information Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-0.5 bg-[#0A0A0B]/60 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[9px] text-gray-450 font-bold uppercase tracking-wider block">Demandeur d'Échange</span>
                  <p className="font-bold text-gray-300">{selectedEx.requesterName}</p>
                </div>

                <div className="space-y-0.5 bg-[#0A0A0B]/60 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[9px] text-gray-450 font-bold uppercase tracking-wider block">Bénéficiaire Ciblé</span>
                  <p className="font-bold text-gray-300">{selectedEx.proposedToUserName || 'Candidat public (tout professionnel)'}</p>
                </div>
              </div>

              {/* Guard Specifics details */}
              <div className="bg-[#0A0A0B] p-3 rounded-xl border border-white/5 text-xs text-white space-y-1">
                <div className="flex justify-between font-bold border-b border-white/5 pb-1 mb-1">
                  <span className="text-blue-405 uppercase text-[9px] font-bold tracking-wider">Garde à Transférer</span>
                  <span className="text-gray-450 font-bold">{selectedEx.gardeDetails?.date}</span>
                </div>
                <p className="font-bold">{selectedEx.gardeDetails?.lieu}</p>
                <p className="text-[10px] text-gray-400">Horaire assigné : {selectedEx.gardeDetails?.timeStart} - {selectedEx.gardeDetails?.timeEnd}</p>
                
                {selectedEx.type === 'sale' && (
                  <div className="mt-1 pb-1 pt-1 border-t border-white/5 flex justify-between text-gray-300 font-bold text-[11px]">
                    <span>Tarif de transaction :</span>
                    <span className="text-green-400 font-bold font-mono">{selectedEx.price} €</span>
                  </div>
                )}
              </div>

              {/* Motivation */}
              <div className="bg-[#0A0A0B]/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-[9px] text-gray-450 font-bold uppercase block mb-0.5">Motivation du praticien</span>
                <p className="text-gray-300 text-[10.5px] italic leading-normal">"{selectedEx.motivation}"</p>
              </div>

              {/* Approval interactive controller */}
              <div className="pt-2.5 border-t border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-gray-400">Commentaire de Validation réglementaire :</label>
                  <span className="text-[9.5px] text-blue-400 font-bold uppercase font-mono">
                    Étape : {selectedEx.currentStep.toUpperCase()}
                  </span>
                </div>
                
                <input
                  type="text"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-[#0A0A0B] border border-white/5 rounded-lg text-white placeholder-gray-500 focus:outline-none"
                  placeholder="Inscrivez les conditions réglementaires ou médicales de visa..."
                />

                <div className="flex gap-2.5 pt-1">
                  <button
                    onClick={() => handleReview('approved')}
                    disabled={isSubmitting}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Acter Visa (Approuver)
                  </button>
                  <button
                    onClick={() => handleReview('rejected')}
                    disabled={isSubmitting}
                    className="py-2 px-4 bg-white/5 hover:bg-rose-500/10 hover:text-rose-450 text-gray-400 font-bold text-xs rounded-xl border border-white/5 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Rejeter
                  </button>
                </div>
                <p className="text-[9px] text-gray-500 leading-tight">
                  💡 En cliquant sur "Acter Visa", la demande passera à l'échelon de validation supérieur ou mutera directement la garde.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-550 flex flex-col justify-center items-center h-full">
              <Info className="w-8 h-8 text-blue-400/40 mb-1.5 animate-bounce" />
              <p className="text-xs font-bold text-gray-300">Aucune demande sélectionnée</p>
              <p className="text-[10px] text-gray-400 max-w-xs mx-auto mt-0.5 leading-normal">
                Cliquez sur une transaction de garde dans le menu latéral pour inspecter sa motivation et acter son visa administratif.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* History Log view of past actions */}
      {pastExchanges.length > 0 && (
        <div className="border-t border-white/5 pt-4 mt-1.5">
          <span className="text-[10px] font-bold text-gray-450 uppercase block mb-2-3">MÉMOIRE DES TRANSACTIONS PASSÉES & ARCHIVÉES ({pastExchanges.length})</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[140px] overflow-y-auto">
            {pastExchanges.map(ex => (
              <div key={ex.id} className="p-2.5 bg-[#121214]/85 rounded-xl border border-white/5 text-xs flex justify-between items-start">
                <div className="space-y-1">
                  <h5 className="font-bold text-white truncate max-w-[170px]">{gardes.find(g => g.id === ex.gardeId)?.lieu || 'Garde'}</h5>
                  <p className="text-[9.5px] text-gray-400">Demandeur : {ex.requesterName}</p>
                  
                  {ex.history.length > 0 && (
                    <p className="text-[9px] text-gray-500 font-bold italic">
                      Dernier visa: {ex.history[ex.history.length - 1].reviewerName}
                    </p>
                  )}
                </div>
                
                <span className={`px-2 py-0.5 text-[8.5px] font-bold rounded-full uppercase border ${
                  ex.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-rose-500/10 text-rose-450 border-rose-500/20'
                }`}>
                  {ex.status === 'approved' ? 'Finalisé' : 'Rejeté'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
