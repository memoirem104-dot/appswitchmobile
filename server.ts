import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import { 
  User, 
  Garde, 
  GardeExchange, 
  SimulatedNotification, 
  UserRole, 
  ProfessionType, 
  ExchangeStatus, 
  ValidationStep 
} from './src/types';

// SECRET key for JWT
const JWT_SECRET = 'switchgard_secure_secret_2026';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database State (re-initialized with high-quality realistic Tunisian medical data)
let users: User[] = [
  { id: 'u-admin', email: 'admin@switchgard.tn', fullName: 'Amine Ben Ali', role: 'admin', phoneNumber: '+216 98 123 456' },
  { id: 'u-n1', email: 'n1@switchgard.tn', fullName: 'Chokri Laribi', role: 'n1', phoneNumber: '+216 98 234 567' },
  { id: 'u-n2', email: 'n2@switchgard.tn', fullName: 'Monia Oueslati', role: 'n2', phoneNumber: '+216 98 345 678' },
  { id: 'u-health-dir', email: 'health.dir@switchgard.tn', fullName: 'Dr. Faouzi Mehdi', role: 'director_health', phoneNumber: '+216 98 456 789' },
  { id: 'u-proj-dir', email: 'proj.dir@switchgard.tn', fullName: 'Slimane Abid', role: 'director_project', phoneNumber: '+216 98 567 890' },
  
  // Professionals
  { id: 'u-doc', email: 'dr.ahmed@switchgard.tn', fullName: 'Dr. Ahmed Gharbi', role: 'professional', profession: 'doctor', hospitalName: 'Hôpital Rabta Tunis', phoneNumber: '+216 98 678 901' },
  { id: 'u-pharm', email: 'pharm.sarah@switchgard.tn', fullName: 'Sarah Chaabane', role: 'professional', profession: 'pharmacist', hospitalName: 'Pharmacie Centrale Tunis', phoneNumber: '+216 98 789 012' },
  { id: 'u-fire', email: 'pompier.ali@switchgard.tn', fullName: 'Ali Mansour', role: 'professional', profession: 'firefighter', hospitalName: 'Caserne Protection Civile Tunis', phoneNumber: '+216 98 890 123' },
  { id: 'u-urg', email: 'urg.majdi@switchgard.tn', fullName: 'Majdi Dridi', role: 'professional', profession: 'emergency', hospitalName: 'Hôpital Charles Nicolle', phoneNumber: '+216 98 901 234' },
];

let checkInTimes: Record<string, string> = {};

let gardes: Garde[] = [
  { id: 'g-1', date: '2026-06-08', timeStart: '08:00', timeEnd: '20:00', lieu: 'Hôpital Charles Nicolle (Urgences)', latitude: 36.8050, longitude: 10.1620, type: 'emergency', creatorId: 'u-urg', creatorName: 'Majdi Dridi', status: 'available', notes: 'Garde de jour intensive.' },
  { id: 'g-2', date: '2026-06-09', timeStart: '20:00', timeEnd: '08:00', lieu: 'Pharmacie Cental de Tunis, Bab El Bhar', latitude: 36.8005, longitude: 10.1802, type: 'pharmacist', creatorId: 'u-pharm', creatorName: 'Sarah Chaabane', status: 'available', notes: 'Garde de nuit, pharmacie principale.' },
  { id: 'g-3', date: '2026-06-10', timeStart: '12:00', timeEnd: '00:00', lieu: 'Hôpital de la Rabta (Cardiologie)', latitude: 36.8012, longitude: 10.1511, type: 'doctor', creatorId: 'u-doc', creatorName: 'Dr. Ahmed Gharbi', status: 'available', notes: 'Urgences cardiologiques de garde.' },
  { id: 'g-4', date: '2026-06-11', timeStart: '00:00', timeEnd: '12:00', lieu: 'Caserne de la Protection Civile de Tunis', latitude: 36.8020, longitude: 10.1730, type: 'firefighter', creatorId: 'u-fire', creatorName: 'Ali Mansour', status: 'available', notes: 'Équipe d\'intervention rapide.' },
  { id: 'g-5', date: '2026-06-12', timeStart: '08:00', timeEnd: '20:00', lieu: 'Hôpital d\'Enfants de Bab Saadoun', latitude: 36.8090, longitude: 10.1585, type: 'doctor', creatorId: 'u-doc', creatorName: 'Dr. Ahmed Gharbi', status: 'available', notes: 'Pédiatrie clinique.' },
];

let exchanges: GardeExchange[] = [
  {
    id: 'e-101',
    gardeId: 'g-1',
    type: 'exchange',
    requesterId: 'u-urg',
    requesterName: 'Majdi Dridi',
    proposedToUserId: 'u-doc',
    proposedToUserName: 'Dr. Ahmed Gharbi',
    motivation: 'Congé familial exceptionnel, besoin d\'échange de garde.',
    status: 'pending_n1',
    currentStep: 'n1',
    history: [],
    createdAt: '2026-06-07T12:00:00.000Z'
  }
];

let notifications: SimulatedNotification[] = [
  { id: 'n-1', userId: 'u-urg', medium: 'push', title: 'Nouvelle garde créée', message: 'Votre garde à Charles Nicolle urgences a été publiée avec succès.', timestamp: '2026-06-07T12:05:00.000Z', destination: 'App Push Notification', read: false },
  { id: 'n-2', userId: 'u-n1', medium: 'email', title: 'Demande d\'échange de garde en attente d\'approbation', message: 'Une nouvelle demande d\'échange de garde initiée par Majdi Dridi est en attente d\'approbation de niveau N1.', timestamp: '2026-06-07T12:01:00.000Z', destination: 'n1@switchgard.tn', read: false }
];

// Helper to push all simulated notifications
function sendMultiChannelNotification(userId: string, title: string, message: string) {
  const targetUser = users.find(u => u.id === userId);
  if (!targetUser) return;
  
  const nowStr = new Date().toISOString();
  
  // 1. Push
  notifications.unshift({
    id: `notif-push-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId,
    medium: 'push',
    title,
    message: `${message} (Alerte Push sur Smartphone)`,
    timestamp: nowStr,
    destination: 'Push Intégré App Mobile',
    read: false
  });

  // 2. Email
  notifications.unshift({
    id: `notif-email-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId,
    medium: 'email',
    title,
    message,
    timestamp: nowStr,
    destination: targetUser.email,
    read: false
  });

  // 3. SMS
  notifications.unshift({
    id: `notif-sms-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId,
    medium: 'sms',
    title: `SMS: ${title}`,
    message,
    timestamp: nowStr,
    destination: targetUser.phoneNumber,
    read: false
  });
}

// Authentication Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Accès non autorisé, jeton manquant.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Jeton invalide ou expiré.' });
    }
    req.user = user;
    next();
  });
};

// --- AUTH API ---
app.post('/api/auth/register', (req, res) => {
  const { email, password, fullName, role, profession, phoneNumber, hospitalName } = req.body;
  if (!email || !fullName || !role) {
    return res.status(400).json({ error: 'Veuillez remplir les champs obligatoires (Email, Nom complet, Rôle).' });
  }

  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Cet email est déjà utilisé par un autre utilisateur.' });
  }

  const newUser: User = {
    id: `u-${Date.now()}`,
    email,
    fullName,
    role: role as UserRole,
    profession: profession as ProfessionType,
    phoneNumber: phoneNumber || '+216 98 000 000',
    hospitalName: hospitalName || 'Hôpital Général de Tunis'
  };

  users.push(newUser);
  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  
  sendMultiChannelNotification(newUser.id, "Bienvenue sur SwitchGard", "Votre compte professionnel a été créé avec succès.");

  res.status(201).json({ user: newUser, token });
});

app.post('/api/auth/login', (req: any, res: any) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Adresse email obligatoire.' });
  }

  const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'Identifiants de connexion incorrects.' });
  }

  // Simulated login check, accepts any password for seamless experience
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, fullName: user.fullName }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ user, token });
});

app.get('/api/auth/me', authenticateToken, (req: any, res: any) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }
  res.json({ user });
});

app.get('/api/users', (req: any, res: any) => {
  res.json(users);
});

// --- GARDES CRUD API ---
app.get('/api/gardes', (req, res) => {
  res.json(gardes);
});

app.post('/api/gardes', authenticateToken, (req: any, res: any) => {
  const { date, timeStart, timeEnd, lieu, latitude, longitude, type, notes } = req.body;
  if (!date || !timeStart || !timeEnd || !lieu || !type) {
    return res.status(400).json({ error: 'Veuillez remplir tous les champs obligatoires (Date, Heure début, Heure fin, Lieu, Métier).' });
  }

  const creator = users.find(u => u.id === req.user.id);

  const newGarde: Garde = {
    id: `g-${Date.now()}`,
    date,
    timeStart,
    timeEnd,
    lieu,
    latitude: Number(latitude) || 36.8065, // Tunis central coordinate
    longitude: Number(longitude) || 10.1815,
    type: type as ProfessionType,
    creatorId: req.user.id,
    creatorName: creator ? creator.fullName : 'Utilisateur',
    status: 'available',
    notes: notes || ''
  };

  gardes.unshift(newGarde);

  // Notify admins and users of this job type
  sendMultiChannelNotification(req.user.id, "Nouvelle garde publiée", `Votre garde à ${lieu} pour le ${date} a été créée.`);
  
  res.status(201).json(newGarde);
});

app.put('/api/gardes/:id', authenticateToken, (req: any, res: any) => {
  const { id } = req.params;
  const { date, timeStart, timeEnd, lieu, latitude, longitude, type, notes, status } = req.body;
  
  const gardeIndex = gardes.findIndex(g => g.id === id);
  if (gardeIndex === -1) {
    return res.status(404).json({ error: 'Garde introuvable.' });
  }

  const oldGarde = gardes[gardeIndex];

  // Only creator or admin can update
  if (oldGarde.creatorId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier cette garde.' });
  }

  gardes[gardeIndex] = {
    ...oldGarde,
    date: date || oldGarde.date,
    timeStart: timeStart || oldGarde.timeStart,
    timeEnd: timeEnd || oldGarde.timeEnd,
    lieu: lieu || oldGarde.lieu,
    latitude: latitude !== undefined ? Number(latitude) : oldGarde.latitude,
    longitude: longitude !== undefined ? Number(longitude) : oldGarde.longitude,
    type: type || oldGarde.type,
    notes: notes !== undefined ? notes : oldGarde.notes,
    status: status || oldGarde.status
  };

  res.json(gardes[gardeIndex]);
});

app.delete('/api/gardes/:id', authenticateToken, (req: any, res: any) => {
  const { id } = req.params;
  const gardeIndex = gardes.findIndex(g => g.id === id);
  
  if (gardeIndex === -1) {
    return res.status(404).json({ error: 'Garde introuvable.' });
  }

  const garde = gardes[gardeIndex];
  if (garde.creatorId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à supprimer cette garde.' });
  }

  gardes.splice(gardeIndex, 1);
  res.json({ message: 'La garde a été supprimée avec succès.' });
});

// --- EXCHANGES & SALES WORKFLOW API ---
app.get('/api/exchanges', (req, res) => {
  // Populate details on the fly
  const populatedExchanges = exchanges.map(ex => {
    const mainGarde = gardes.find(g => g.id === ex.gardeId);
    const targetGarde = ex.targetGardeId ? gardes.find(g => g.id === ex.targetGardeId) : undefined;
    return {
      ...ex,
      gardeDetails: mainGarde,
      targetGardeDetails: targetGarde
    };
  });
  res.json(populatedExchanges);
});

app.post('/api/exchanges', authenticateToken, (req: any, res: any) => {
  const { gardeId, type, proposedToUserId, targetGardeId, price, motivation } = req.body;
  
  if (!gardeId || !type || !motivation) {
    return res.status(400).json({ error: 'Champs obligatoires manquants (Garde d\'origine, Type de transaction, Motivation).' });
  }

  const originGarde = gardes.find(g => g.id === gardeId);
  if (!originGarde) {
    return res.status(404).json({ error: 'Garde d\'origine introuvable.' });
  }

  if (originGarde.creatorId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Cette garde ne vous appartient pas pour faire une proposition d\'échange.' });
  }

  const requester = users.find(u => u.id === req.user.id);
  const targetUser = proposedToUserId ? users.find(u => u.id === proposedToUserId) : undefined;

  const newExchange: GardeExchange = {
    id: `e-${Date.now()}`,
    gardeId,
    type: type as 'exchange' | 'sale',
    requesterId: req.user.id,
    requesterName: requester ? requester.fullName : 'Professionnel',
    proposedToUserId,
    proposedToUserName: targetUser ? targetUser.fullName : undefined,
    targetGardeId,
    price: type === 'sale' ? Number(price) : undefined,
    motivation,
    status: 'pending_n1', // Multi-step workflow starts here
    currentStep: 'n1',
    history: [],
    createdAt: new Date().toISOString()
  };

  exchanges.unshift(newExchange);

  // Update original guard status
  originGarde.status = type === 'exchange' ? 'proposed_exchange' : 'proposed_sale';

  if (targetGardeId) {
    const targetGarde = gardes.find(g => g.id === targetGardeId);
    if (targetGarde) {
      targetGarde.status = 'proposed_exchange';
    }
  }

  // Notify validation system
  // Level N1 validators are notified
  const n1Validators = users.filter(u => u.role === 'n1');
  n1Validators.forEach(v => {
    sendMultiChannelNotification(
      v.id,
      "Workflow SwitchGard: Validation N1 Requise",
      `Une transaction de garde (${type === 'exchange' ? 'Echange' : 'Vente'}) par ${newExchange.requesterName} requiert votre validation.`
    );
  });

  // Notify target user if specified
  if (proposedToUserId) {
    sendMultiChannelNotification(
      proposedToUserId,
      "Proposition reçue",
      `${newExchange.requesterName} vous propose un ${type === 'exchange' ? 'échange' : 'achat'} de garde.`
    );
  }

  res.status(201).json(newExchange);
});

// --- WORKFLOW MULTI-LEVEL VALIDATION ACTION ---
app.post('/api/exchanges/:id/approve', authenticateToken, (req: any, res: any) => {
  const { id } = req.params;
  const { action, comment } = req.body; // 'approved' | 'rejected'
  
  if (!action || !['approved', 'rejected'].includes(action)) {
    return res.status(400).json({ error: 'Action incorrecte. Doit être approved ou rejected.' });
  }

  const exchangeIndex = exchanges.findIndex(e => e.id === id);
  if (exchangeIndex === -1) {
    return res.status(404).json({ error: 'Proposition introuvable.' });
  }

  const ex = exchanges[exchangeIndex];
  const userRole = req.user.role;
  const reviewer = users.find(u => u.id === req.user.id);
  const reviewerName = reviewer ? reviewer.fullName : 'Réviseur';

  // Check structure validation permission and step alignment
  let expectedRole: UserRole | null = null;
  let nextStep: ValidationStep = 'done';
  let nextStatus: ExchangeStatus = 'approved';

  if (ex.currentStep === 'n1') {
    expectedRole = 'n1';
    nextStep = 'n2';
    nextStatus = 'pending_n2';
  } else if (ex.currentStep === 'n2') {
    expectedRole = 'n2';
    nextStep = 'health_director';
    nextStatus = 'pending_health_director';
  } else if (ex.currentStep === 'health_director') {
    expectedRole = 'director_health';
    nextStep = 'project_director';
    nextStatus = 'pending_project_director';
  } else if (ex.currentStep === 'project_director') {
    expectedRole = 'director_project';
    nextStep = 'done';
    nextStatus = 'approved';
  }

  // Admins can validate any step!
  if (userRole !== 'admin' && userRole !== expectedRole) {
    return res.status(403).json({ 
      error: `Votre rôle (${userRole}) n'est pas autorisé à valider l'étape actuelle (${ex.currentStep.toUpperCase()}). Rôle requis: ${expectedRole}` 
    });
  }

  // Add event entry to validation history
  const historyEntry = {
    step: ex.currentStep,
    reviewerId: req.user.id,
    reviewerName: reviewerName,
    action: action as 'approved' | 'rejected',
    timestamp: new Date().toISOString(),
    comment: comment || ''
  };

  ex.history.push(historyEntry);

  if (action === 'rejected') {
    ex.status = 'rejected';
    ex.currentStep = 'done';
    
    // Reset guards state back to available
    const mainGarde = gardes.find(g => g.id === ex.gardeId);
    if (mainGarde) mainGarde.status = 'available';

    if (ex.targetGardeId) {
      const targetGarde = gardes.find(g => g.id === ex.targetGardeId);
      if (targetGarde) targetGarde.status = 'available';
    }

    // Notify requester of rejection
    sendMultiChannelNotification(
      ex.requesterId,
      "Proposition Rejetée",
      `Votre demande d\'${ex.type === 'exchange' ? 'échange' : 'vente'} a été rejetée à l'étape ${historyEntry.step.toUpperCase()} par ${reviewerName}. Motif: ${comment || 'Aucun'}`
    );

  } else {
    // Approved step
    ex.currentStep = nextStep;
    ex.status = nextStatus;

    if (nextStep === 'done') {
      ex.status = 'approved';
      
      // Finalized Exchange Logic: Swap Creators or Update Status!
      const originGarde = gardes.find(g => g.id === ex.gardeId);
      
      if (ex.type === 'exchange' && ex.targetGardeId) {
        const targetGarde = gardes.find(g => g.id === ex.targetGardeId);
        if (originGarde && targetGarde) {
          // Swap creators
          const u1Id = originGarde.creatorId;
          const u1Name = originGarde.creatorName;
          const u2Id = targetGarde.creatorId;
          const u2Name = targetGarde.creatorName;

          originGarde.creatorId = u2Id;
          originGarde.creatorName = u2Name;
          originGarde.status = 'completed_exchange';

          targetGarde.creatorId = u1Id;
          targetGarde.creatorName = u1Name;
          targetGarde.status = 'completed_exchange';

          // Notify both parties
          sendMultiChannelNotification(u1Id, "Échange Finalisé !", `L'échange de garde avec ${u2Name} a été entièrement approuvé et exécuté.`);
          sendMultiChannelNotification(u2Id, "Échange Finalisé !", `L'échange de garde avec ${u1Name} a été entièrement approuvé et exécuté.`);
        }
      } else if (ex.type === 'sale') {
        // Guard gets transferred to the buyer (who is proposedToUserId)
        if (originGarde && ex.proposedToUserId) {
          const oldCreatorId = originGarde.creatorId;
          const buyer = users.find(u => u.id === ex.proposedToUserId);

          originGarde.creatorId = ex.proposedToUserId;
          originGarde.creatorName = buyer ? buyer.fullName : 'Acheteur';
          originGarde.status = 'completed_sale';

          // Notify both parts
          sendMultiChannelNotification(oldCreatorId, "Garde vendue avec succès !", `Votre garde à ${originGarde.lieu} a été transférée à ${originGarde.creatorName}.`);
          sendMultiChannelNotification(ex.proposedToUserId, "Achat de garde finalisé !", `Vous possédez désormais la garde à ${originGarde.lieu} le ${originGarde.date}.`);
        } else if (originGarde) {
          // If public sale, the post status is set as completed
          originGarde.status = 'completed_sale';
        }
      }
    } else {
      // Move to next validator
      const nextRole = nextStep === 'n2' ? 'n2' : (nextStep === 'health_director' ? 'director_health' : 'director_project');
      const nextValidators = users.filter(u => u.role === nextRole);
      
      nextValidators.forEach(v => {
        sendMultiChannelNotification(
          v.id,
          `Workflow SwitchGard: Validation ${nextStep.toUpperCase()} Requise`,
          `Demande d\'${ex.type === 'exchange' ? 'échange' : 'vente'} de ${ex.requesterName} est validée par ${reviewerName} et requiert votre approbation.`
        );
      });

      // Notify requester about step validation
      sendMultiChannelNotification(
        ex.requesterId,
        "Validation en cours",
        `Votre demande a passé l'étape ${historyEntry.step.toUpperCase()} avec succès (Approuvée par ${reviewerName}). Prochaine étape : ${nextStep.toUpperCase()}`
      );
    }
  }

  res.json(ex);
});


// Notification endpoints
app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

app.post('/api/notifications/read-all', authenticateToken, (req: any, res: any) => {
  notifications = notifications.map(n => n.userId === req.user.id ? { ...n, read: true } : n);
  res.json({ success: true });
});

// Reset endpoint
app.post('/api/test/reset', (req, res) => {
  gardes = [
    { id: 'g-1', date: '2026-06-08', timeStart: '08:00', timeEnd: '20:00', lieu: 'Hôpital Charles Nicolle (Urgences)', latitude: 36.8050, longitude: 10.1620, type: 'emergency', creatorId: 'u-urg', creatorName: 'Majdi Dridi', status: 'available', notes: 'Garde de jour intensive.' },
    { id: 'g-2', date: '2026-06-09', timeStart: '20:00', timeEnd: '08:00', lieu: 'Pharmacie Cental de Tunis, Bab El Bhar', latitude: 36.8005, longitude: 10.1802, type: 'pharmacist', creatorId: 'u-pharm', creatorName: 'Sarah Chaabane', status: 'available', notes: 'Garde de nuit, pharmacie principale.' },
    { id: 'g-3', date: '2026-06-10', timeStart: '12:00', timeEnd: '00:00', lieu: 'Hôpital de la Rabta (Cardiologie)', latitude: 36.8012, longitude: 10.1511, type: 'doctor', creatorId: 'u-doc', creatorName: 'Dr. Ahmed Gharbi', status: 'available', notes: 'Urgences cardiologiques de garde.' },
    { id: 'g-4', date: '2026-06-11', timeStart: '00:00', timeEnd: '12:00', lieu: 'Caserne de la Protection Civile de Tunis', latitude: 36.8020, longitude: 10.1730, type: 'firefighter', creatorId: 'u-fire', creatorName: 'Ali Mansour', status: 'available', notes: 'Équipe d\'intervention rapide.' },
    { id: 'g-5', date: '2026-06-12', timeStart: '08:00', timeEnd: '20:00', lieu: 'Hôpital d\'Enfants de Bab Saadoun', latitude: 36.8090, longitude: 10.1585, type: 'doctor', creatorId: 'u-doc', creatorName: 'Dr. Ahmed Gharbi', status: 'available', notes: 'Pédiatrie clinique.' },
  ];
  exchanges = [
    {
      id: 'e-101',
      gardeId: 'g-1',
      type: 'exchange',
      requesterId: 'u-urg',
      requesterName: 'Majdi Dridi',
      proposedToUserId: 'u-doc',
      proposedToUserName: 'Dr. Ahmed Gharbi',
      motivation: 'Congé familial exceptionnel, besoin d\'échange de garde.',
      status: 'pending_n1',
      currentStep: 'n1',
      history: [],
      createdAt: '2026-06-07T12:00:00.000Z'
    }
  ];
  notifications = [
    { id: 'n-1', userId: 'u-urg', medium: 'push', title: 'Nouvelle garde créée', message: 'Votre garde à Charles Nicolle urgences a été publiée avec succès.', timestamp: '2026-06-07T12:05:00.000Z', destination: 'App Push Notification', read: false },
    { id: 'n-2', userId: 'u-n1', medium: 'email', title: 'Demande d\'échange de garde en attente d\'approbation', message: 'Une nouvelle demande d\'échange de garde initiée par Majdi Dridi est en attente d\'approbation de niveau N1.', timestamp: '2026-06-07T12:01:00.000Z', destination: 'n1@switchgard.tn', read: false }
  ];
  res.json({ success: true, message: 'Database reset successfully' });
});

// Setup Vite & Static Assets mapping for single-page React frontend
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SwitchGard Server listening on ports: (Internal: http://0.0.0.0:${PORT})`);
  });
}

startServer();
