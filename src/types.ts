/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 
  | 'admin' 
  | 'n1' 
  | 'n2' 
  | 'director_health' 
  | 'director_project' 
  | 'professional';

export type ProfessionType = 
  | 'pharmacist' 
  | 'doctor' 
  | 'firefighter' 
  | 'emergency';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  profession?: ProfessionType;
  phoneNumber: string;
  hospitalName?: string;
}

export type GardeStatus = 
  | 'available' 
  | 'proposed_exchange' 
  | 'completed_exchange' 
  | 'proposed_sale' 
  | 'completed_sale';

export interface Garde {
  id: string;
  date: string; // YYYY-MM-DD
  timeStart: string; // HH:MM
  timeEnd: string; // HH:MM
  lieu: string;
  latitude: number;
  longitude: number;
  type: ProfessionType;
  creatorId: string;
  creatorName: string;
  status: GardeStatus;
  notes?: string;
}

export type ExchangeType = 'exchange' | 'sale';

export type ValidationStep = 'n1' | 'n2' | 'health_director' | 'project_director' | 'done';

export type ExchangeStatus = 
  | 'pending_n1' 
  | 'pending_n2' 
  | 'pending_health_director' 
  | 'pending_project_director' 
  | 'approved' 
  | 'rejected';

export interface ExchangeHistoryEntry {
  step: ValidationStep;
  reviewerId: string;
  reviewerName: string;
  action: 'approved' | 'rejected';
  timestamp: string;
  comment?: string;
}

export interface GardeExchange {
  id: string;
  gardeId: string;
  gardeDetails?: Garde;
  type: ExchangeType;
  requesterId: string;
  requesterName: string;
  proposedToUserId?: string; // Optional: target user if exchanging with someone specific
  proposedToUserName?: string;
  targetGardeId?: string; // Optional: the guard offered in return if it's an exchange
  targetGardeDetails?: Garde;
  price?: number; // Only if type == 'sale'
  motivation: string;
  status: ExchangeStatus;
  currentStep: ValidationStep;
  history: ExchangeHistoryEntry[];
  createdAt: string;
}

export type NotificationMedium = 'push' | 'email' | 'sms';

export interface SimulatedNotification {
  id: string;
  userId: string;
  medium: NotificationMedium;
  title: string;
  message: string;
  timestamp: string;
  destination: string; // e.g., email or phone
  read: boolean;
}
