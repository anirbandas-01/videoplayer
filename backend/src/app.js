import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express()

app.use(cors( {
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())



import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import adminRouter from "./routes/admin.routes.js";



app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/admin", adminRouter);



app.get("/api-docs", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>API Docs</title>
      <style>
        body {
          font-family: Arial;
          padding: 20px;
          background: #0f172a;
          color: white;
        }
        h1 { color: #38bdf8; }
        h2 { margin-top: 20px; }
        ul { line-height: 1.8; }
        li { color: #e2e8f0; }
      </style>
    </head>
    <body>
      <h1>🚀 API Documentation</h1>

      <h2>🔐 Auth</h2>
      <ul>
        <li>POST /api/v1/auth/login</li>
        <li>POST /api/v1/auth/register</li>
      </ul>

      <h2>🎬 Videos</h2>
      <ul>
        <li>GET /api/v1/videos</li>
        <li>POST /api/v1/videos</li>
      </ul>

      <h2>👤 Users</h2>
      <ul>
        <li>GET /api/v1/users/profile</li>
      </ul>

    </body>
    </html>
  `);
});

export { app }
