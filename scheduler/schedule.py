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
        # print("Raw responses: ",raw_response)
        try:
            user_with_update_email = json.loads(raw_response)
            # return user_with_update_email
            # print(user_with_update_email)
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
            elif workspace_name == "LLXABC":
                scale_type = "learning_index"
            else:
                scale_type = "unknown"

            print("this is user: ", user)
            print("scale_type:", scale_type)

            scale_details = get_scale_details(
                user["workspace_id"],
                user["portfolio"],
                scale_type
            )
            if not scale_details.get("response"):
                continue
            # print("scale_details: ", scale_details)
            if scale_type == "learning_index":
                report_subject = f"DoWell Learning Level Index report for last One day"
                response_data_report = fetch_and_format_llx_scores(scale_details["response"][0]["scale_id"])
                # print(f"scale_response_data: {response_data_report}")
                
            else:
                report_subject = f"DoWell Voice Of Customers report for last One day"
                response_data_report = fetch_and_format_scores(scale_details["response"][0]["scale_id"])
           
        
            response_location_data_report = fetch_and_format_user_location_data(scale_details["response"][0]["scale_id"], user["workspace_id"])
            for entry in response_data_report:
                entry['total_score'] = f"{entry['total_score']:.2f}" if entry['total_score'] != 0 else entry['total_score']
                entry['average_score'] = f"{entry['average_score']:.2f}" if entry['average_score'] != 0 else entry['average_score']
                entry['total_responses'] = f"{entry['total_responses']:.2f}" if entry['total_responses'] != 0 else entry['total_responses']

            if scale_type == "learning_index":
                scale_data_table = format_llx_scale_data(response_data_report)
            else:
                scale_data_table = format_scale_data(response_data_report)
        
            location_data_table = format_location_data(response_location_data_report)

            # set_data_to_email = [
            #     user["portfolio"],
            #     user["email"], 
            #     report_subject, 
            #     datetime.now().strftime("%Y-%B %-d"), 
            #     scale_details["response"][0]["report_link"]["report_link"], 
            #     scale_details["response"][0]["report_link"]["qrcode_image_url"],
            #     response_data_report,
            #     response_location_data_report,
            #     user["portfolio_username"],
            #     user["portfolio"],
            #     user["workspace_name"],
            #     "One Day"
            # ]
            
            # return scale_data_table

            if scale_type == "learning_index":
                email_response = send_llx_email(
                user["portfolio"],
                # "khanheena4997@gmail.com",
                user["email"],
                report_subject, 
                datetime.now().strftime("%Y-%m-%d %H:%M:%S"), 
                scale_details["response"][0]["login"]["login_link"],
                scale_details["response"][0]["report_link"]["report_link"], 
                scale_details["response"][0]["report_link"]["qrcode_image_url"],
                response_data_report,
                location_data_table,
                user["portfolio_username"],
                user["portfolio"],
                user["workspace_name"],
                "One Day"
            )
            else:
                email_response = send_email(
                    user["portfolio"],
                    # "khanheena4997@gmail.com",
                    user["email"],
                    report_subject, 
                    datetime.now().strftime("%Y-%m-%d %H:%M:%S"), 
                    scale_details["response"][0]["report_link"]["report_link"], 
                    scale_details["response"][0]["report_link"]["qrcode_image_url"],
                    scale_data_table,
                    location_data_table,
                    user["portfolio_username"],
                    user["portfolio"],
                    user["workspace_name"],
                    "One Day"
                )

            print(f"Email sent to {user['email']}. Response:{email_response}")


    except Exception as e:
        print(f"An error occurred while retrieving users: {e}")

if __name__ == "__main__":
    main()