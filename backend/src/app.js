import dotenv from "dotenv";
dotenv.config();

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
      h2 { margin-top: 30px; color: #22c55e; }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      th, td {
        border: 1px solid #334155;
        padding: 10px;
        text-align: left;
      }
      th {
        background: #1e293b;
      }
      tr:hover {
        background: #1e293b;
      }
      .method {
        font-weight: bold;
        padding: 4px 8px;
        border-radius: 5px;
      }
      .get { background: #22c55e; }
      .post { background: #3b82f6; }
      .patch { background: #eab308; color: black; }
      .delete { background: #ef4444; }
    </style>
  </head>
  <body>

    <h1> Video Player API Documentation</h1>

    <h2> Authentication</h2>
    <table>
      <tr><th>Method</th><th>Endpoint</th><th>Description</th></tr>
      <tr><td class="method post">POST</td><td>/api/v1/users/register</td><td>Register new user</td></tr>
      <tr><td class="method post">POST</td><td>/api/v1/users/login</td><td>User login</td></tr>
      <tr><td class="method get">GET</td><td>/api/v1/users/me</td><td>Get current user details</td></tr>
    </table>

    <h2> Videos</h2>
    <table>
      <tr><th>Method</th><th>Endpoint</th><th>Description</th></tr>
      <tr><td class="method post">POST</td><td>/api/v1/videos/upload</td><td>Upload video (editor/admin only)</td></tr>
      <tr><td class="method get">GET</td><td>/api/v1/videos</td><td>Get all organization videos</td></tr>
      <tr><td class="method get">GET</td><td>/api/v1/videos/filter</td><td>Filter videos (status, search, sort)</td></tr>
      <tr><td class="method get">GET</td><td>/api/v1/videos/:id</td><td>Get specific video details</td></tr>
      <tr><td class="method delete">DELETE</td><td>/api/v1/videos/:id</td><td>Delete video (owner/admin only)</td></tr>
      <tr><td class="method get">GET</td><td>/api/v1/videos/stream/:id</td><td>Stream video with range support</td></tr>
    </table>

    <h2> Admin (Admin Only)</h2>
    <table>
      <tr><th>Method</th><th>Endpoint</th><th>Description</th></tr>
      <tr><td class="method get">GET</td><td>/api/v1/admin/users</td><td>Get all organization users</td></tr>
      <tr><td class="method patch">PATCH</td><td>/api/v1/admin/users/:id/role</td><td>Update user role</td></tr>
      <tr><td class="method delete">DELETE</td><td>/api/v1/admin/users/:id</td><td>Delete user</td></tr>
      <tr><td class="method get">GET</td><td>/api/v1/admin/videos</td><td>Get all organization videos</td></tr>
      <tr><td class="method get">GET</td><td>/api/v1/admin/stats</td><td>Get system statistics</td></tr>
    </table>

  </body>
  </html>
  `);
});

export { app }
