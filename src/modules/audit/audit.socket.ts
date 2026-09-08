import { Server, Socket } from "socket.io";

let ioInstance: Server | null = null;

export const initAuditSocket = (io: Server) => {
  ioInstance = io;

  io.on("connection", (socket: Socket) => {
    // Client subscribes to live audit logs terminal
    socket.on("audit:subscribe", () => {
      socket.join("audit_stream");
    });

    socket.on("audit:unsubscribe", () => {
      socket.leave("audit_stream");
    });
  });
};

export const broadcastAuditLog = (auditLog: any) => {
  if (ioInstance) {
    // Send to audit_stream room and as global event
    ioInstance.to("audit_stream").emit("audit:stream:new", auditLog);
    ioInstance.emit("audit:log", auditLog);
  }
};
