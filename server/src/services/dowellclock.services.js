import axios from 'axios';

const dowelltime = async (timezone) => {
    const url = 'https://100009.pythonanywhere.com/dowellclock/';
    const payload = {
        timezone: timezone
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        return {
            success: true,
            response: response.data
        }
    } catch(error){
        return{
            success: false,
            error: error
        }
    }
}

export{dowelltime}