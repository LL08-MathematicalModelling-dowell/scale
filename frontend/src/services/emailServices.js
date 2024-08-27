import axios from "axios";

const emailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editor mail</title>
</head>
<body>
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:100px;overflow:auto;line-height:2">
        <div style="margin:50px auto;width:70%;padding:20px 0">
          <div style="border-bottom:1px solid #eee">
            <a href="#" style="font-size:1.2em;color: #00466a;text-decoration:none;font-weight:600">Dowell UX Living Lab</a>
          </div>
          <p style="font-size:1.1em">Scale Feedback Form Response</p>
          <p style="font-size:1.1em">Username: {username}</p>
          <p style="font-size:1.1em">Scale Name: {scale_name}</p>
          <p style="font-size:1.1em">Response Value: {score}</p>
          <p style="font-size:1.1em">Channel: {channel}</p>
          <p style="font-size:1.1em">Instance: {instance}</p>
          <p style="font-size:1.1em">Feedback Message: {message}</p>
        </div>
      </div>
</body>
</html>
`;

const sendEmail = async ({ message, email, scale_name, score, channel, instance, username }) => {
    try {
        const emailContent = emailTemplate
            .replace("{scale_name}", scale_name)
            .replace("{score}", score)
            .replace("{channel}", channel)
            .replace("{instance}", instance)
            .replace("{message}", message)
            .replace("{username}", username);

        const currentDate = new Date();
        const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;

        const response = await axios.post("https://100085.pythonanywhere.com/api/uxlivinglab/email/", {
            toname: "Dowell UX Livinglab",
            toemail: "dowell@dowellresearch.uk",
            // toemail: "manish@dowellresearch.in",
            fromname: email,
            fromemail: email,
            subject: `Feedback from scale response - ${formattedDate}`,
            email_content: emailContent
        });

        console.log("Email sent successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

export {
    sendEmail
}
