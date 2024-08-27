import { Worker } from 'bullmq';
import config from './index.js';
import Datacubeservices from '../services/datacube.services.js';

const saveLocationWorker = new Worker(
    'insert-to-location-datacube',
    async (job) => {
        try {
            const datacube = new Datacubeservices("1b834e07-c68b-4bf6-96dd-ab7cdc62f07f");
            const { workspaceId, latitude, longitude, event, scaleId, userId, createdAt } = job.data;
            const dataToBeInsert = {
                workspaceId,
                latitude,
                longitude,
                event,
                createdAt,
                records: [{ "record": "1", "type": "overall" }]
            };
            if (scaleId) {
                dataToBeInsert.scaleId = scaleId;
            }
            if (userId) {
                dataToBeInsert.userId = userId;  // Corrected assignment
            }

            const response = await datacube.dataInsertion(
                "voc",
                "user_location_data",
                dataToBeInsert
            );

            console.log(response.data);

            if (!response.success) {
                console.log("all failed");
                return false;
            }

            return true;

        } catch (error) {
            console.error("Job failed with error:", error);  // Improved error logging
            return false;
        }
    },
    {
        connection: {
            host: config.redisHost,
            port: config.redisPort,
            password: config.redisPassword
        },
        timeout: 300000,
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 10000
        }
    }
);

export {
    saveLocationWorker
};