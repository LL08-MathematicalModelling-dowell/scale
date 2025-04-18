import json
import requests
import time
from datetime import datetime, timedelta
import pytz
import os

def update_json_file(file_path, data):
    if not os.path.exists(file_path):
        with open(file_path, 'w') as f:
            json.dump([], f)

    # Load the existing data from the file
    with open(file_path, 'r') as f:
        file_data = json.load(f)

    # Append the new data
    file_data.append(data)

    # Write the updated data back to the file
    with open(file_path, 'w') as f:
        json.dump(file_data, f, indent=4)

def datacube_data_retrieval(api_key, database_name, collection_name, data, limit, offset, payment):
    
    url = "https://www.dowelldatacube.uxlivinglab.online/db_api/get_data/"
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

def fetch_score_every_hour(scale_id, workspace_id):
    ist = pytz.timezone('Asia/Kolkata')
    file_path = f"{workspace_id}_hourly_report.json"

    # Set the start time to 12:00 AM IST
    start_time = datetime.now(ist).replace(hour=0, minute=0, second=0, microsecond=0)
    formatted_start_time = start_time.isoformat()

    # End time is 24 hours from the start time
    end_time = start_time + timedelta(hours=1)
    formatted_end_time = end_time.isoformat()
    current_time = start_time

    while current_time <= end_time:
        try:
            # API call to fetch data from MongoDB
            response_data = json.loads(
                datacube_data_retrieval(
                    "1b834e07-c68b-4bf6-96dd-ab7cdc62f07f", 
                    "livinglab_scale_response", 
                    "collection_1", 
                    {
                        "scale_id": scale_id,
                        "dowell_time.current_time": {"$gte": formatted_start_time, "$lte": formatted_end_time}
                    }, 
                    10000, 
                    0, 
                    False 
                )
            )

            # Check if there is data within the last hour
            if response_data:
                score_list = [item.get('score', 0) for item in response_data["data"]]
                total_score = sum(score_list)
                average_score = total_score / len(score_list) if score_list else 0
                total_responses = len(score_list)

                # Prepare data to write to the JSON file
                data_to_write = {
                    "time": current_time.isoformat(), 
                    "total_score": total_score,
                    "average_score": average_score,
                    "total_responses": total_responses
                }

                # Update the JSON file with the current hour's data
                update_json_file(file_path, data_to_write)

                print(f"Score at {current_time}: {total_score}")
            else:
                print(f"No data in the last hour at {current_time}, score: 0")
                # Add 0 score for this hour to the JSON file
                data_to_write = {
                    "time": current_time.isoformat(),
                    "total_score": 0,
                    "average_score": 0,
                    "total_responses": 0
                }
                update_json_file(file_path, data_to_write)

        except Exception as e:
            print(f"An error occurred while fetching data: {e}")
        
        # Increment the current time by 1 hour
        current_time += timedelta(hours=1)

        # Sleep for 1 hour before making the next API call
        if current_time <= end_time:
            time.sleep(3600)


if __name__ == "__main__":
    scale_id = "66ec3f23081ae0eb638ce059"
    workspace_id = "6385c0f18eca0fb652c94558"
    fetch_score_every_hour(scale_id, workspace_id)