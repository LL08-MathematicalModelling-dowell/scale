# import json
# import time
# from datetime import datetime, timedelta
# from services.datacube import datacube_data_retrieval, api_key
# import pytz

# def fetch_score_every_hour(scale_id):
#     hourly_data = []
#     # Timezone for IST (Indian Standard Time)
#     ist = pytz.timezone('Asia/Kolkata')

#     # Set the start time to 12:00 AM IST (today's date)
#     start_time = datetime.now(ist).replace(hour=20, minute=36, second=0, microsecond=0)
#     formatted_start_time = start_time.isoformat()

#     # End time is 24 hours from the start time
#     end_time = datetime.now(ist).replace(hour=20, minute=38, second=0, microsecond=0)
#     formatted_end_time = end_time.isoformat()

#     interval = timedelta(seconds=30)
    

#     call_time = start_time 
#     end_call_time = call_time + interval

#     current_time = datetime.now()
#     formatted_current_time = current_time.isoformat()
    
#     if start_time <= current_time <= end_time:
#         try:
#             # API call to fetch data from MongoDB
#             response_data = json.loads(
#                 datacube_data_retrieval(
#                     api_key, 
#                     "livinglab_scale_response", 
#                     "collection_1", 
#                     {"scale_id": scale_id,
#                      "dowell_time.current_time": {"$gte": call_time, "$lte": end_call_time}
#                      }, 
#                     10000, 
#                     0, 
#                     False 
#                 )
#             )

#             # Check if there is data within the last hour
#             if response_data:
#                 # Extract the score from the data (assuming it exists in the response)
#                 score_list = [item.get('score', 0) for item in response_data["data"]]
#                 total_score = sum(score_list)
#                 average_score = total_score / len(score_list) if score_list else 0
#                 total_responses = len(score_list)
#                 print(f"Score at {current_time}: {total_score}")

#                 return hourly_data.append({
#                     "response":response_data,
#                     "average_score": average_score,
#                     "total_score": total_score,
#                     "total_responses": total_responses
#                 })
#             else:
#                 return "no data found for the given scale_id"

#         except Exception as e:
#             print(f"An error occurred while fetching data: {e}")
        
#         # Increment the current time by 1 hour
#         # current_time += timedelta(seconds=1)

#         # Sleep for 1 hour before making the next API call
#         # if current_time <= end_time:
#         #     time.sleep(3600)
#     else:
#         return "check the start and end time"

import json
import requests
import time
from datetime import datetime, timedelta
import pytz

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

def fetch_score_every_hour(scale_id):
    # Timezone for IST (Indian Standard Time)
    ist = pytz.timezone('Asia/Kolkata')

    # Set the start time to 12:00 AM IST (today's date)
    start_time = datetime.now(ist).replace(hour=20, minute=0, second=0, microsecond=0)

    # End time is 24 hours from the start time
    end_time = start_time + timedelta(minutes=2)

    current_time = start_time

    while current_time <= end_time:
        try:
            # API call to fetch data from MongoDB
            response_data = json.loads(
                datacube_data_retrieval(
                    "1b834e07-c68b-4bf6-96dd-ab7cdc62f07f", 
                    "livinglab_scale_response", 
                    "collection_1", 
                    {"scale_id": scale_id}, 
                    10000, 
                    0, 
                    False 
                )
            )

            # Check if there is data within the last hour
            if response_data:
                # Extract the score from the data (assuming it exists in the response)
                score_list = [item.get('score', 0) for item in response_data["data"]]
                total_score = sum(score_list)
                average_score = total_score / len(score_list) if score_list else 0
                total_responses = len(score_list)
                print(f"Score at {current_time}: {total_score}")

                # return {
                #     "response":response_data,
                #     "average_score": average_score,
                #     "total_score": total_score,
                #     "total_responses": total_responses
                # }
            else:
                print(f"No data in the last hour at {current_time}, score: 0")

        except Exception as e:
            print(f"An error occurred while fetching data: {e}")
        
        # Increment the current time by 1 hour
        current_time += timedelta(seconds=1)

        # Sleep for 1 hour before making the next API call
        if current_time <= end_time:
            time.sleep(60)  # 3600 seconds = 1 hour

if __name__ == "__main__":
    scale_id = "66ec3f23081ae0eb638ce059"
    fetch_score_every_hour(scale_id)