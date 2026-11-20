import { apiClient } from "./apiClient";
import type {
  Contract,
  ContractAuditLog,
} from "../types/contract";
import type { ContractRequest } from "../types/contractRequest";

export const getContracts = async (): Promise<Contract[]> => {
  return apiClient("/contracts");
};

export const createContract = async (
  contract: ContractRequest,
): Promise<Contract> => {
  return apiClient("/contracts", {
    method: "POST",
    body: JSON.stringify(contract),
  });
};

export const updateContract = async (
  id: number,
  contract: ContractRequest,
): Promise<Contract> => {
  return apiClient(`/contracts/${id}`, {
    method: "PUT",
    body: JSON.stringify(contract),
  });
};

export const deleteContract = async (id: number): Promise<void> => {
  await apiClient(`/contracts/${id}`, {
    method: "DELETE",
  });
};

export const getContractAudit = async (
  id: number,
): Promise<ContractAuditLog[]> => {
  return apiClient(`/contracts/${id}/audit`);
};