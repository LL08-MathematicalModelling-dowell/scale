import { Queue } from 'bullmq';
import config from './index.js';


const saveDataToLocationDatacube = new Queue('insert-to-location-datacube', {
    connection: {
        host: config.redisHost,
        port: config.redisPort,
        password: config.redisPassword
    }
});

const saveLocationData = async (data) => {
    try {
        const response = await saveDataToLocationDatacube.add('save location details to location datacube', data);
        console.log("Added data to update queue", response.id);
        if (!response) {
            return {
                success: false,
                message: `Failed to produce data to Datacube.`
            };
        } else {
            return {
                success: true,
                message: `Data produced to Datacube successfully`
            };
        }
    } catch (error) {
        return {
            success: false,
            message: `Error: ${error.message}`
        };
    }
};

const sendFeedbackEmailServices = new Queue('send-feedback-email', {
    connection: {
        host: config.redisHost,
        port: config.redisPort,
        password: config.redisPassword
    }
});

const sendEmailToOwner = async (data) => {
    try {
        const response = await sendFeedbackEmailServices.add('sending feedback email to owner', data);
        console.log("Added data to update queue", response.id);
        if (!response) {
            return {
                success: false,
                message: `Failed to produce data to Datacube.`
            };
        } else {
            return {
                success: true,
                message: `Data produced to Datacube successfully`
            };
        }
    } catch (error) {
        return {
            success: false,
            message: `Error: ${error.message}`
        };
    }
};
export {
    saveLocationData,
    sendEmailToOwner
}