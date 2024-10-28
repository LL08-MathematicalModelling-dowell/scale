import json
from datetime import datetime
from helper import *

def main():
    query = {
        "email": { 
            "$exists": True,  
            "$ne": ""  
        }
    }

    try:
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
            print(f"Failed to decode JSON response: {e}")
            return

        if 'data' not in user_with_update_email:
            print("'data' key not found in response.")
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
            
            report_subject = f"your voice of customers report for last One day"

            response_data_report = fetch_and_format_scores(scale_details["response"][0]["scale_id"])
            response_location_data_report = fetch_and_format_user_location_data(scale_details["response"][0]["scale_id"], user["workspace_id"])

            scale_data_table = format_scale_data(response_data_report)
            location_data_table = format_location_data(response_location_data_report)

            set_data_to_email = [
                user["portfolio"],
                user["email"], 
                report_subject, 
                datetime.now().strftime("%Y-%B %-d"), 
                scale_details["response"][0]["report_link"]["report_link"], 
                scale_details["response"][0]["report_link"]["qrcode_image_url"],
                response_data_report,
                response_location_data_report
            ]

            email_response = send_email(
                user["portfolio"],
                user["email"], 
                report_subject, 
                datetime.now().strftime("%Y-%B %-d"), 
                scale_details["response"][0]["report_link"]["report_link"], 
                scale_details["response"][0]["report_link"]["qrcode_image_url"],
                scale_data_table,
                location_data_table
            )

            print(f"Email sent to {user['email']}. Response: {email_response}")


    except Exception as e:
        print(f"An error occurred while retrieving users: {e}")

if __name__ == "__main__":
    main()
