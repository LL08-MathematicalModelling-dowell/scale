import json
import requests
import time
from datetime import datetime, timedelta
import pytz
from tabulate import tabulate

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


def format_scale_data(data):
    table_data = []
    for entry in data:
        table_data.append([
            entry['date'],
            f"{entry['start_time']} - {entry['end_time']}",
            entry['total_score'],
            entry['average_score'],
            entry['total_responses']
        ])
    return tabulate(table_data, headers=['Date', 'Time Range', 'Total Score', 'Average Score', 'Total Responses'], tablefmt='html')

def format_location_data(data):
    table_data = []
    for entry in data:
        if entry['total_events'] > 0:
            table_data.append([
                entry['date'],
                f"{entry['start_time']} - {entry['end_time']}",
                entry['total_events'],
                ', '.join(map(str, entry['latitudes'])),
                ', '.join(map(str, entry['longitudes']))
            ])
    return tabulate(table_data, headers=['Date', 'Time Range', 'Total Events', 'Latitudes', 'Longitudes'], tablefmt='html')
import requests

def send_email(toname, toemail, subject, date, button_link, qrcode_link, scale_data_table, location_data_table):
    scale_data_rows = scale_data_table.splitlines()
    limited_scale_data = "\n".join(scale_data_rows[-10:])
    
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
            margin: 20px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            text-align: center;
        }}
        .logo-container img {{
            max-width: 120px;
            height: auto;
            margin-bottom: 20px;
        }}
        .content {{
            font-size: 16px;
            line-height: 1.5;
            color: #555;
        }}
        .greeting {{
            font-size: 20px;
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
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }}
        th, td {{
            padding: 12px;
            text-align: left;
        }}
        th {{
            background-color: #28a745;
            color: white;
            font-weight: bold;
        }}
        tr:nth-child(even) {{
            background-color: #f9f9f9;
        }}
        tr:hover {{
            background-color: #f1f1f1;
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
                <h2>Scale Data</h2>
                <table>
                    <tbody>
                        {limited_scale_data}
                    </tbody>
                </table>
                <p>We’ve prepared the report based on your feedback. Below are the first 10 data entries. If you want to see all the data, you can click the button below to view your personalized report.</p>
                <a href="{button_link}" class="button">View All</a>
            </div>
            <div class="qrcode-container">
                <p>Or scan this QR code to access the report:</p>
                <img src="{qrcode_link}" alt="QR Code" />
            </div>
            <div class="content">
                <p>Thank you for choosing us to take your survey!</p>
                <p>Visit our website: <a href="https://dowellresearch.sg/" target="_blank">dowellresearch.sg</a></p>
            </div>
            <div class="footer">
                <p>This email was sent to <a href="mailto:{toemail}">{toemail}</a>. If you didn't expect this, please ignore.</p>
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



# def send_email(toname, toemail, subject, date, button_link, qrcode_link, scale_data_table, location_data_table):
#     url = "https://100085.pythonanywhere.com/api/email/"
    
#     email_content = f"""
#     <!DOCTYPE html>
#     <html lang="en">
#     <head>
#         <meta charset="UTF-8">
#         <meta name="viewport" content="width=device-width, initial-scale=1.0">
#         <title>Scale Data Report</title>
#     </head>
#     <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f2f3f8; color: #333; line-height: 1.6;">
#         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
#             <tr>
#                 <td style="padding: 30px; text-align: center;">
#                     <img src="https://dowellfileuploader.uxlivinglab.online/hr/logo-2-min-min.png" alt="Company Logo" style="max-width: 120px; height: auto; margin-bottom: 20px;">
                    
#                     <div style="font-size: 16px; color: #555;">
#                         <p style="font-size: 24px; font-weight: bold; color: #2c3e50; margin-bottom: 10px;">Hey {toname},</p>
#                         <p>Date: {date}</p>
#                         <h2>Scale Data</h2>
#                         <p>Here's your data from the survey:</p>
#                     </div>
                    
#                     <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 20px; border-collapse: separate; border-spacing: 0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
#                         <thead>
#                             <tr>
#                                 <th style="padding: 12px; text-align: left; background-color: #28a745; color: white; font-weight: bold;">Scale</th>
#                                 <th style="padding: 12px; text-align: left; background-color: #28a745; color: white; font-weight: bold;">Score</th>
#                             </tr>
#                         </thead>
#                         <tbody>
#                             {scale_data_table}
#                             <tr style="background-color: #f9f9f9;">
#                                 <td colspan="2" style="padding: 12px; text-align: left; color: #999;">... [Additional data, click to view all] ...</td>
#                             </tr>
#                         </tbody>
#                     </table>
                    
#                     <a href="{button_link}" style="display: inline-block; padding: 12px 25px; background-color: #28a745; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 50px; margin-top: 20px;">View All Results</a>
                    
#                     <div style="margin-top: 30px;">
#                         <p>Or scan this QR code to access the full report:</p>
#                         <img src="{qrcode_link}" alt="QR Code" style="max-width: 150px; height: auto; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
#                     </div>
                    
#                     <div style="margin-top: 20px; font-size: 16px; color: #555;">
#                         <p>Thank you for participating in our survey!</p>
#                         <p>Visit our website: <a href="https://dowellresearch.sg/" target="_blank" style="color: #28a745; text-decoration: none;">dowellresearch.sg</a></p>
#                     </div>
                    
#                     <div style="margin-top: 40px; font-size: 12px; color: #999;">
#                         <p>This email was sent to <a href="mailto:{toemail}" style="color: #999; text-decoration: none;">{toemail}</a>. If you didn't expect this, please ignore.</p>
#                         <p>&copy; 2024 Dowell Research. All rights reserved.</p>
#                     </div>
#                 </td>
#             </tr>
#         </table>
#     </body>
#     </html>
#     """
    
#     payload = {
#         "toname": toname,
#         "toemail": "mdashsharma95@gmail.com",
#         "subject": subject,
#         "email_content": email_content
#     }
    
#     response = requests.post(url, json=payload)
    
#     return response.text
    
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

def fetch_and_format_scores(scale_id):
    ist = pytz.timezone('Asia/Kolkata')
    start_time = datetime.now(ist).replace(hour=0, minute=0, second=0, microsecond=0)
    end_time = start_time.replace(hour=21)

    response_data = json.loads(
        datacube_data_retrieval(
            "1b834e07-c68b-4bf6-96dd-ab7cdc62f07f", 
            "livinglab_scale_response", 
            "collection_1", 
            {
                "scale_id": scale_id
            }, 
            0, 
            0, 
            False 
        )
    )

    if not response_data or not response_data.get("data"):
        print(f"No data found for scale_id: {scale_id}")
        return []

    raw_data = response_data["data"]

    results = []

    current_time = start_time

    while current_time < end_time:
        next_hour = current_time + timedelta(hours=1)

        hourly_data = [
            item for item in raw_data 
            if current_time.isoformat() <= item["dowell_time"]["current_time"] < next_hour.isoformat()
        ]

        score_list = [item.get('score', 0) for item in hourly_data]
        total_score = sum(score_list)
        average_score = total_score / len(score_list) if score_list else 0
        total_responses = len(score_list)

        data_to_write = {
            "date": current_time.strftime("%Y-%m-%d"),
            "start_time": current_time.strftime("%H:%M"),
            "end_time": next_hour.strftime("%H:%M"),
            "total_score": total_score,
            "average_score": average_score,
            "total_responses": total_responses
        }

        results.append(data_to_write)

        current_time = next_hour

    return results

def fetch_and_format_user_location_data(scale_id, workspace_id):
    ist = pytz.timezone('Asia/Kolkata')

    start_time = datetime.now(ist).replace(hour=0, minute=0, second=0, microsecond=0)
    end_time = start_time.replace(hour=21)  # 9:00 PM

    response_data = json.loads(
        datacube_data_retrieval(
            "1b834e07-c68b-4bf6-96dd-ab7cdc62f07f", 
            "voc", 
            "user_location_data", 
            {
                "scaleId": scale_id,
                "workspaceId": workspace_id,
            }, 
            0, 
            0, 
            False 
        )
    )

    if not response_data or not response_data.get("data"):
        print(f"No data found for scale_id: {scale_id} in workspace_id: {workspace_id}")
        return []

    raw_data = response_data["data"]

    results = []

    current_time = start_time

    while current_time < end_time:
        next_hour = current_time + timedelta(hours=1)

        hourly_data = [
            item for item in raw_data 
            if current_time.isoformat() <= item["createdAt"] < next_hour.isoformat()
        ]

        total_events = len(hourly_data)
        latitudes = [item["latitude"] for item in hourly_data] if hourly_data else []
        longitudes = [item["longitude"] for item in hourly_data] if hourly_data else []

        data_to_write = {
            "date": current_time.strftime("%Y-%m-%d"),
            "start_time": current_time.strftime("%H:%M"),
            "end_time": next_hour.strftime("%H:%M"),
            "total_events": total_events,
            "latitudes": latitudes,
            "longitudes": longitudes
        }

        results.append(data_to_write)

        current_time = next_hour

    return results