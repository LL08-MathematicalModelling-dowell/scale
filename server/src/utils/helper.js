
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

const sendScaleFeedback = ({ customerName, customerEmail, description, location, latitude, longitude, scaleResponse, productId, customerId, userId,type }) => {
  const filledStars = '★'.repeat(scaleResponse);
  const unfilledStars = '★'.repeat(5 - scaleResponse);

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Customer Feedback Summary</title>
      </head>
      <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; line-height: 1.6;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <div style="padding: 30px 20px; text-align: center;">
            <img src="https://dowellfileuploader.uxlivinglab.online/hr/logo-2-min-min.png" alt="DoWell UX Living Lab Logo" style="max-width: 100px;" />
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #2e7d32; margin: 0 0 20px 0; font-size: 24px; text-align: center;">Voice of Customer</h2>
            <h3 style="color: #2e7d32; margin: 0 0 20px 0; font-size: 20px; text-align: center;">Feedback</h3>

            <div style="text-align: center; margin: 20px 0; padding: 15px; background-color: #e8f5e9; border-radius: 8px;">
            <strong>Overall Rating</strong>
            <div style="font-size: 24px; letter-spacing: 4px;">
              <span style="color: #ffd700;">${filledStars}</span><span style="color: #808080;">${unfilledStars}</span>
            </div>
            <div style="color: #4caf50; font-weight: bold; margin-top: 5px">${scaleResponse} out of 5</div>
          </div>

            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 12px 0; border-bottom: 1px solid #eee; padding-bottom: 12px;">
                <strong style="color: #1b5e20; font-weight: 600; min-width: 140px; display: inline-block;">Customer Name:</strong> ${customerName}
              </p>
              <p style="margin: 12px 0; border-bottom: 1px solid #eee; padding-bottom: 12px;">
                <strong style="color: #1b5e20; font-weight: 600; min-width: 140px; display: inline-block;">Customer Email:</strong> ${customerEmail}
              </p>
              <p style="margin: 12px 0; border-bottom: 1px solid #eee; padding-bottom: 12px;">
                <strong style="color: #1b5e20; font-weight: 600; min-width: 140px; display: inline-block;">Location:</strong> ${location}
              </p>
              <p style="margin: 12px 0; border-bottom: 1px solid #eee; padding-bottom: 12px;">
                <strong style="color: #1b5e20; font-weight: 600; min-width: 140px; display: inline-block;">Description:</strong> ${description}
              </p>
              <p style="margin: 12px 0; border-bottom: none; padding-bottom: 0;">
                <strong style="color: #1b5e20; font-weight: 600; min-width: 140px; display: inline-block;">Coordinates:</strong> ${latitude}°N, ${longitude}°E
              </p>
            </div>

            <div style="background-color: #f0f0f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 12px 0; border-bottom: 1px solid #eee; padding-bottom: 12px;">
                <strong style="color: #1b5e20; font-weight: 600; min-width: 140px; display: inline-block;">Product ID:</strong> ${productId}
              </p>
              <p style="margin: 12px 0; border-bottom: 1px solid #eee; padding-bottom: 12px;">
                <strong style="color: #1b5e20; font-weight: 600; min-width: 140px; display: inline-block;">Customer ID:</strong> ${customerId}
              </p>
              <p style="margin: 12px 0; border-bottom: none; padding-bottom: 0;">
                <strong style="color: #1b5e20; font-weight: 600; min-width: 140px; display: inline-block;">User ID:</strong> ${userId}
              </p>
              <p style="margin: 12px 0; border-bottom: none; padding-bottom: 0;">
                <strong style="color: #1b5e20; font-weight: 600; min-width: 140px; display: inline-block;">Channel of Interaction:</strong> ${type}
              </p>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; font-size: 13px; color: #666; background-color: #f1f1f1; border-top: 1px solid #e0e0e0;">
            <p>&copy;uxlivinglab. All rights reserved.</p>
            <p style="margin-top: 10px; font-size: 12px;">
              This is an automated email. Please do not reply directly to this message.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};
  

  

export {
    getCurrentTimestamp,
    generateAlphanumericOtp,
    generateOtpEmailContent,
    sendScaleFeedback
}