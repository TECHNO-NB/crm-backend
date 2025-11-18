"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("./app.js");
const dotenv_1 = require("dotenv");
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
(0, dotenv_1.config)();
const port = process.env.PORT || 8000;
// cluster
if (cluster_1.default.isPrimary) {
    const totalCpu = os_1.default.cpus().length;
    console.log(`Primary ${process.pid} running, forking ${totalCpu} workers...`);
    for (let i = 0; i < totalCpu; i++) {
        cluster_1.default.fork();
    }
    cluster_1.default.on('exit', (worker) => {
        console.error(`Worker ${worker.process.pid} died. Restarting...`);
        cluster_1.default.fork();
    });
}
else {
    app_js_1.app.get("/health", (req, res) => {
        res.send("Health is working now");
    });
    app_js_1.app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
