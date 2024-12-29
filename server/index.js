import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";

const port = 3000;
const app = express()

const server = createServer(app);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });


const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});


  app.use(
    cors({
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    })
  );
  
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  

// io.on('connection', (socket) => {
//     socket.on('reqTurn', (data) => {
//         const room = JSON.parse(data).room
//         io.to(room).emit('playerTurn', data)
//     })

//     socket.on('create', room => {
//         socket.join(room)
//     })

//     socket.on('join', room => {
//         socket.join(room)
//         io.to(room).emit('opponent_joined')
//     })

//     socket.on('reqRestart', (data) => {
//         const room = JSON.parse(data).room
//         io.to(room).emit('restart')
//     })
// });

io.on('connection', (socket)=>{

    console.log("user connected");
    console.log("Id", socket.id)

    // socket.emit('message', `welcome to the tic tac gamem ${socket.id}`);
    // socket.broadcast.emit('message', `${socket.id} has joined the game`); //it broadcasts to everyone int he grp except the user who is connecting

    socket.on('message', (data)=>{
      console.log(data);
    })

    socket.on('disconnect', ()=>{ 
      console.log(" user disconnected", socket.id);
    })
})