# import requests

# def send_email(toname, toemail, customer_id, product_id, user_id, password,pin, login_link,direct_login_link):
#     url = "https://100085.pythonanywhere.com/api/email/"
#     email_content = f"""
#     <!DOCTYPE html>
#     <html lang="en">

#     <head>
#         <meta charset="UTF-8">
#         <meta name="viewport" content="width=device-width, initial-scale=1.0">
#         <title>Account Registration Email</title>
#     </head>

#     <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
#         <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
#             <tr>
#                 <td style="text-align: center; padding-bottom: 20px;">
#                     <img src="https://dowellfileuploader.uxlivinglab.online/hr/logo-2-min-min.png" alt="DoWell Voice of Customers Logo"
#                         style="max-width: 150px; height: auto;">
#                 </td>
#             </tr>
#             <tr>
#                 <td style="font-size: 16px; color: #333333; padding-bottom: 20px;">
#                     Dear {toname},
#                 </td>
#             </tr>
#             <tr>
#                 <td style="font-size: 16px; color: #333333; padding-bottom: 20px;">
#                     Welcome to DoWell Voice of Customers! We are excited to have you with us. Below are your login details:
#                 </td>
#             </tr>
#             <tr>
#                 <td style="font-size: 16px; color: #333333; padding-bottom: 10px;">
#                     <strong>Customer ID:</strong> {customer_id}
#                 </td>
#             </tr>
#             <tr>
#                 <td style="font-size: 16px; color: #333333; padding-bottom: 10px;">
#                     <strong>Product ID:</strong> {product_id}
#                 </td>
#             </tr>
#             <tr>
#                 <td style="font-size: 16px; color: #333333; padding-bottom: 10px;">
#                     <strong>User ID:</strong> {user_id}
#                 </td>
#             </tr>
#             <tr>
#                 <td style="font-size: 16px; color: #333333; padding-bottom: 10px;">
#                     <strong>Password:</strong> {password}
#                 </td>
#             </tr>
#             <tr>
#                 <td style="font-size: 16px; color: #333333; padding-bottom: 10px;">
#                     <strong>Login Pin:</strong> {pin}
#                 </td>
#             </tr>
#             <tr>
#                 <td style="font-size: 16px; color: #333333; padding-bottom: 20px;">
#                     To get started, please log in using the link below:
#                 </td>
#             </tr>
#             <tr>
#                 <td style="text-align: center; padding-bottom: 20px;">
#                     <a href="{direct_login_link}" style="display: inline-block; background-color: #007BFF; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-size: 16px;">Login to Voice of Customers</a>
#                 </td>
#             </tr>
#             <tr>
#                 <td style="text-align: center; padding-bottom: 20px;">
#                     <a href="{login_link}" style="display: inline-block; background-color: #007BFF; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-size: 16px;">Help</a>
#                 </td>
#             </tr>
#             <tr>
#                 <td style="font-size: 16px; color: #333333; padding-bottom: 20px;">
#                     If you have any questions or need assistance, please do not hesitate to contact us.
#                 </td>
#             </tr>
#             <tr>
#                 <td style="font-size: 16px; color: #333333; padding-bottom: 20px;">
#                     Thank you for using DoWell Voice of Customers.<br>
#                     Best regards,<br>
#                     DoWell Voice of Customers Team
#                 </td>
#             </tr>
#             <tr>
#                 <td style="font-size: 14px; color: #999999; text-align: center; padding-top: 20px; border-top: 1px solid #dddddd;">
#                     &copy; 2024 UX Living Lab. All rights reserved.
#                 </td>
#             </tr>
#         </table>
#     </body>

#     </html>
#     """
    
#     payload = {
#         "toname": toname,
#         "toemail": toemail,
#         "subject": "Welcome to DoWell Voice of Customers",
#         "email_content": email_content
#     }
    
#     response = requests.post(url, json=payload)
#     print(response)
#     return response.text


import requests

def send_email(toname, toemail, customer_id, product_id, user_id, password, pin, login_link, direct_login_link):
    url = "https://100085.pythonanywhere.com/api/email/"
    
    email_content = f"""
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Registration Email</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}

            table {{
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
            }}

            h2 {{
                color: #333333;
                font-size: 22px;
                margin-bottom: 10px;
            }}

            p {{
                font-size: 16px;
                color: #333333;
                line-height: 1.5;
                margin-bottom: 10px;
            }}

            .highlight {{
                font-size: 20px;
                font-weight: bold;
                color: #007BFF;
            }}

            .button {{
                display: inline-block;
                background-color: #007BFF;
                color: #ffffff;
                text-decoration: none;
                padding: 12px 20px;
                border-radius: 4px;
                font-size: 16px;
                text-align: center;
                margin-top: 15px;
            }}
        </style>
    </head>

    <body>
        <table>
            <tr>
                <td style="text-align: center; padding-bottom: 20px;">
                    <img src="https://dowellfileuploader.uxlivinglab.online/hr/logo-2-min-min.png" alt="DoWell Voice of Customers Logo"
                        style="max-width: 150px; height: auto;">
                </td>
            </tr>
            <tr>
                <td>
                    <h2>Hello {toname},</h2>
                    <p>Welcome to DoWell Voice of Customers! We're excited to have you on board.</p>

                    <!-- PIN Login Emphasis -->
                    <p style="font-size: 18px;">To get started, use the following <span class="highlight">PIN</span> for immediate
                        login:</p>
                    <p style="text-align: center; font-size: 24px; color: #007BFF; font-weight: bold;">{pin}</p>

                    <!-- PIN Exclusivity Message -->
                    <p><strong>Note:</strong> This PIN is exclusive and permanent for your account. You can use the same PIN every
                        time you log in. Please do not share this PIN with anyone to ensure the security of your account.</p>

                    <!-- Credentials Information -->
                    <p>If you prefer, you can also log in using your credentials:</p>
                    
                    <div style="text-align: center; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                        <p><strong>Product ID</strong> <br>{product_id}</p>
                        <p><strong>User ID</strong> <br>{user_id}</p>
                        <p><strong>Password</strong> <br>{password}</p>
                    </div>
                    

                    <!-- Customer ID and Registered Email -->
                    <p>Your Customer ID is: <br>{customer_id}</p>
                    <p>Your registered email ID is: <br>{toemail}</p>
                    <p>Please use {customer_id} when you interact with us. Always email us from your registered email to ensure a quick response.</p>

                    <!-- Login and Help Buttons -->
                    <p style="text-align: center;">
                        <a href="{direct_login_link}" class="button">Login to Voice of Customers</a>
                    </p>

                    <p>If you have any trouble or need help, please use the button below:</p>
                    <p style="text-align: center;">
                        <a href="{login_link}" class="button">Help & Support</a>
                    </p>

                    <p>If you have any questions or need assistance, feel free to reach out. We're here to help!</p>

                    <p>Thank you for choosing DoWell Voice of Customers!</p>

                    <p>Best regards, <br> The DoWell Voice of Customers Team</p>
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
    print("Email sent successfully!")
    return response.text

