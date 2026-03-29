import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});


import connectDB from "./db/index.js";
import { app } from "./app.js";

import http from "http";
import { Server  } from "socket.io";


const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

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