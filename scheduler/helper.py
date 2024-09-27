import json
import requests

api_key = "1b834e07-c68b-4bf6-96dd-ab7cdc62f07f"
base_url = "https://www.dowelldatacube.uxlivinglab.online/db_api"


def datacube_data_retrieval(api_key, database_name, collection_name, data, limit, offset, payment):
    global base_url
    url = f"{base_url}/get_data/"
    payload = {
        "api_key": api_key,
        "db_name": database_name,
        "coll_name": collection_name,
        "operation": "fetch",
        "filters": data,
        "limit": limit,
        "offset": offset,
        "payment": payment
    }

    response = requests.post(url, json=payload)
    return response.text


import requests

def send_email(toname, toemail, subject, date, button_link, qrcode_link):
    url = "https://100085.pythonanywhere.com/api/email/"
    
    email_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
        body {{
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f2f3f8;
            color: #333;
        }}
        .email-container {{
            max-width: 600px;
            margin: 40px auto;
            background-color: #fff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            text-align: center;
            transition: all 0.3s ease;
        }}
        .email-container:hover {{
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
        }}
        .logo-container {{
            margin-bottom: 30px;
        }}
        .logo-container img {{
            max-width: 120px;
            height: auto;
        }}
        .content {{
            font-size: 16px;
            line-height: 1.8;
            color: #555;
        }}
        .content p {{
            margin: 20px 0;
        }}
        .greeting {{
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
        }}
        .button {{
            display: inline-block;
            padding: 12px 25px;
            background-color: #28a745;
            color: #ffffff;
            text-decoration: none;
            font-size: 16px;
            font-weight: bold;
            border-radius: 50px;
            margin-top: 25px;
            transition: background-color 0.3s ease;
        }}
        .button:hover {{
            background-color: #218838;
        }}
        .qrcode-container {{
            margin-top: 30px;
        }}
        .qrcode-container img {{
            max-width: 150px;
            height: auto;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }}
        .footer {{
            margin-top: 40px;
            font-size: 12px;
            color: #999;
        }}
        .footer a {{
            color: #999;
            text-decoration: none;
        }}
        .footer a:hover {{
            color: #555;
        }}
        @media screen and (max-width: 600px) {{
            .email-container {{
            padding: 20px;
            }}
            .button {{
            padding: 10px 20px;
            }}
        }}
        </style>
    </head>
    <body>
        <div class="email-container">
        <div class="logo-container">
            <img
            src="https://dowellfileuploader.uxlivinglab.online/hr/logo-2-min-min.png"
            alt="Company Logo"
            />
        </div>
        <div class="content">
            <p class="greeting">Hey {toname},</p>
            <p>Date: {date}</p>
            <p>
            We’ve prepared the report based on your feedback. Click below to view
            your personalized report.
            </p>
            <a
            href="{button_link}"
            class="button"
            >View My Report</a>
        </div>
        <div class="qrcode-container">
            <p>Or scan this QR code to access the report:</p>
            <img
            src="{qrcode_link}"
            alt="QR Code"
            />
        </div>
        <div class="content">
            <p>Thank you for choosing us to take your survey!</p>
            <p>
            Visit our website:
            <a href="https://dowellresearch.sg/" target="_blank">dowellresearch.sg</a>
            </p>
        </div>
        <div class="footer">
            <p>
            This email was sent to
            <a href="mailto:{toemail}">{toemail}</a>. If you didn't
            expect this, please ignore.
            </p>
            <p>&copy; 2024 Dowell Research. All rights reserved.</p>
        </div>
        </div>
    </body>
    </html>

    """
    
    payload = {
        "toname": toname,
        "toemail": toemail,
        "subject": subject,
        "email_content": email_content
    }
    
    response = requests.post(url, json=payload)
    
    return response.text



def get_scale_details(workspace_id,portfolio,type_of_scale):
    if type_of_scale == "nps":
            collection_name = "voc_scales"
            data_to_be_fetched = {
                "workspace_id": workspace_id,
                "portfolio": portfolio
            }
    else:
        collection_name = "voc_scales_1"
        data_to_be_fetched = {
            "workspace_id": workspace_id,
            "portfolio": portfolio,
            "type_of_scale": type_of_scale
        }
    
    response = json.loads(datacube_data_retrieval(
        api_key,
        "voc",
        collection_name,
        data_to_be_fetched,
        0,
        0,
        False
    ))
    if not response['success']:
        return {
            "success": False,
            "message": "No scale details found"
        }
    return {
        "success": True,
        "message": f"Scale details for portfolio {portfolio} found",
        "response": response['data']
    }