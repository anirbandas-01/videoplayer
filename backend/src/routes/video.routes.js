import { Router } from "express";

import { deleteVideo, getAllVideos, getFilteredVideos, getVideoById, streamVideo, uploadVideo } from "../controllers/video.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { editOrAdmin } from "../middlewares/rbac.middleware.js";


const router = Router();

router.route("/upload").post(verifyJWT, editOrAdmin, upload.single("video"), uploadVideo);

router.route("/").get(verifyJWT, getAllVideos);

router.route("/filter").get(verifyJWT, getFilteredVideos);

router.route("/:id").get(verifyJWT, getVideoById);

router.route("/:id").delete(verifyJWT, deleteVideo);

router.route("/stream/:id").get(verifyJWT, streamVideo);

export default router;