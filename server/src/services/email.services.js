import axios from 'axios';
import { generateOtpEmailContent } from '../utils/helper.js';

const sendEmail = async (toname, toemail,otp) => {
    const url = "https://100085.pythonanywhere.com/api/email/";

    const emailContent = generateOtpEmailContent(toname, otp);

    const payload = {
        toname: toname,
        toemail: toemail,
        subject: "OTP verification for DoWell Voice of Customers",
        email_content: emailContent
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        console.log('Email sent successfully:', response.data);
        return {
            success: true,
            message: 'Email sent successfully'
        }
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            success: false,
            message: 'Failed to send email. Please try again.'
        }
    }
}

export {
    sendEmail
}