import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import config from "./src/config/index.js";
import { initSystemSocket } from "./src/modules/system/system.socket.js";
import { initAuditSocket } from "./src/modules/audit/audit.socket.js";

export interface AuthenticatedSocket extends Socket {
  user?: any;
}

export const bootStapSocket = (io: Server) => {
  // 1. Socket.IO Authentication Middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];
    if (!token) {
      socket.user = { id: "anonymous", role: "GUEST" };
      return next();
    }
    try {
      if (config.JWT_ACCESS_TOKEN_SECRET) {
        const decoded = jwt.verify(token, config.JWT_ACCESS_TOKEN_SECRET);
        socket.user = decoded;
      }
      next();
    } catch (err: any) {
      socket.user = { id: "anonymous", role: "GUEST" };
      next();
    }
  });

  // 2. System Telemetry Stream
  initSystemSocket(io);

  // 3. Live Audit Stream Socket
  initAuditSocket(io);

  // 4. Global Socket Event Listeners & Rooms
  io.on("connection", (socket: Socket) => {
    // Ticket / Support Channel
    socket.on("joinTicket", (ticketId: string) => {
      socket.join(ticketId);
    });

    // Booking Live Room (for instant traveler updates)
    socket.on("joinBooking", (bookingId: string) => {
      socket.join(`booking_${bookingId}`);
    });

    socket.on("disconnect", () => {
      // Clean disconnect handler
    });
  });
};

export const socketBootstraps = bootStapSocket;

