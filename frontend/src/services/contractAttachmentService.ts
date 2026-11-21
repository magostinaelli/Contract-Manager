import { apiClient } from "./apiClient";
import type { ContractAttachment } from "../types/contractAttachment";

const BASE_URL = import.meta.env.VITE_API_URL;

const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const readErrorMessage = async (response: Response): Promise<string> => {
  try {
    const body = await response.json();
    return (
      body.error || (Object.values(body)[0] as string) || response.statusText
    );
  } catch {
    return response.statusText;
  }
};

export const getAttachments = async (
  contractId: number,
): Promise<ContractAttachment[]> => {
  return apiClient(`/contracts/${contractId}/attachments`);
};

export const uploadAttachment = async (
  contractId: number,
  file: File,
): Promise<ContractAttachment> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${BASE_URL}/contracts/${contractId}/attachments`,
    {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
};

export const downloadAttachment = async (
  contractId: number,
  attachment: ContractAttachment,
): Promise<void> => {
  const response = await fetch(
    `${BASE_URL}/contracts/${contractId}/attachments/${attachment.id}`,
    { headers: authHeaders() },
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = attachment.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};