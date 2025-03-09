import axios from 'axios';

export interface UserData {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
}

export interface UserResponse {
  data: UserData[];
  instancias: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface WhatsAppInstance {
  id: string;
  instance_id: number;
  instance_name: string;
  instance_alias: string;
  main_device: boolean;
  fb_ads: boolean;
  n8n_webhook?: string;
  active_ia?: boolean;
  apikey: string;
  location_id: string | null;
  token: string | null;
  status?: string;
  connectionStatus?: string;
  qrcode?: string;
  userId?: string;
  ownerJid?: string;
  profilePicUrl?: string;
}

export interface InstanceConfig {
  alias: string;
  userId?: string;
  isMainDevice: boolean;
  facebookAds: boolean;
  n8n_webhook?: string;
  active_ia?: boolean;
  instance_name?: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
}

// ... resto de las interfaces existentes ...
