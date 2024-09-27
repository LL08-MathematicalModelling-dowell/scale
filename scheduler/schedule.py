import json
import logging
import os
from datetime import datetime
from helper import *

# Define the directory and log file for structured logs
log_directory = "logs"
os.makedirs(log_directory, exist_ok=True)

log_file_path = os.path.join(log_directory, "logs.json")

# Setting up logging for the terminal output only (remove file logging)
logger = logging.getLogger()
logger.setLevel(logging.INFO)  # Adjust logging level as needed

stream_handler = logging.StreamHandler()  # This will log to the terminal
stream_handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
stream_handler.setFormatter(formatter)

logger.addHandler(stream_handler)
logging.getLogger().addHandler(logging.NullHandler())

# Function to log structured data to a JSON file
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
            log_file.write(content[:-1])  # Remove the last closing bracket ']'
            log_file.write(',\n')         # Add a comma for the next entry
            json.dump(log_entry, log_file)
            log_file.write('\n]')
    else:
        with open(log_file_path, 'w') as log_file:
            log_file.write('[\n')          # Start the JSON array
            json.dump(log_entry, log_file)
            log_file.write('\n]')

def main():
    logging.info("Starting Report Scheduler...")

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
        
        try:
            user_with_update_email = json.loads(raw_response)
        except json.JSONDecodeError as e:
            logging.error("Failed to decode JSON response: %s", e)
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
                    logging.error("Failed to send email to %s: %s", user['email'], response_email.get("message"))
                else:
                    log_data["email_sent"] = True  # Update the log data
            else:
                logging.warning("No scale details found for user: %s", user['email'])

            log_to_json(log_data)  # Log the structured data for this user

    except Exception as e:
        logging.error("An error occurred while retrieving users: %s", e)

if __name__ == "__main__":
    main()
