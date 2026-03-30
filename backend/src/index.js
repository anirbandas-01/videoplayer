import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});


import connectDB from "./db/index.js";
import { app } from "./app.js";

import http from "http";
import { Server  } from "socket.io";
import jwt from "jsonwebtoken";


const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "*",
        credentials: true
    },
});

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    const token = socket.handshake.auth.token;

    if(!token) {
        console.log("NO token provided, disconnecting...");
        socket.disconnect();
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        socket.join(`user_${decoded.id}`);

        socket.join(`org_${decoded.organizationId}`);

        console.log(`User ${decoded.id} joined rooms: user_${decoded.id}, org_${decoded.organizationId}`);

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });

    } catch (error) {
        console.log("Invalid token, disconnecting...");
        socket.disconnect();
    }
})

app.set("io", io);

connectDB()
       .then( () => {
        server.listen(process.env.PORT || 8000, () => {
            console.log(`server is running at port: ${process.env.PORT}`);
    })
})
 .catch((error) => {
    console.log("MONGO db connection failed!", error)
})