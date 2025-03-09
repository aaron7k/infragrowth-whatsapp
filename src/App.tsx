import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { InstanceCard } from './components/InstanceCard';
import { WhatsAppConfigModal } from './components/WhatsAppConfigModal';
import { LoadingOverlay } from './components/LoadingOverlay';
import { createInstance, listInstances, getUsers, editInstance, getInstanceConfig, getInstanceData } from './api';
import type { WhatsAppInstance, SingleInstanceResponse, User, InstanceConfig } from './types';
import InstanceDetailPage from './pages/InstanceDetailPage';

export const App: React.FC = () => {
  const locationId = 'XCrKRkp9vLhW6P6tXIkK';

  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);
  const [configInstance, setConfigInstance] = useState<SingleInstanceResponse['data'] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingWhatsApp, setIsCreatingWhatsApp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMainDevice = instances.some(instance => instance.main_device);

  const getNextInstanceNumber = useCallback(() => {
    if (instances.length === 0) return 1;
    
    const numbers = instances.map(instance => {
      const match = instance.instance_name.match(/\d+$/);
      return match ? parseInt(match[0], 10) : 0;
    });
    
    return Math.max(...numbers) + 1;
  }, [instances]);

  const loadInstances = useCallback(async () => {
    try {
      const instancesList = await listInstances(locationId);
      setInstances(instancesList);
      setError(null);
    } catch (error) {
      console.error('Error loading instances:', error);
      toast.error('Error al cargar las instancias');
      setInstances([]);
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const usersList = await getUsers(locationId);
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar los usuarios');
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [locationId]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await loadInstances();
        await loadUsers();
      } catch (error) {
        console.error('Error initializing:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [loadInstances, loadUsers]);

  const handleOpenModal = useCallback(async () => {
    if (instances.length >= 5) {
      toast.error('Número máximo de instancias (5) alcanzado');
      return;
    }
    
    setLoadingUsers(true);
    try {
      await loadUsers();
      setIsEditing(false);
      setConfigInstance(null);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar los usuarios');
    } finally {
      setLoadingUsers(false);
    }
  }, [instances.length, loadUsers]);

  const handleEditConfig = useCallback(async (instance: WhatsAppInstance) => {
    setLoadingUsers(true);
    try {
      await loadUsers();
      const instanceConfig = await getInstanceConfig(locationId, instance.instance_id.toString());
      setIsEditing(true);
      setConfigInstance(instanceConfig);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error getting instance config:', error);
      toast.error('Error al obtener la configuración de la instancia');
    } finally {
      setLoadingUsers(false);
    }
  }, [loadUsers, locationId]);

  const handleSaveConfig = useCallback(async (config: InstanceConfig, userData?: User) => {
    if (isEditing && configInstance) {
      setIsSaving(true);
      try {
        await editInstance(locationId, configInstance.instance_name, config);
        toast.success('Configuración actualizada correctamente');
        await loadInstances();
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error updating config:', error);
        toast.error('Error al actualizar la configuración');
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsCreatingWhatsApp(true);
      setIsModalOpen(false);
      try {
        const nextNumber = getNextInstanceNumber();
        const instanceName = `infragrowth-whatsapp${nextNumber}`;
        
        const userDetails = userData ? {
          user_name: userData.name,
          user_email: userData.email,
          user_phone: userData.phone || ''
        } : undefined;

        await createInstance(locationId, {
          ...config,
          instance_name: instanceName
        }, userDetails);
        
        toast.success('WhatsApp creado correctamente');
        await loadInstances();
      } catch (error) {
        console.error('Error creating WhatsApp:', error);
        toast.error('Error al crear WhatsApp');
      } finally {
        setIsCreatingWhatsApp(false);
      }
    }
  }, [isEditing, configInstance, locationId, loadInstances, getNextInstanceNumber]);

  const handleViewInstance = (instance: WhatsAppInstance) => {
    setSelectedInstance(instance);
  };

  const handleGoBack = async () => {
    if (!selectedInstance) return;

    try {
      await getInstanceData(locationId, selectedInstance.instance_name);
      await loadInstances();
    } catch (error) {
      console.error('Error fetching instance data:', error);
    }
    setSelectedInstance(null);
  };

  const handleInstanceDeleted = useCallback(() => {
    loadInstances();
  }, [loadInstances]);

  const handleInstanceUpdated = useCallback(() => {
    loadInstances();
  }, [loadInstances]);

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-purple-600">Cargando instancias...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 p-6">
      <Toaster position="top-right" />
      {isSaving && <LoadingOverlay message="Actualizando configuración..." />}
      {isCreatingWhatsApp && (
        <LoadingOverlay 
          message="Creando WhatsApp..." 
          description="Este proceso puede tardar unos segundos. Por favor, espere."
        />
      )}

      <div className="max-w-7xl mx-auto">
        {selectedInstance ? (
          <InstanceDetailPage
            instance={selectedInstance}
            locationId={locationId}
            onGoBack={handleGoBack}
            onQRCodeUpdated={() => {}}
          />
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-purple-900">Infragrowth WhatsApp</h1>
              <button
                onClick={handleOpenModal}
                disabled={instances.length >= 5}
                className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                <span>Crear WhatsApp</span>
              </button>
            </div>

            {instances.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold text-purple-700 mb-2">No hay instancias de WhatsApp</h2>
                <p className="text-purple-500 mb-4">
                  Comienza creando tu primera instancia de WhatsApp haciendo clic en el botón "Crear WhatsApp"
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {instances.map(instance => (
                  <InstanceCard
                    key={instance.instance_id}
                    instance={instance}
                    onViewInstance={handleViewInstance}
                    locationId={locationId}
                    onInstanceDeleted={handleInstanceDeleted}
                    onInstanceUpdated={handleInstanceUpdated}
                    onEditConfig={handleEditConfig}
                  />
                ))}
              </div>
            )}

            <WhatsAppConfigModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSave={handleSaveConfig}
              users={users}
              loading={loadingUsers}
              initialConfig={configInstance ? {
                alias: configInstance.instance_alias,
                userId: configInstance.user_id,
                isMainDevice: configInstance.main_device,
                facebookAds: configInstance.fb_ads
              } : undefined}
              existingMainDevice={hasMainDevice}
              isEditing={isEditing}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default App;
