'use client';

import { useState, useCallback, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, ScaleControl, GeolocateControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LiveCount } from '@/types/api';
import { Camera, Activity, TrendingUp, TrendingDown, History, Maximize2, Minimize2 } from 'lucide-react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import TrafficHistory from './TrafficHistory';
import { Button } from './ui/Button';
import { formatMexicoCityTime } from '@/lib/timezone';

interface TrafficMapProps {
  cameras: LiveCount[];
  onCameraClick?: (camera: LiveCount) => void;
  showHistory?: boolean;
}

interface CameraMarkerProps {
  camera: LiveCount;
  onClick: () => void;
}

function TrafficHistoryPanel({ cameraId }: { cameraId?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" />
          Traffic History
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-white"
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {isExpanded ? (
          <TrafficHistory cameraId={cameraId} className="h-full border-0 rounded-none" />
        ) : (
          <div className="p-4 text-center text-slate-500">
            <History className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm">Click expand to view traffic history</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Camera coordinates positioned at the specified location: 28.712335611426948, -106.10549703573227
const CAMERA_COORDINATES: Record<string, [number, number]> = {
  'cam_01': [-106.10549703573227, 28.712335611426948], // Main intersection camera
  'cam_02': [-106.1050, 28.7126], // North of intersection
  'cam_03': [-106.1060, 28.7120], // South of intersection  
  'cam_04': [-106.1052, 28.7118], // East of intersection
};

function CameraMarker({ camera, onClick }: CameraMarkerProps) {
  const coordinates = CAMERA_COORDINATES[camera.camera_id] || [-106.10549703573227, 28.712335611426948];
  
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

export default function TrafficMap({ cameras, onCameraClick, showHistory = true }: TrafficMapProps) {
  const [selectedCamera, setSelectedCamera] = useState<LiveCount | null>(null);
  
  // Calculate initial view state based on camera locations
  const initialViewState = useMemo(() => {
    if (cameras.length === 0) {
      return {
        longitude: -106.10549703573227,
        latitude: 28.712335611426948,
        zoom: 14,
      };
    }
    
    const coordinates = cameras
      .map(camera => CAMERA_COORDINATES[camera.camera_id])
      .filter(Boolean) as [number, number][];
    
    if (coordinates.length === 0) {
      return {
        longitude: -106.10549703573227,
        latitude: 28.712335611426948,
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
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Traffic Map</h3>
        <div className="flex items-center justify-center h-64 text-slate-500">
          <div className="text-center">
            <Camera className="w-12 h-12 mx-auto mb-2 text-slate-400" />
            <p>No camera data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
      <PanelGroup direction="horizontal" className="h-full min-h-[500px]">
        {/* Map Panel */}
        <Panel defaultSize={showHistory ? 60 : 100} minSize={30}>
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Traffic Map</h3>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-600"></div>
                  <span>Low Traffic</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                  <span>Medium Traffic</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-600"></div>
                  <span>High Traffic</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
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
                    longitude={CAMERA_COORDINATES[selectedCamera.camera_id]?.[0] || -106.10549703573227}
                    latitude={CAMERA_COORDINATES[selectedCamera.camera_id]?.[1] || 28.712335611426948}
                    anchor="bottom"
                    onClose={() => setSelectedCamera(null)}
                    className="rounded-lg"
                  >
                    <div className="p-3 min-w-48 bg-slate-900 text-slate-300">
                      <h4 className="font-semibold text-sm mb-2 text-white">{selectedCamera.camera_name}</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total In:</span>
                          <span className="font-medium text-green-400">{selectedCamera.total_in}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Out:</span>
                          <span className="font-medium text-red-400">{selectedCamera.total_out}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Cars:</span>
                          <span className="font-medium">
                            {selectedCamera.counts.car_in} / {selectedCamera.counts.car_out}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Buses:</span>
                          <span className="font-medium">
                            {selectedCamera.counts.bus_in} / {selectedCamera.counts.bus_out}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Trucks:</span>
                          <span className="font-medium">
                            {selectedCamera.counts.truck_in} / {selectedCamera.counts.truck_out}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-slate-500">
                        Last updated: {formatMexicoCityTime(selectedCamera.timestamp)}
                      </div>
                    </div>
                  </Popup>
                )}
              </Map>
            </div>
            
            <div className="p-2 text-xs text-slate-500 text-center border-t border-slate-700">
              <Activity className="w-3 h-3 inline mr-1 text-blue-400" />
              Real-time traffic visualization • Click cameras for details • Location: 28.712335611426948, -106.10549703573227
            </div>
          </div>
        </Panel>

        {/* Resize Handle */}
        {showHistory && (
          <PanelResizeHandle className="w-1 bg-slate-700 hover:bg-slate-600 transition-colors cursor-col-resize" />
        )}

        {/* History Panel */}
        {showHistory && (
          <Panel defaultSize={40} minSize={20}>
            <TrafficHistoryPanel cameraId={selectedCamera?.camera_id} />
          </Panel>
        )}
      </PanelGroup>
    </div>
  );
}
