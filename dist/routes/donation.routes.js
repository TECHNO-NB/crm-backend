"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const donation_controller_js_1 = require("../controllers/donation.controller.js");
const authMiddleware_js_1 = require("../middlewares/authMiddleware.js");
const multerMiddleware_js_1 = __importDefault(require("../middlewares/multerMiddleware.js"));
const router = (0, express_1.Router)();
// Any authenticated user can view donations
router.get('/', authMiddleware_js_1.jwtVerify, donation_controller_js_1.getAllDonations);
router.get('/:id', authMiddleware_js_1.jwtVerify, donation_controller_js_1.getDonationById);
// Only admin or finance role can create/update/delete
router.post('/', multerMiddleware_js_1.default.single('receiptUrl'), authMiddleware_js_1.jwtVerify, (0, authMiddleware_js_1.authorizeRoles)('admin', 'finance', "country_manager"), donation_controller_js_1.createDonation);
router.put('/:id', authMiddleware_js_1.jwtVerify, (0, authMiddleware_js_1.authorizeRoles)('admin', 'finance'), donation_controller_js_1.updateDonation);
router.delete('/:id', authMiddleware_js_1.jwtVerify, (0, authMiddleware_js_1.authorizeRoles)('admin', 'finance'), donation_controller_js_1.deleteDonation);
exports.default = router;
