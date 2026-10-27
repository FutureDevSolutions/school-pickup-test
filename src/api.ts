import axios from 'axios';
import { getBaseUrl, SCHOOL_PICKUP_API_TOKEN } from './config';

export type SchoolPickupEntry = {
  id: string;
  name: string;
  class_name: string;
  type?: string;
  created_at?: string;
  expires_at?: string;
};

export type EnqueueResponse = {
  ok: boolean;
  device_id: string;
  type?: string;
  row_count: number;
  display_minutes: number;
  entries: SchoolPickupEntry[];
};

export async function enqueuePickup(params: {
  deviceId: string;
  name: string;
  className: string;
  type: string;
}): Promise<EnqueueResponse> {
  const base = getBaseUrl().replace(/\/$/, '');
  const { data } = await axios.post<EnqueueResponse>(
    `${base}/api/public/school-pickup/enqueue`,
    {
      device_id: params.deviceId,
      name: params.name,
      class_name: params.className,
      type: params.type,
    },
    {
      headers: {
        Authorization: `Bearer ${SCHOOL_PICKUP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    },
  );
  return data;
}
