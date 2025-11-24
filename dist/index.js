"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("./app.js");
const dotenv_1 = require("dotenv");
// import cluster from 'cluster';
// import os from 'os';
(0, dotenv_1.config)();
const port = process.env.PORT || 8000;
// cluster
// if (cluster.isPrimary) {
//   const totalCpu = os.cpus().length;
//   console.log(`Primary ${process.pid} running, forking ${totalCpu} workers...`);
//   for (let i = 0; i < totalCpu; i++) {
//     cluster.fork();
//   }
//   cluster.on('exit', (worker) => {
//     console.error(`Worker ${worker.process.pid} died. Restarting...`);
//     cluster.fork();
//   });
// } else {
app_js_1.app.get("/health", (req, res) => {
    res.send("Health is working now");
});
app_js_1.app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
// }
