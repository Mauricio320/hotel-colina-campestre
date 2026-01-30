import { User } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  session: any | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserMetadata {
  first_name?: string;
  last_name?: string;
  doc_number?: string;
  doc_type?: string;
}

export interface AuthError {
  code: string;
  message: string;
  type: 'NETWORK' | 'VALIDATION' | 'DATABASE' | 'AUTH';
}

export enum AuthErrorType {
  DATABASE_NOT_READY = 'DATABASE_NOT_READY',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export interface AuthUser {
  id: string;
  email?: string;
  email_confirmed_at?: string;
  phone?: string;
  user_metadata: UserMetadata;
  created_at: string;
}