import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { TonClient } from '@ton/ton';
import { getHttpEndpoint } from "@orbs-network/ton-access";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

const WAGER_MASTER_ADDRESS = 'EQCtLZVWDFBXx5lwRcCl8KCbxi0KhABriITZyyQyg1MRoZPn';

const endpoint = await getHttpEndpoint({ network: "testnet" });
const client = new TonClient({ endpoint });

// In-memory storage for wagers (replace with a database in production)
const wagers = new Map();

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Send initial wager data to the client
  socket.emit('initialWagers', Array.from(wagers.values()));

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, io, client, wagers };