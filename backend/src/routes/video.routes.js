import { Router } from "express";

import { deleteVideo, getAllVideos, getVideoById, streamVideo, uploadVideo } from "../controllers/video.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();

router.route("/").post(verifyJWT, upload.single("video"), uploadVideo);

router.route("/").get(verifyJWT, getAllVideos);

router.route("/:id").get(verifyJWT, getVideoById);

router.route("/:id").delete(verifyJWT, deleteVideo);

router.route("/stream/:id").get(verifyJWT, streamVideo);

export default router;