import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponse & { socket: any }) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Store connected clients
    const connectedClients = new Set();

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      connectedClients.add(socket.id);

      // Send initial data when client connects
      socket.emit('connected', { message: 'Connected to traffic updates' });

      // Handle camera subscription
      socket.on('subscribe-camera', (cameraId: string) => {
        console.log(`Client ${socket.id} subscribed to camera ${cameraId}`);
        socket.join(`camera-${cameraId}`);
      });

      socket.on('unsubscribe-camera', (cameraId: string) => {
        console.log(`Client ${socket.id} unsubscribed from camera ${cameraId}`);
        socket.leave(`camera-${cameraId}`);
      });

      // Handle refresh requests
      socket.on('request-refresh', async () => {
        try {
          // Fetch fresh data from traffic API
          const response = await fetch('https://api.trafic.mx/api/v1/live/counts');
          const data = await response.json();
          
          // Broadcast to all connected clients
          io.emit('traffic-update', data);
        } catch (error) {
          console.error('Error fetching fresh data:', error);
          socket.emit('error', { message: 'Failed to fetch fresh data' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        connectedClients.delete(socket.id);
      });
    });

    // Simulate real-time traffic updates (in production, this would come from your actual traffic system)
    const simulateTrafficUpdate = () => {
      // Generate random traffic data
      const mockData = [
        {
          camera_id: 'homero_oe',
          camera_name: 'Av. Homero Oeste-Este',
          counts: {
            car_in: Math.floor(Math.random() * 30) + 10,
            car_out: Math.floor(Math.random() * 30) + 10,
            bus_in: Math.floor(Math.random() * 10) + 2,
            bus_out: Math.floor(Math.random() * 10) + 2,
            truck_in: Math.floor(Math.random() * 5),
            truck_out: Math.floor(Math.random() * 5),
          },
          total_in: 0,
          total_out: 0,
          timestamp: new Date().toISOString(),
        },
        {
          camera_id: 'homero_eo',
          camera_name: 'Av. Homero Este-Oeste',
          counts: {
            car_in: Math.floor(Math.random() * 30) + 10,
            car_out: Math.floor(Math.random() * 30) + 10,
            bus_in: Math.floor(Math.random() * 10) + 2,
            bus_out: Math.floor(Math.random() * 10) + 2,
            truck_in: Math.floor(Math.random() * 5),
            truck_out: Math.floor(Math.random() * 5),
          },
          total_in: 0,
          total_out: 0,
          timestamp: new Date().toISOString(),
        },
        // Add more cameras as needed
      ];

      // Calculate totals
      mockData.forEach(camera => {
        camera.total_in = camera.counts.car_in + camera.counts.bus_in + camera.counts.truck_in;
        camera.total_out = camera.counts.car_out + camera.counts.bus_out + camera.counts.truck_out;
      });

      // Broadcast to all connected clients
      if (connectedClients.size > 0) {
        io.emit('traffic-update', mockData);
        
        // Also send individual camera updates to specific rooms
        mockData.forEach(camera => {
          io.to(`camera-${camera.camera_id}`).emit('camera-update', camera);
        });

        // Simulate occasional alerts
        if (Math.random() > 0.95) {
          const alerts = [
            'High traffic detected on Av. Homero',
            'Camera maintenance scheduled',
            'Unusual traffic pattern detected',
          ];
          const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
          io.emit('traffic-alert', randomAlert);
        }
      }
    };

    // Start simulation interval (every 5 seconds)
    const updateInterval = setInterval(simulateTrafficUpdate, 5000);

    // Clean up on server shutdown
    res.socket.server.io = io;
    
    // Store interval for cleanup
    (res.socket.server as any).updateInterval = updateInterval;
  }
  
  res.end();
};

export default SocketHandler;
