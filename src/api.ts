import axios from 'axios';
import { 
  APIResponse, 
  User, 
  UserResponse,
  InstanceData, 
  WhatsAppInstance,
  InstanceConfig, 
  ListInstancesResponse,
  SingleInstanceResponse 
} from './types';

const BASE_URL = 'https://api.infragrowthai.com/webhook/whatsapp';

export const getUsers = async (locationId: string): Promise<User[]> => {
  try {
    const response = await axios.get<UserResponse>(
      `${BASE_URL}/get-users`,
      {
        params: { locationId }
      }
    );
    
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data.map(user => ({
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone
      }));
    }
    
    return [];
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching users:', error.message);
    }
    return [];
  }
};

export const listInstances = async (locationId: string): Promise<WhatsAppInstance[]> => {
  try {
    const response = await axios.get<ListInstancesResponse>(`${BASE_URL}/ver-instancias`, {
      params: { locationId }
    });
    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error listing instances:', error.message);
    }
    return [];
  }
};

export const createInstance = async (
  locationId: string,
  config: InstanceConfig,
  userData?: {
    user_name?: string;
    user_email?: string;
    user_phone?: string;
  }
): Promise<APIResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/create-instance`, {
      locationId,
      ...config,
      n8n_webhook: config.n8n_webhook,
      active_ia: config.active_ia,
      ...(userData && {
        user_name: userData.user_name,
        user_email: userData.user_email,
        user_phone: userData.user_phone
      })
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating instance:', error.message);
    }
    throw new Error('Error al crear la instancia de WhatsApp');
  }
};

export const refreshQRCode = async (locationId: string, instanceName: string): Promise<APIResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/get-qr`, {
      locationId,
      instanceName
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error refreshing QR code:', error.message);
    }
    return { error: 'Error al obtener QR' };
  }
};

export const deleteInstance = async (locationId: string, instanceName: string): Promise<APIResponse> => {
  try {
    const response = await axios.delete(`${BASE_URL}/delete-instance`, {
      data: {
        locationId,
        instanceName
      }
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error deleting instance:', error.message);
    }
    throw new Error('Error al eliminar la instancia');
  }
};

export const getInstanceData = async (locationId: string, instanceName: string): Promise<InstanceData> => {
  try {
    const response = await axios.post<InstanceData>(`${BASE_URL}/get-instance-data`, {
      locationId,
      instanceName
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error getting instance data:', error.message);
    }
    return { name: '', number: '', photo: '' };
  }
};

export const turnOffInstance = async (locationId: string, instanceName: string): Promise<APIResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/turn-off`, {
      locationId,
      instanceName
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error turning off instance:', error.message);
    }
    throw new Error('Error al desconectar la instancia');
  }
};

export const editInstance = async (
  locationId: string,
  instanceName: string,
  config: InstanceConfig
): Promise<APIResponse> => {
  try {
    const response = await axios.put(`${BASE_URL}/edit-instance`, {
      locationId,
      instanceName,
      ...config,
      n8n_webhook: config.n8n_webhook,
      active_ia: config.active_ia
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error editing instance:', error.message);
    }
    throw new Error('Error al actualizar la configuración de la instancia');
  }
};

export const getInstanceConfig = async (locationId: string, instanceId: string): Promise<SingleInstanceResponse['data']> => {
  try {
    const response = await axios.get<SingleInstanceResponse>(`${BASE_URL}/ver-instancia`, {
      params: { locationId, instanceId }
    });
    
    if (!response.data.data) {
      throw new Error('No se encontró la configuración de la instancia');
    }
    
    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error getting instance config:', error.message);
    }
    throw new Error('Error al obtener la configuración de la instancia');
  }
};

// Asegurarse de que todas las funciones estén disponibles para importación
const api = {
  getUsers,
  listInstances,
  createInstance,
  refreshQRCode,
  deleteInstance,
  getInstanceData,
  turnOffInstance,
  editInstance,
  getInstanceConfig
};

export default api;
