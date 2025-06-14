import axios from 'axios';
import userManager from './authService';
import { Application, CertificateHistory } from '@prodesp/ssl-monitor-shared';

// --- TIPOS GLOBAIS FINAIS ---
export type ApplicationWithId = Application & { _id: string; createdAt: string; updatedAt: string; };
export type UserWithId = { _id: string; name: string; email: string; role: 'admin' | 'member'; };
export type Connector = { _id: string; name: string; type: 'slack' | 'teams' | 'webhook'; config: { url: string }; };
export type CertificateChainItem = { subject: { CN?: string; O?: string }, issuer: { CN?: string; O?: string }, validTo: string };
export interface PaginatedApplications {
  applications: ApplicationWithId[];
  totalPages: number;
  currentPage: number;
  totalApplications: number;
}
export interface DomainStatus {
  _id: string; // domain
  applicationId: { _id: string, name: string };
  status: 'valid' | 'expiring' | 'expired' | 'invalid' | 'insecure' | 'unknown';
  daysUntilExpiry: number;
  lastChecked: string;
  tlsVersion: string;
  cipherName: string;
  healthScore: { score: number; grade: string };
  currentCertificateId: string;
  history: CertificateHistory[];
}
export interface DashboardStats {
  totalApplications: number;
  certificateCounts: { valid: number; expiring: number; expired: number; invalid: number; insecure: number; };
  expiringSoonList: Array<{ _id: string; daysUntilExpiry: number; applicationName: string; }>;
}

// Tipos para Audit Logs
export interface AuditLog {
  _id: string;
  timestamp: string;
  user: { name: string; email: string };
  action: string;
  entity: string;
  details: string;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  currentPage: number;
  totalPages: number;
}

// Tipos para Status Público
export interface PublicDomain {
  status: 'valid' | 'expiring' | 'expired' | 'invalid' | 'insecure' | 'unknown';
  domain: string;
  daysUntilExpiry?: number;
}

export interface PublicService {
  applicationName: string;
  domains: PublicDomain[];
}

export type PublicStatusResponse = PublicService[];

// --- INSTÂNCIA DO AXIOS ---
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
});

api.interceptors.request.use(async (config) => {
  const user = await userManager.getUser();
  if (user && !user.expired) {
    config.headers.Authorization = `Bearer ${user.access_token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// --- FUNÇÕES DE API (COMPLETAS) ---

// Applications
export const getApplications = async (params: { page: number, search: string, [key: string]: any }): Promise<PaginatedApplications> => {
  const { data } = await api.get('/api/applications', { params });
  return data;
};

export const getApplicationById = async (id: string): Promise<ApplicationWithId> => {
  const { data } = await api.get(`/api/applications/${id}`);
  return data;
};

export const createApplication = async (applicationData: Application): Promise<ApplicationWithId> => {
  const { data } = await api.post('/api/applications', applicationData);
  return data;
};

export const updateApplication = async ({ id, data }: { id: string, data: Partial<Application> }): Promise<ApplicationWithId> => {
  const response = await api.put(`/api/applications/${id}`, data);
  return response.data;
};

export const deleteApplication = async (id: string): Promise<void> => {
  await api.delete(`/api/applications/${id}`);
};

// Certificates / Domain Statuses
export const getAllDomainStatuses = async (): Promise<DomainStatus[]> => {
  const { data } = await api.get('/api/certificates');
  return data;
};

export const getDomainStatusesByAppId = async (id: string): Promise<DomainStatus[]> => {
  const { data } = await api.get(`/api/certificates/application/${id}`);
  return data;
};

export const forceCheckCertificateByDomain = async (domain: string): Promise<DomainStatus> => {
  const { data } = await api.post(`/api/certificates/check/${domain}`);
  return data;
};

export const getCertificateChain = async (domain: string): Promise<CertificateChainItem[]> => {
  const { data } = await api.get(`/api/certificates/${domain}/chain`);
  return data;
};

// Dashboard
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get('/api/dashboard/stats');
  return data;
};

// Users
export const getUsers = async (): Promise<UserWithId[]> => {
  const { data } = await api.get('/api/users');
  return data;
};

export const updateUserRole = async ({ id, role }: { id: string, role: 'admin' | 'member' }): Promise<UserWithId> => {
  const { data } = await api.put(`/api/users/${id}/role`, { role });
  return data;
};

// Connectors
export const getConnectors = async (): Promise<Connector[]> => {
  const { data } = await api.get('/api/connectors');
  return data;
};

export const createConnector = async (connectorData: Omit<Connector, '_id'>): Promise<Connector> => {
  const { data } = await api.post('/api/connectors', connectorData);
  return data;
};

export const updateConnector = async (id: string, data: Omit<Connector, '_id' | 'createdAt' | 'updatedAt'>): Promise<Connector> => {
  const response = await api.put(`/api/connectors/${id}`, data);
  return response.data;
};

export const deleteConnector = async (id: string): Promise<void> => {
  await api.delete(`/api/connectors/${id}`);
};

// Audit & Status
export const getAuditLogs = async ({ page = 1 }: { page?: number } = {}): Promise<AuditLogsResponse> => {
  const { data } = await api.get('/api/audit', { params: { page } });
  return data;
};

export const getPublicStatus = async (): Promise<PublicStatusResponse> => {
  const { data } = await api.get('/api/public/status');
  return data;
};

export const getMe = async (): Promise<UserWithId> => {
  const { data } = await api.get('/api/auth/me');
  return data;
};