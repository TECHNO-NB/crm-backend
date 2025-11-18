"use strict";
// error handling
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (req, res, next) => {
    process.on('uncaughtException', (err, next) => {
        console.error('Uncaught Exception:', err.message);
        process.exit(1);
    });
    process.on('unhandledRejection', (promise, reason) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        process.exit(1);
    });
    process.on('SIGINT', (err) => {
        console.log('Received SIGINT. Gracefully shutting down.');
        process.exit(0);
    });
    process.on('SIGTERM', () => {
        console.log('Received SIGTERM. Gracefully shutting down.');
        process.exit(0);
    });
    next();
};
exports.default = errorHandler;
