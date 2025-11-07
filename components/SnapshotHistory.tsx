'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Trash2, 
  Eye, 
  Calendar,
  AlertTriangle,
  Clock,
  RefreshCw,
  X
} from 'lucide-react';

interface SnapshotRecord {
  id: number;
  camera_id: string;
  incident_type?: string;
  description?: string;
  snapshot_url: string;
  timestamp: string;
  created_at: string;
}

interface SnapshotHistoryProps {
  cameraId?: string;
  refreshTrigger?: number;
}

const cameraNames: Record<string, string> = {
  cam_01: 'Av. Homero Oeste - Este',
  cam_02: 'Av. Homero Este - Oeste',
  cam_03: 'Av. Industrias Norte - Sur',
  cam_04: 'Av. Industrias Sur - Norte'
};

const incidentColors: Record<string, string> = {
  collision: 'text-error bg-error-light',
  congestion: 'text-warning bg-warning-light',
  accident: 'text-error bg-error-light',
  violation: 'text-info bg-info-light',
  other: 'text-neutral-600 bg-neutral-100'
};

const incidentLabels: Record<string, string> = {
  collision: 'Colisión',
  congestion: 'Congestión',
  accident: 'Accidente',
  violation: 'Violación',
  other: 'Otro'
};

export default function SnapshotHistory({ cameraId, refreshTrigger }: SnapshotHistoryProps) {
  const [snapshots, setSnapshots] = useState<SnapshotRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotRecord | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cameraId) params.append('camera_id', cameraId);
      params.append('limit', '50');

      const response = await fetch(`/api/snapshots?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setSnapshots(data.data);
      } else {
        console.error('Error al obtener historial:', data.error);
      }
    } catch (error) {
      console.error('Error de red:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSnapshot = async (snapshotId: number) => {
    if (!confirm('¿Está seguro de eliminar este snapshot?')) return;
    
    try {
      const response = await fetch(`/api/snapshots?snapshot_id=${snapshotId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        setSnapshots(prev => prev.filter(s => s.id !== snapshotId));
        if (selectedSnapshot?.id === snapshotId) {
          setSelectedSnapshot(null);
        }
      } else {
        alert(`Error al eliminar snapshot: ${data.error}`);
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error de conexión');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [cameraId, refreshTrigger]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">
          Historial de Snapshots
        </h3>
        <button
          onClick={fetchHistory}
          className="btn-secondary flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"
          />
          <p className="text-neutral-600">Cargando historial...</p>
        </div>
      ) : snapshots.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">
          <Camera className="w-12 h-12 mx-auto mb-2 text-neutral-400" />
          <p>No hay snapshots guardados</p>
          <p className="text-sm">Los snapshots aparecerán aquí después de guardarlos</p>
        </div>
      ) : (
        <div className="space-y-4">
          {snapshots.map((snapshot) => (
            <motion.div
              key={snapshot.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="border border-neutral-200 rounded-lg p-4 hover:shadow-medium transition-shadow"
            >
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  <div 
                    className="w-20 h-16 bg-neutral-100 rounded cursor-pointer overflow-hidden hover:opacity-90 transition-opacity"
                    onClick={() => setEnlargedImage(snapshot.snapshot_url)}
                  >
                    <img
                      src={snapshot.snapshot_url}
                      alt={`Snapshot de ${cameraNames[snapshot.camera_id]}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Camera className="w-4 h-4 text-neutral-400" />
                        <span className="font-medium text-neutral-900">
                          {cameraNames[snapshot.camera_id]}
                        </span>
                        <span className="text-sm text-neutral-500">
                          ({snapshot.camera_id})
                        </span>
                      </div>
                      
                      {snapshot.incident_type && (
                        <div className="mb-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${incidentColors[snapshot.incident_type] || incidentColors.other}`}>
                            <AlertTriangle className="w-3 h-3" />
                            {incidentLabels[snapshot.incident_type] || snapshot.incident_type}
                          </span>
                        </div>
                      )}
                      
                      {snapshot.description && (
                        <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                          {snapshot.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(snapshot.timestamp).toLocaleString('es-MX')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(snapshot.created_at).toLocaleString('es-MX')}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setSelectedSnapshot(snapshot)}
                        className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEnlargedImage(snapshot.snapshot_url)}
                        className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        title="Ampliar imagen"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSnapshot(snapshot.id)}
                        className="p-2 text-neutral-600 hover:text-error hover:bg-error-light rounded transition-colors"
                        title="Eliminar snapshot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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

      {/* Selected Snapshot Details Modal */}
      <AnimatePresence>
        {selectedSnapshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSnapshot(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-neutral-900">
                  Detalles del Snapshot
                </h4>
                <button
                  onClick={() => setSelectedSnapshot(null)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-600" />
                </button>
              </div>

              <div className="space-y-4">
                <img
                  src={selectedSnapshot.snapshot_url}
                  alt="Snapshot seleccionado"
                  className="w-full rounded-lg"
                />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-neutral-700">Cámara:</span>
                    <p>{cameraNames[selectedSnapshot.camera_id]} ({selectedSnapshot.camera_id})</p>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-700">ID:</span>
                    <p>#{selectedSnapshot.id}</p>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-700">Timestamp:</span>
                    <p>{new Date(selectedSnapshot.timestamp).toLocaleString('es-MX')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-700">Creado:</span>
                    <p>{new Date(selectedSnapshot.created_at).toLocaleString('es-MX')}</p>
                  </div>
                </div>

                {selectedSnapshot.incident_type && (
                  <div>
                    <span className="font-medium text-neutral-700">Tipo de Incidente:</span>
                    <p>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${incidentColors[selectedSnapshot.incident_type] || incidentColors.other}`}>
                        <AlertTriangle className="w-3 h-3" />
                        {incidentLabels[selectedSnapshot.incident_type] || selectedSnapshot.incident_type}
                      </span>
                    </p>
                  </div>
                )}

                {selectedSnapshot.description && (
                  <div>
                    <span className="font-medium text-neutral-700">Descripción:</span>
                    <p className="text-neutral-600">{selectedSnapshot.description}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
