import express from "express";
import { getAllUsersFromManagerCountry } from "../controllers/countrymanager.user.controller";
import { jwtVerify,authorizeRoles } from "../middlewares/authMiddleware";


const router = express.Router();

// GET /api/v1/countrymanageruser
router.get("/:country", jwtVerify,authorizeRoles("admin","volunteer","country_manager"),getAllUsersFromManagerCountry);

export default router;
