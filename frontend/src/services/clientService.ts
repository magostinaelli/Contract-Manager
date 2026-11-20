import { apiClient } from "./apiClient";

import type { ClientRequest } from "../types/clientRequest";
import type { Client } from "../types/client";

export const getClients = async (): Promise<Client[]> => {
  return apiClient("/clients");
};

export const createClient = async (
  client: ClientRequest,
): Promise<Client> => {
  return apiClient("/clients", {
    method: "POST",
    body: JSON.stringify(client),
  });
};

export const updateClient = async (
  id: number,
  client: ClientRequest,
): Promise<Client> => {
  return apiClient(`/clients/${id}`, {
    method: "PUT",
    body: JSON.stringify(client),
  });
};

export const deleteClient = async (id: number): Promise<void> => {
  await apiClient(`/clients/${id}`, {
    method: "DELETE",
  });
};