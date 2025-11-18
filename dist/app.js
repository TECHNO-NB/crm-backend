"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
exports.admin = firebase_admin_1.default;
const errorHandler_1 = __importDefault(require("./helpers/errorHandler"));
// Import Routes
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const asset_routes_js_1 = __importDefault(require("./routes/asset.routes.js"));
const donation_routes_js_1 = __importDefault(require("./routes/donation.routes.js"));
const event_routes_js_1 = __importDefault(require("./routes/event.routes.js"));
const expense_routes_js_1 = __importDefault(require("./routes/expense.routes.js"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const school_routes_1 = __importDefault(require("./routes/school.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const country_routes_js_1 = __importDefault(require("./routes/country.routes.js"));
const dashboard_routes_js_1 = __importDefault(require("./routes/dashboard.routes.js"));
const financial_routes_js_1 = __importDefault(require("./routes/financial.routes.js"));
const financedashboard_routes_js_1 = __importDefault(require("./routes/financedashboard.routes.js"));
const countrymanager_dashboard_routes_js_1 = __importDefault(require("./routes/countrymanager.dashboard.routes.js"));
const countrymanager_user_routes_js_1 = __importDefault(require("./routes/countrymanager.user.routes.js"));
const app = (0, express_1.default)();
exports.app = app;
// 🌐 CORS Configuration
app.use((0, cors_1.default)({
    origin: ['*', process.env.FRONTEND_URL, process.env.FRONTEND_URL_ADMIN],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
}));
//  Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 50, // max 50 requests
    handler: (req, res) => {
        console.log(`Rate limit hit`);
        res.status(429).json({ message: 'Too many requests, slow down!' });
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// 🧩 Global Middlewares
app.use((0, cookie_parser_1.default)());
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('short'));
app.use(express_1.default.json({ limit: '5mb' }));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: '5mb' }));
app.use(express_1.default.static('./public'));
// 🧯 Error Handler Middleware
app.use(errorHandler_1.default);
// 🩵 Health Check Route
app.get('/', (req, res) => {
    console.log('HIT SERVER');
    return res.status(200).json({ success: false, message: 'nice to meet' });
});
// 🧭 Register All Routes
app.use('/api/v1/auth', auth_routes_js_1.default);
app.use('/api/v1/users', user_routes_1.default);
app.use('/api/v1/projects', project_routes_1.default);
app.use('/api/v1/events', event_routes_js_1.default);
app.use('/api/v1/donations', donation_routes_js_1.default);
app.use('/api/v1/expenses', expense_routes_js_1.default);
app.use('/api/v1/assets', asset_routes_js_1.default);
app.use('/api/v1/messages', message_routes_1.default);
app.use('/api/v1/notifications', notification_routes_1.default);
app.use('/api/v1/reports', report_routes_1.default);
app.use('/api/v1/schools', school_routes_1.default);
app.use('/api/v1/country', country_routes_js_1.default);
app.use('/api/v1/dashboard', dashboard_routes_js_1.default);
app.use('/api/v1/financial', financial_routes_js_1.default);
app.use('/api/v1/countrymanager', countrymanager_dashboard_routes_js_1.default);
app.use('/api/v1/financedashboard', financedashboard_routes_js_1.default);
app.use('/api/v1/countrymanageruser', countrymanager_user_routes_js_1.default);
