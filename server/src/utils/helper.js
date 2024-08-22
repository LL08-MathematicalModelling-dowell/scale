const getCurrentTimestamp = () => {
    return new Date().toISOString();
};

const generateAlphanumericOtp = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        otp += characters[randomIndex];
    }
    return otp;
};

const generateOtpEmailContent = (toname, otp) => {
    return `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
    </head>

    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
            <tr>
                <td style="text-align: center; padding-bottom: 20px;">
                    <img src="https://dowellfileuploader.uxlivinglab.online/hr/logo-2-min-min.png" alt="DoWell Voice of Customers Logo"
                        style="max-width: 150px; height: auto;">
                </td>
            </tr>
            <tr>
                <td style="font-size: 16px; color: #333333; padding-bottom: 20px;">
                    Dear ${toname},
                </td>
            </tr>
            <tr>
                <td style="font-size: 16px; color: #333333; padding-bottom: 20px;">
                    Your one-time password (OTP) for verification is:
                </td>
            </tr>
            <tr>
                <td style="text-align: center; padding-bottom: 20px;">
                    <div style="font-size: 24px; font-weight: bold; color: #007BFF;">${otp}</div>
                </td>
            </tr>
            <tr>
                <td style="font-size: 16px; color: #333333; padding-bottom: 20px;">
                    Please use this OTP to complete your verification. The OTP is valid for 10 minutes.
                </td>
            </tr>
            <tr>
                <td style="font-size: 16px; color: #333333; padding-bottom: 20px;">
                    If you did not request this OTP, please ignore this email.
                </td>
            </tr>
            <tr>
                <td style="font-size: 16px; color: #333333; padding-bottom: 20px;">
                    Thank you for using DoWell Voice of Customers.<br>
                    Best regards,<br>
                    DoWell Voice of Customers Team
                </td>
            </tr>
            <tr>
                <td style="font-size: 14px; color: #999999; text-align: center; padding-top: 20px; border-top: 1px solid #dddddd;">
                    &copy; 2024 UX Living Lab. All rights reserved.
                </td>
            </tr>
        </table>
    </body>

    </html>
    `;
};



export {
    getCurrentTimestamp,
    generateAlphanumericOtp,
    generateOtpEmailContent
}