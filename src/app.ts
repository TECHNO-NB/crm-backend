import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import admin from 'firebase-admin';
import errorHandler from './helpers/errorHandler';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import assetRoutes from './routes/asset.routes.js';
import donationRoutes from './routes/donation.routes.js';
import eventRoutes from './routes/event.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import messageRoutes from './routes/message.routes';
import notificationRoutes from './routes/notification.routes';
import projectRoutes from './routes/project.routes';
import reportRoutes from './routes/report.routes';
import schoolRoutes from './routes/school.routes';
import userRoutes from './routes/user.routes';
import countryRoutes from './routes/country.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import financialRoutes from './routes/financial.routes.js';
import financialdashboardRoutes from './routes/financedashboard.routes.js';
import countrymanagerdashboardRoutes from './routes/countrymanager.dashboard.routes.js';
import countrymanageruserRoutes from './routes/countrymanager.user.routes.js';

const app = express();

// 🌐 CORS Configuration
app.use(
  cors({
    origin: [process.env.FRONTEND_URL!, process.env.FRONTEND_URL_ADMIN!],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  })
);

// app.set('trust proxy', true);
//  Rate Limiting
// const limiter = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute
//   max: 50, // max 50 requests
//   handler: (req, res) => {
//     console.log(`Rate limit hit`);
//     res.status(429).json({ message: 'Too many requests, slow down!' });
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use(limiter);

// 🧩 Global Middlewares
app.use(cookieParser());
app.use(helmet());
app.use(compression());
app.use(morgan('short'));
app.use(express.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.static('./public'));

// 🧯 Error Handler Middleware
app.use(errorHandler);

// 🩵 Health Check Route
app.get('/', (req, res) => {
  console.log('HIT SERVER');
  return res.status(200).json({ success: false, message: 'nice to meet' });
});

// 🧭 Register All Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/donations', donationRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/schools', schoolRoutes);
app.use('/api/v1/country', countryRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/financial', financialRoutes);
app.use('/api/v1/countrymanager', countrymanagerdashboardRoutes);
app.use('/api/v1/financedashboard', financialdashboardRoutes);
app.use('/api/v1/countrymanageruser', countrymanageruserRoutes);

export { app, admin };
