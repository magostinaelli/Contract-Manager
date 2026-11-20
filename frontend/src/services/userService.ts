import { apiClient } from "./apiClient";
import type { UserCreateRequest } from "../types/userCreateRequest";
import type { User } from "../types/user";

export const getUsers = async (): Promise<User[]> => {
  return apiClient("/users");
};

export const createUser = async (
  user: UserCreateRequest,
): Promise<User> => {
  return apiClient("/users", {
    method: "POST",
    body: JSON.stringify(user),
  });
};

export const updateUserRole = async (
  id: number,
  role: User["role"],
): Promise<User> => {
  return apiClient(`/users/${id}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
};

export const deleteUser = async (
  id: number,
): Promise<void> => {
  await apiClient(`/users/${id}`, {
    method: "DELETE",
  });
};