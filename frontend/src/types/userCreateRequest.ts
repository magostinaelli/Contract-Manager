export interface UserCreateRequest {
  username: string;
  password: string;
  role: "ADMIN" | "OPERATOR";
}