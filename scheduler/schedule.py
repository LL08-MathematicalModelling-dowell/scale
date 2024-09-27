import json
import logging
import os
from datetime import datetime
from helper import *

log_directory = "logs"
os.makedirs(log_directory, exist_ok=True)

log_file_path = os.path.join(log_directory, "logs.json")

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

file_handler = logging.FileHandler(log_file_path)
file_handler.setLevel(logging.DEBUG)

formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)

logger.addHandler(file_handler)
logging.getLogger().addHandler(logging.NullHandler())

def log_to_json(data):
    log_entry = {
        "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        **data
    }
    
    if os.path.exists(log_file_path) and os.path.getsize(log_file_path) > 0:
        with open(log_file_path, 'r+') as log_file:
            content = log_file.read()
            log_file.seek(0)
            log_file.truncate()
            log_file.write(content[:-1])
            log_file.write(',\n')
            json.dump(log_entry, log_file)
            log_file.write('\n]')
    else:
        with open(log_file_path, 'w') as log_file:
            log_file.write('[\n')
            json.dump(log_entry, log_file)
            log_file.write('\n]')

def main():
    logging.info("Hello, Welcome to Report Scheduler")

    query = {
        "email": { 
            "$exists": True,  
            "$ne": ""  
        }
    }

    try:
        logging.debug("Retrieving users with updated email addresses.")
        raw_response = datacube_data_retrieval(
            api_key,                  
            "voc",                    
            "voc_user_management",    
            query,                    
            0,                     
            0,                        
            False                     
        )
        
        logging.debug("Raw response from API: %s", raw_response)

        try:
            user_with_update_email = json.loads(raw_response)
        except json.JSONDecodeError as e:
            logging.error("JSON decode error: %s", e)
            return

        if 'data' not in user_with_update_email:
            logging.error("'data' key not found in response.")
            return

        for user in user_with_update_email['data']:
            workspace_name = user.get("workspace_name")
            if workspace_name == "manish_test_error_login" or workspace_name == "VOCAB":
                scale_type = "nps"
            elif workspace_name == "VOCABC":
                scale_type = "likert"
            else:
                scale_type = "unknown"

            logging.debug("Workspace Name: %s", workspace_name)
            logging.debug("Portfolio: %s", user["portfolio"])
            logging.debug("Scale Type: %s", scale_type)

            scale_details = get_scale_details(
                user["workspace_id"],
                user["portfolio"],
                scale_type
            )

            report_subject = f"Your {scale_type} Scale Report for {datetime.now().strftime('%Y-%m-%d')}"

            log_data = {
                "workspace_id": user["workspace_id"],
                "workspace_name": workspace_name,
                "portfolio": user["portfolio"],
                "scale_type": scale_type,
                "email": user["email"],
                "email_sent": False,
            }

            if scale_details.get("success") and len(scale_details.get("response", [])) > 0:
                response_email = json.loads(send_email(
                    "Valuable Customer",
                    user["email"], 
                    report_subject, 
                    datetime.now().strftime("%Y-%m-%d"), 
                    scale_details["response"][0]["report_link"]["report_link"], 
                    scale_details["response"][0]["report_link"]["qrcode_image_url"]
                ))

                if not response_email.get("success"):
                    logging.error("Failed to send email to %s with error: %s", user['email'], response_email.get("message"))
                else:
                    log_data["email_sent"] = True
            else:
                logging.warning("No scale details found for this user: %s", user['email'])

            log_to_json(log_data)

    except Exception as e:
        logging.error("An error occurred while retrieving users: %s", e)

if __name__ == "__main__":
    main()
