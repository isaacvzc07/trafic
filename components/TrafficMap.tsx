'use client';

import { useState, useCallback, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, ScaleControl, GeolocateControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LiveCount } from '@/types/api';
import { Camera, Activity, TrendingUp, TrendingDown } from 'lucide-react';

interface TrafficMapProps {
  cameras: LiveCount[];
  onCameraClick?: (camera: LiveCount) => void;
}

interface CameraMarkerProps {
  camera: LiveCount;
  onClick: () => void;
}

// Camera coordinates (approximate Mexico City coordinates for demonstration)
const CAMERA_COORDINATES: Record<string, [number, number]> = {
  'homero_oe': [-99.1332, 19.4326], // Av. Homero Oeste-Este
  'homero_eo': [-99.1312, 19.4346], // Av. Homero Este-Oeste
  'industrias_ns': [-99.1352, 19.4306], // Av. Industrias Norte-Sur
  'industrias_sn': [-99.1372, 19.4286], // Av. Industrias Sur-Norte
};

function CameraMarker({ camera, onClick }: CameraMarkerProps) {
  const coordinates = CAMERA_COORDINATES[camera.camera_id] || [-99.1332, 19.4326];
  
  // Determine traffic level based on total count
  const totalTraffic = camera.total_in + camera.total_out;
  const trafficLevel = totalTraffic > 100 ? 'high' : totalTraffic > 50 ? 'medium' : 'low';
  
  // Determine trend (simplified - in real app this would compare with previous data)
  const trend = camera.total_in > camera.total_out ? 'in' : 'out';
  
  const markerColor = {
    high: '#ef4444', // red
    medium: '#f59e0b', // yellow
    low: '#22c55e', // green
  }[trafficLevel];

  return (
    <Marker longitude={coordinates[0]} latitude={coordinates[1]} anchor="bottom">
      <div
        className="relative cursor-pointer transform transition-transform hover:scale-110"
        onClick={onClick}
      >
        {/* Camera icon with traffic indicator */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg"
          style={{ backgroundColor: markerColor }}
        >
          <Camera className="w-5 h-5" />
        </div>
        
        {/* Traffic indicator */}
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white flex items-center justify-center">
          {trend === 'in' ? (
            <TrendingDown className="w-3 h-3 text-green-600" />
          ) : (
            <TrendingUp className="w-3 h-3 text-red-600" />
          )}
        </div>
        
        {/* Pulse animation for high traffic */}
        {trafficLevel === 'high' && (
          <div 
            className="absolute inset-0 rounded-full animate-ping opacity-75"
            style={{ backgroundColor: markerColor }}
          />
        )}
      </div>
    </Marker>
  );
}

export default function TrafficMap({ cameras, onCameraClick }: TrafficMapProps) {
  const [selectedCamera, setSelectedCamera] = useState<LiveCount | null>(null);
  // Calculate initial view state based on camera locations
  const initialViewState = useMemo(() => {
    if (cameras.length === 0) {
      return {
        longitude: -99.1332,
        latitude: 19.4326,
        zoom: 14,
      };
    }
    
    const coordinates = cameras
      .map(camera => CAMERA_COORDINATES[camera.camera_id])
      .filter(Boolean) as [number, number][];
    
    if (coordinates.length === 0) {
      return {
        longitude: -99.1332,
        latitude: 19.4326,
        zoom: 14,
      };
    }
    
    const lngs = coordinates.map(coord => coord[0]);
    const lats = coordinates.map(coord => coord[1]);
    
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    
    // Calculate center and appropriate zoom
    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2;
    
    // Simple zoom calculation (could be improved)
    const lngDiff = maxLng - minLng;
    const latDiff = maxLat - minLat;
    const maxDiff = Math.max(lngDiff, latDiff);
    const zoom = Math.max(10, Math.min(15, 15 - Math.log2(maxDiff * 100)));
    
    return {
      longitude: centerLng,
      latitude: centerLat,
      zoom,
    };
  }, [cameras]);

  const [viewState, setViewState] = useState(initialViewState);

  const handleCameraClick = useCallback((camera: LiveCount) => {
    setSelectedCamera(camera);
    onCameraClick?.(camera);
  }, [onCameraClick]);

  if (cameras.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Traffic Map</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <Camera className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No camera data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Traffic Map</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Low Traffic</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Medium Traffic</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>High Traffic</span>
          </div>
        </div>
      </div>
      
      <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        >
          {/* Navigation controls */}
          <NavigationControl position="top-right" />
          <ScaleControl position="bottom-left" />
          <GeolocateControl position="bottom-right" />
          
          {/* Camera markers */}
          {cameras.map((camera) => (
            <CameraMarker
              key={camera.camera_id}
              camera={camera}
              onClick={() => handleCameraClick(camera)}
            />
          ))}
          
          {/* Popup for selected camera */}
          {selectedCamera && (
            <Popup
              longitude={CAMERA_COORDINATES[selectedCamera.camera_id]?.[0] || -99.1332}
              latitude={CAMERA_COORDINATES[selectedCamera.camera_id]?.[1] || 19.4326}
              anchor="bottom"
              onClose={() => setSelectedCamera(null)}
              className="rounded-lg"
            >
              <div className="p-3 min-w-48">
                <h4 className="font-semibold text-sm mb-2">{selectedCamera.camera_name}</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total In:</span>
                    <span className="font-medium text-green-600">{selectedCamera.total_in}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Out:</span>
                    <span className="font-medium text-red-600">{selectedCamera.total_out}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cars:</span>
                    <span className="font-medium">
                      {selectedCamera.counts.car_in} / {selectedCamera.counts.car_out}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Buses:</span>
                    <span className="font-medium">
                      {selectedCamera.counts.bus_in} / {selectedCamera.counts.bus_out}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trucks:</span>
                    <span className="font-medium">
                      {selectedCamera.counts.truck_in} / {selectedCamera.counts.truck_out}
                    </span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                  Last updated: {new Date(selectedCamera.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </Popup>
          )}
        </Map>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        <Activity className="w-3 h-3 inline mr-1" />
        Real-time traffic visualization • Click cameras for details
      </div>
    </div>
  );
}
