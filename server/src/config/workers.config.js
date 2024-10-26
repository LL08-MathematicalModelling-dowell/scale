import { Worker } from 'bullmq';
import config from './index.js';
import Datacubeservices from '../services/datacube.services.js';
import { sendFeedbackEmail } from '../services/email.services.js'

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
            console.error("Job failed with error:", error);  
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

const sendFeedbackEmailWorker = new Worker('send-feedback-email',
    async (job) => {
        try {
            const { workspaceId, customerName, customerEmail, location, latitude, longitude, scaleResponse, description,type,formattedDate } = job.data;
            // workspace_id=66c3a354c0c8c6fbadd5fed4&username=VOCABC&scale_id=66c9d21e9090b1529d108a63&scale_type=likert
            const datacube = new Datacubeservices("1b834e07-c68b-4bf6-96dd-ab7cdc62f07f");
            const email = await datacube.dataRetrieval(
                "voc",
                "voc_user_management",
                { 
                    workspace_id: workspaceId,
                    "email": { 
                        "$exists": true,  
                        "$ne": ""  
                    }
                },
                0,
                0
            )
        
            if (!email || email.data.length === 0) {
                return false
            }
            console.log(email);
        
            const data = {
                customerName: customerName,
                customerEmail: customerEmail,
                description: description,
                location: location,
                latitude: latitude,
                longitude: longitude,
                scaleResponse: scaleResponse,
                productId: email.data[0].workspace_owner_name,
                customerId: email.data[0].portfolio,
                userId: email.data[0].portfolio_username,
                type,
                ownerEmail: email.data[0]?.email,
                formattedDate: formattedDate
            }

            const response = await sendFeedbackEmail(data)

            if (!response.success) {
                console.log("all failed");
                return false;
            }

            return true;

        } catch (error) {
            console.error("Job failed with error:", error); 
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
)
export {
    saveLocationWorker,
    sendFeedbackEmailWorker
};