"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const country_controller_js_1 = require("../controllers/country.controller.js");
const authMiddleware_js_1 = require("../middlewares/authMiddleware.js");
const router = express_1.default.Router();
/**
 * @route   POST /api/v1/country
 * @desc    Create a new country
 * @access  Private (Admin)
 */
router.post('/countys', authMiddleware_js_1.jwtVerify, country_controller_js_1.createCountryController);
router.get('/', country_controller_js_1.getAllCountriesController);
/**
 * @route   GET /api/v1/country/:id
 * @desc    Get a country by ID
 * @access  Public
 */
router.get('/:id', country_controller_js_1.getCountryByIdController);
/**
 * @route   PUT /api/v1/country/:id
 * @desc    Update country
 * @access  Private (Admin)
 */
router.put('/:id', authMiddleware_js_1.jwtVerify, country_controller_js_1.updateCountryController);
/**
 * @route   DELETE /api/v1/country/:id
 * @desc    Delete country
 * @access  Private (Admin)
 */
router.delete('/:id', authMiddleware_js_1.jwtVerify, (0, authMiddleware_js_1.authorizeRoles)('admin,chairperson,chairperosn'), country_controller_js_1.deleteCountryController);
exports.default = router;
