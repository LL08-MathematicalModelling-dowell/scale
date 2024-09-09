import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './src/routes/index.js';
import { connectToDb } from './src/config/db.config.js';
import config from './src/config/index.js';
import { getCurrentTimestamp } from "./src/utils/helper.js"
import { saveLocationWorker } from "./src/config/workers.config.js"
import os from 'os';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

app.use('/v1/', routes);

app.get('/', (req, res) => {
    const now = getCurrentTimestamp();
    return res.status(200).json({ 
        success: true,
        version: "1.0.0",
        status: "UP",
        timestamp: now,
        server_time: now,
        cpuUsage: os.loadavg(),
        totalMemory: `${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`,
        freeMemory: `${(os.freemem() / 1024 / 1024).toFixed(2)} MB`,
        uptime: `${process.uptime().toFixed(2)} Second`,
        memoryUsage: {
            heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
            heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
        },
        message: "Microservices is running fine" 
    });
});


app.all('*', (_req, res) => {
    return res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const onListening = () => {
    console.log(`Listening on port ${config.PORT}`);
};

const initializeWorker = (worker, name) => {
    worker.on('completed', (job) => {
        console.log(`Job ${name} completed with result: ${job.returnvalue}`);
    });

    worker.on('failed', (job, err) => {
        console.error(`Job ${name} ${job.id} failed with error: ${err.message}`);
    });

    worker
        .waitUntilReady()
        .then(() => {
            console.log(`${name} started successfully`);
        })
        .catch((error) => {
            console.error(`Failed to start ${name}:`, error);
        });
};


connectToDb()
.then(()=>{
    initializeWorker(saveLocationWorker, 'Save Location Worker');
    app.listen(config.PORT, onListening);
}).catch((error) => {
    return { error: 'Failed to connect to DB' }
});
