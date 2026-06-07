import React from 'react';
import { SimulatedNotification } from '../types';
import { Mail, Phone, Bell, Smartphone, Send, AlertTriangle } from 'lucide-react';

interface NotificationPanelProps {
  notifications: SimulatedNotification[];
}

export default function NotificationPanel({ notifications }: NotificationPanelProps) {
  // Group notifications by type of media channel
  const pushNotifs = notifications.filter(n => n.medium === 'push');
  const emailNotifs = notifications.filter(n => n.medium === 'email');
  const smsNotifs = notifications.filter(n => n.medium === 'sms');

  return (
    <div id="notifications-simulated-channels-panel" className="bg-[#0A0A0B] border border-white/5 rounded-2xl p-5 shadow-2xl flex flex-col h-full space-y-4">
      <div>
        <h3 className="text-white font-bold text-base flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-400 animate-pulse" />
          Moniteur de Sorties d'Alertes Multi-Canal (Push, Email, SMS)
        </h3>
        <p className="text-xs text-gray-450 font-medium">
          Observez en temps réel les notifications de routage de gardes générées par le backend REST (SwitchGard API).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        
        {/* Column 1: Smartphone Push Notifications */}
        <div className="bg-[#121214] p-4 rounded-xl border border-white/5 flex flex-col justify-between">
          <div className="space-y-3.5 flex-1">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Bell className="w-3.5 h-3.5 text-blue-400" />
              Notifications Push
            </h4>

            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {pushNotifs.length === 0 ? (
                <p className="text-[10px] text-gray-500 italic py-6 text-center">Aucun push envoyé.</p>
              ) : (
                pushNotifs.map(n => (
                  <div key={n.id} className="p-3 bg-[#0A0A0B] rounded-xl border border-blue-500/20 text-[10.5px] space-y-1">
                    <div className="flex justify-between text-[8px] text-gray-550 font-bold uppercase tracking-wider">
                      <span className="font-bold text-blue-400">MOBILE APP CLIENT</span>
                      <span>{new Date(n.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="font-bold text-white leading-snug">{n.title}</p>
                    <p className="text-gray-400 leading-normal">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="pt-2.5 border-t border-white/5 mt-3 text-[9px] text-gray-550 font-bold">
            Intégré via SDK Expo / Firebase Cloud Messaging (FCM).
          </div>
        </div>

        {/* Column 2: SMTP Emails queue */}
        <div className="bg-[#121214] p-4 rounded-xl border border-white/5 flex flex-col justify-between">
          <div className="space-y-3.5 flex-1">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              Courriers Électroniques (Email)
            </h4>

            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {emailNotifs.length === 0 ? (
                <p className="text-[10px] text-gray-500 italic py-6 text-center">Aucun email envoyé.</p>
              ) : (
                emailNotifs.map(n => (
                  <div key={n.id} className="p-3 bg-[#0A0A0B] rounded-xl border border-sky-500/10 text-[10.5px] space-y-1">
                    <div className="flex justify-between text-[8px] text-gray-550 font-bold uppercase tracking-wider">
                      <span className="font-bold text-sky-400">SMTP RELAY : {n.destination}</span>
                      <span>{new Date(n.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="font-bold text-gray-200">{n.title}</p>
                    <p className="text-gray-400 leading-normal">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="pt-2.5 border-t border-white/5 mt-3 text-[9px] text-gray-550 font-bold">
            Intégré via Transmetteur Nodemailer / Mailgun API.
          </div>
        </div>

        {/* Column 3: SMS Gateway queue */}
        <div className="bg-[#121214] p-4 rounded-xl border border-white/5 flex flex-col justify-between">
          <div className="space-y-3.5 flex-1">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Phone className="w-3.5 h-3.5 text-green-400" />
              SMS Passerelle Téléphonique
            </h4>

            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {smsNotifs.length === 0 ? (
                <p className="text-[10px] text-gray-500 italic py-6 text-center">Aucun SMS envoyé.</p>
              ) : (
                smsNotifs.map(n => (
                  <div key={n.id} className="p-3 bg-[#0A0A0B] rounded-xl border border-green-500/15 text-[10.5px] space-y-1 font-mono">
                    <div className="flex justify-between text-[8px] text-gray-550 font-sans font-bold uppercase tracking-wider">
                      <span className="font-bold text-green-400">TELCO GATEWAY : {n.destination}</span>
                      <span>{new Date(n.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-gray-300 leading-normal">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="pt-2.5 border-t border-white/5 mt-3 text-[9px] text-gray-550 font-bold">
            Intégré via Passerelle Twilio SMS / Infobip.
          </div>
        </div>

      </div>
    </div>
  );
}
