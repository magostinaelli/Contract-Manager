import { apiClient } from './apiClient';
import type {
  Contract,
  ContractStatus,
  DashboardData,
  DashboardMetrics,
} from '../types/contract';

interface DashboardDTO {
  totalActiveContracts?: number;
  expiringSoonCount?: number;
  totalCommittedAmount?: number;
  contractsByStatus?: Partial<Record<ContractStatus, number>>;
  monthlyExpirations?: {
    month: string;
    count: number;
  }[];
}

interface ContractDTO {
  id: number;
  title?: string;
  client?: { name: string };
  endDate?: string;
  amount?: number;
  status?: string;
}

const adaptDashboardData = (dto: DashboardDTO = {}): DashboardData => ({
  totalActiveContracts: dto.totalActiveContracts ?? 0,
  expiringSoonCount: dto.expiringSoonCount ?? 0,
  totalCommittedAmount: Number(dto.totalCommittedAmount) || 0,

  contractsByStatus: {
    DRAFT: dto.contractsByStatus?.DRAFT ?? 0,
    ACTIVE: dto.contractsByStatus?.ACTIVE ?? 0,
    EXPIRING_SOON: dto.contractsByStatus?.EXPIRING_SOON ?? 0,
    EXPIRED: dto.contractsByStatus?.EXPIRED ?? 0,
    UNDER_RENEWAL: dto.contractsByStatus?.UNDER_RENEWAL ?? 0,
  },

  monthlyExpirations: (dto.monthlyExpirations ?? []).map((item) => ({
    month: item.month,
    count: Number(item.count) || 0,
  })),
});

const adaptContract = (dto: ContractDTO): Contract => ({
  id: dto.id,
  title: dto.title || 'Sin título',
  clientName: dto.client?.name || 'Cliente no asignado',
  endDate: dto.endDate || '-',
  amount: Number(dto.amount) || 0,
  status: (dto.status as Contract['status']) || 'DRAFT',
});

export const getDashboardData = async (): Promise<DashboardData> => {
  const data = await apiClient('/contracts/dashboard');
  return adaptDashboardData(data);
};

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const data = await getDashboardData();

  return {
    totalActiveContracts: data.totalActiveContracts,
    expiringSoonCount: data.expiringSoonCount,
    totalCommittedAmount: data.totalCommittedAmount,
  };
};

export const getRecentContracts = async (): Promise<Contract[]> => {
  const data = await apiClient('/contracts');

  if (!Array.isArray(data)) return [];

  return data.map(adaptContract);
};