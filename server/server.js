const { Server } = require("socket.io");

const io = new Server(8001, {
  cors: true,
});

const emailToSocketID = new Map();
const socketIDToEmail = new Map();

io.on("connection", (socket) => {
  console.log(`Connected ${socket.id}`);

  socket.on("room:join", (data) => {
    const { email, roomID } = data;
    emailToSocketID.set(email, roomID);
    socketIDToEmail.set(roomID, email);
    io.to(roomID).emit("user:joined", { email, id: socket.id });
    socket.join(roomID);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", (data) => {
    const { to, offer } = data;

    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });
  socket.on("peer:nego:needed", ({ offer, to }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });
  socket.on("peer:nego:done", ({ to, answer }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, answer });
  });
});
