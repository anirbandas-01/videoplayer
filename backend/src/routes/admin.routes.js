import { Router } from "express";
import {
    getAllUsers,
    updateUserRole,
    deleteUser,
    getAllOrganizationVideos,
    getSystemStats
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/rbac.middleware.js";

const router = Router();


router.use(verifyJWT, adminOnly);


router.route("/users").get(getAllUsers);
router.route("/users/:userId/role").patch(updateUserRole);
router.route("/users/:userId").delete(deleteUser);


router.route("/videos").get(getAllOrganizationVideos);


router.route("/stats").get(getSystemStats);

export default router;