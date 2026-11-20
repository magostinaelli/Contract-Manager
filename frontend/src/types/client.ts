export interface Client {
  id: number;
  name: string;
  taxId?: string;
  email?: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
}