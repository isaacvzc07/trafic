'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Download, 
  ZoomIn, 
  X, 
  RefreshCw, 
  AlertCircle,
  Save,
  Calendar,
  MapPin
} from 'lucide-react';

interface Snapshot {
  camera_id: string;
  snapshot_url: string;
  timestamp: string;
  incident_type?: string;
  description?: string;
}

interface CameraSnapshotsProps {
  cameras: string[];
}

export default function CameraSnapshots({ cameras }: CameraSnapshotsProps) {
  const [selectedCamera, setSelectedCamera] = useState<string>('cam_01'); // Default to cam_01
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');

  const cameraNames: Record<string, string> = {
    cam_01: 'Av. Homero Oeste - Este',
    cam_02: 'Av. Homero Este - Oeste',
    cam_03: 'Av. Industrias Norte - Sur',
    cam_04: 'Av. Industrias Sur - Norte'
  };

  const fetchSnapshot = async (cameraId: string) => {
    setLoading(true);
    try {
      // Usar la API real con parámetros de imagen
      const response = await fetch(`/api/v1/cameras/${cameraId}/snapshot?width=1280&height=720&format=jpeg`);
      
      if (response.headers.get('Content-Type')?.startsWith('image/')) {
        // Si es una imagen, crear blob URL
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        
        setSnapshot({
          camera_id: cameraId,
          snapshot_url: imageUrl,
          timestamp: new Date().toISOString(),
        });
      } else {
        // Si hay error, manejar JSON response
        const data = await response.json();
        console.error('Error al obtener snapshot:', data.error);
        setSnapshot(null);
      }
    } catch (error) {
      console.error('Error de red:', error);
      setSnapshot(null);
    } finally {
      setLoading(false);
    }
  };

  const saveSnapshot = async () => {
    if (!snapshot) return;
    
    setSaving(true);
    try {
      // Convert blob URL to base64 for storage
      const response = await fetch(snapshot.snapshot_url);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      
      const apiResponse = await fetch('/api/snapshots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          camera_id: selectedCamera,
          incident_type: incidentType,
          description: description,
          snapshot_url: base64
        })
      });
      
      const data = await apiResponse.json();
      if (data.success) {
        // Reset form
        setIncidentType('');
        setDescription('');
        alert('Snapshot guardado exitosamente en la base de datos');
      } else {
        alert(`Error al guardar snapshot: ${data.error}`);
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error de conexión al guardar');
    } finally {
      setSaving(false);
    }
  };

  const downloadSnapshot = () => {
    if (!snapshot) return;
    
    // Crear link para descargar la imagen blob
    const link = document.createElement('a');
    link.href = snapshot.snapshot_url;
    link.download = `snapshot_${selectedCamera}_${new Date().getTime()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchSnapshot(selectedCamera);
  }, [selectedCamera]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">
          Snapshots de Cámaras
        </h3>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Camera className="w-4 h-4" />
          <span>Monitoreo en Vivo</span>
        </div>
      </div>

      {/* Camera Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Seleccionar Cámara
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cameras.map((camera) => (
            <button
              key={camera}
              onClick={() => setSelectedCamera(camera)}
              className={`p-3 rounded-lg border transition-all ${
                selectedCamera === camera
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {cameraNames[camera]}
                </span>
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {camera}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Snapshot Display */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Image Section */}
        <div>
          <div className="relative bg-neutral-100 rounded-lg overflow-hidden" style={{ minHeight: '300px' }}>
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full"
                />
              </div>
            ) : snapshot ? (
              <img
                src={snapshot.snapshot_url}
                alt={`Snapshot de ${cameraNames[selectedCamera]}`}
                className="w-full h-full object-cover cursor-pointer transition-transform hover:scale-105"
                onClick={() => setEnlargedImage(snapshot.snapshot_url)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
                <div className="text-center">
                  <Camera className="w-12 h-12 mx-auto mb-2 text-neutral-400" />
                  <p>No hay snapshot disponible</p>
                </div>
              </div>
            )}
          </div>

          {/* Image Controls */}
          {snapshot && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => fetchSnapshot(selectedCamera)}
                className="btn-secondary flex items-center gap-2"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              <button
                onClick={() => setEnlargedImage(snapshot.snapshot_url)}
                className="btn-secondary flex items-center gap-2"
              >
                <ZoomIn className="w-4 h-4" />
                Ampliar
              </button>
              <button
                onClick={downloadSnapshot}
                className="btn-primary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar
              </button>
            </div>
          )}
        </div>

        {/* Info & Save Section */}
        <div>
          {/* Snapshot Info */}
          {snapshot && (
            <div className="mb-6">
              <h4 className="font-medium text-neutral-900 mb-3">Información del Snapshot</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-600">
                    Fecha: {new Date(snapshot.timestamp).toLocaleString('es-MX')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-600">
                    Cámara: {cameraNames[selectedCamera]} ({selectedCamera})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Save Form */}
          <div>
            <h4 className="font-medium text-neutral-900 mb-3">Guardar en Base de Datos</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Tipo de Incidente
                </label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Seleccionar tipo...</option>
                  <option value="collision">Colisión</option>
                  <option value="congestion">Congestión</option>
                  <option value="accident">Accidente</option>
                  <option value="violation">Violación de Tránsito</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describir el incidente o evento..."
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <button
                onClick={saveSnapshot}
                disabled={saving || !snapshot || !incidentType}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar Snapshot'}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-info-light rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
              <div className="text-sm text-info">
                <p className="font-medium mb-1">Uso de Snapshots</p>
                <ul className="space-y-1 text-xs">
                  <li>• Click en la imagen para ampliar</li>
                  <li>• Los snapshots se guardan automáticamente con timestamp</li>
                  <li>• Clasifique incidentes para análisis posterior</li>
                  <li>• Los datos se almacenan en PostgreSQL</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enlarged Image Modal */}
      <AnimatePresence>
        {enlargedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setEnlargedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-6xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={enlargedImage}
                alt="Snapshot ampliado"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setEnlargedImage(null)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5 text-neutral-900" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
