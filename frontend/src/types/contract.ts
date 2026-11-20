import type { Client } from './client';

export type ContractStatus =
  | "DRAFT"
  | "ACTIVE"
  | "EXPIRING_SOON"
  | "EXPIRED"
  | "UNDER_RENEWAL";

export interface Contract {
  id: number;
  title: string;
  client?: Client;
  clientName?: string;
  startDate?: string;
  endDate: string;
  amount: number;
  status: ContractStatus;
}

export interface DashboardMetrics {
  totalActiveContracts: number;
  expiringSoonCount: number;
  totalCommittedAmount: number;
}

export interface MonthlyExpiration {
  month: string;
  count: number;
}

export interface DashboardData extends DashboardMetrics {
  contractsByStatus: Record<ContractStatus, number>;
  monthlyExpirations: MonthlyExpiration[];
}

export type AuditAction =
  | "CREATED"
  | "UPDATED"
  | "STATUS_CHANGED";

export interface ContractAuditLog {
  action: AuditAction;
  performedBy: string;
  detail: string | null;
  createdAt: string;
}