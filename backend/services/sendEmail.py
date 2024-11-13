import requests

def send_email(toname, toemail, customer_id, product_id, user_id, password, login_link,direct_login_link):
    url = "https://100085.pythonanywhere.com/api/email/"
    email_content = f"""
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Registration Email</title>
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
                    Dear {toname},
                </td>
            </tr>
            <tr>
                <td style="font-size: 16px; color: #333333; padding-bottom: 20px;">
                    Welcome to DoWell Voice of Customers! We are excited to have you with us. Below are your login details:
                </td>
            </tr>
            <tr>
                <td style="font-size: 16px; color: #333333; padding-bottom: 10px;">
                    <strong>Customer ID:</strong> {customer_id}
                </td>
            </tr>
            <tr>
                <td style="font-size: 16px; color: #333333; padding-bottom: 10px;">
                    <strong>Product ID:</strong> {product_id}
                </td>
            </tr>
            <tr>
                <td style="font-size: 16px; color: #333333; padding-bottom: 10px;">
                    <strong>User ID:</strong> {user_id}
                </td>
            </tr>
            <tr>
                <td style="font-size: 16px; color: #333333; padding-bottom: 10px;">
                    <strong>Password:</strong> {password}
                </td>
            </tr>
            <tr>
                <td style="font-size: 16px; color: #333333; padding-bottom: 20px;">
                    To get started, please log in using the link below:
                </td>
            </tr>
            <tr>
                <td style="text-align: center; padding-bottom: 20px;">
                    <a href="{direct_login_link}" style="display: inline-block; background-color: #007BFF; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-size: 16px;">Login to Voice of Customers</a>
                </td>
            </tr>
            <tr>
                <td style="text-align: center; padding-bottom: 20px;">
                    <a href="{login_link}" style="display: inline-block; background-color: #007BFF; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-size: 16px;">Help</a>
                </td>
            </tr>
            <tr>
                <td style="font-size: 16px; color: #333333; padding-bottom: 20px;">
                    If you have any questions or need assistance, please do not hesitate to contact us.
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
    """
    
    payload = {
        "toname": toname,
        "toemail": toemail,
        "subject": "Welcome to DoWell Voice of Customers",
        "email_content": email_content
    }
    
    response = requests.post(url, json=payload)
    print(response)
    return response.text
