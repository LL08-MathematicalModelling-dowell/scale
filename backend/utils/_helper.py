from datetime import datetime, timedelta
import requests
from itertools import chain
from services.scaleServices import public_url


def get_date_range(period):
    now = datetime.utcnow()
    if period == 'twenty_four_hours':
        start_date = now - timedelta(hours=24)
    elif period == 'seven_days':
        start_date = now - timedelta(days=7)
    elif period == 'fifteen_days':
        start_date = now - timedelta(days=15)
    elif period == 'thirty_days':
        start_date = now - timedelta(days=30)
    elif period == 'ninety_days':
        start_date = now - timedelta(days=90)
    elif period == 'one_year':
        start_date = now - timedelta(days=365)
    # elif period == 'custom':
        # start_date = now - timedelta(days=30)
    else:
        raise ValueError("Invalid time period")
    return start_date.isoformat(), now.isoformat()


def build_urls(channel_instance,payload,instance_idx):
        urls = []
        print(payload)
        settings = payload["settings"]
        scale_range = settings["scale_range"]
        
        for idx in scale_range:
            url = f"{public_url}/v1/create-response/?user={settings['user_type']}&scale_type={settings['scale_category']}&channel={channel_instance['channel_name']}&instance={channel_instance['instances_details'][instance_idx]['instance_name']}&workspace_id={payload['workspace_id']}&username={settings['username']}&scale_id={settings['scale_id']}&item={idx}"
            # url = f"http://localhost:8001/v1/create-response/?user={settings['user_type']}&scale_type={settings['scale_category']}&channel={channel_instance['channel_name']}&instance={channel_instance['instances_details'][instance_idx]['instance_name']}&workspace_id={payload['workspace_id']}&username={settings['username']}&scale_id={settings['scale_id']}&item={idx}"
            urls.append(url)
        return urls

def generate_urls(payload):
    response = []
    settings = payload["settings"]
    for channel_instance in settings["channel_instance_list"]:
        channel_response = {
            "channel_name": channel_instance["channel_name"],
            "channel_display_name": channel_instance["channel_display_name"],
            "urls": []
        }
        for instance_detail in channel_instance["instances_details"]:
            instance_idx = channel_instance["instances_details"].index(instance_detail)
            instance_response = {
                "instance_name": instance_detail["instance_name"],
                "instance_display_name": instance_detail["instance_display_name"],
                "instance_urls": build_urls(channel_instance, payload,instance_idx)
            }
            channel_response["urls"].append(instance_response)
        response.append(channel_response)
    
    return response


def adjust_scale_range(payload):
    print("Inside adjust_scale_range function")
    settings = payload["settings"]
    scale_type = settings['scale_type']
    print(scale_type)
    print(f"Scale type: {scale_type}")
    
    total_no_of_items = int(settings['total_no_of_items'])
    print(f"Total number of items: {total_no_of_items}")
   
    if "pointers" in settings:
        pointers = settings['pointers']
    if "axis_limit" in settings:
        axis_limit = settings['axis_limit']
    print(f"Scale type: {scale_type}, Total number of items: {total_no_of_items}")

    if scale_type == 'nps' or scale_type == 'learning_index':
        scale_range = range(0, 11)
        print(scale_range)
        return scale_range

    elif scale_type == 'nps_lite':
        return range(0, 3)
    elif scale_type == 'stapel':
        if 'axis_limit' in settings:
            axis_limit = int(settings['axis_limit'])
            return chain(range(-axis_limit, 0), range(1, axis_limit + 1))
    elif scale_type == 'likert':
        if 'pointers' in settings:
            pointers = int(settings['pointers'])
            return range(1, pointers + 1)
        else:
            raise ValueError("Number of pointers not specified for Likert scale")
    else:
        raise ValueError("Unsupported scale type")

def scale_type_fn(scale_type, payload):
    print("inside scale type")
    print(payload)
    settings = payload["settings"]
    
    if scale_type == "nps" or scale_type == 'learning_index':
        no_of_items = 11
    elif scale_type == "nps lite":
        no_of_items = 3
    elif scale_type == "likert":
        pointers = settings['pointers']
        no_of_items = pointers
    elif scale_type == "stapel":
        axis_limit = settings["axis_limit"]
        no_of_items = 2 * axis_limit
        print(no_of_items)
    else:
        no_of_items = 11
    return no_of_items

def calcualte_learning_index(score, group_size, learner_category, category):
    print(score,group_size,learner_category)    

    #determine the learner category for the given score
    print(learner_category.items())
    for key, value in learner_category.items():
        if category == key:
            
            learner_category[key] += 1
           
            #calculate percentages for each learner category
            percentages = {key: (value / group_size) * 100 for key, value in learner_category.items()}

            #calculate LLx while avoiding division by zero
            denominator = percentages["reading"] + percentages["understanding"]
            if denominator == 0:
                LLx = (percentages["evaluating"] + percentages["applying"]) 
            else:
                LLx = (percentages["evaluating"] + percentages["applying"]) / denominator

            #identify the learning stage for the control group
            if 0 <= LLx <=1:
                learning_stage = "learning"
            else:
                learning_stage = "applying in context" 

    return percentages, LLx, learning_stage, learner_category

def determine_category(scale_type, item):
    if scale_type == "nps_lite":
        if item == 0:
            return "detractor"
        elif item == 1:
            return "passive"
        elif item == 2:
            return "promoter"
    elif scale_type == "nps":
        if 0 <= item <= 6:
            return "detractor"
        elif 7 <= item <= 8:
            return "passive"
        elif 9 <= item <= 10:
            return "promoter"
    elif scale_type == "learning_index":
        if item in range(0, 3):
            return "reading"
        elif item in range(3, 5):
            return "understanding"
        elif item in range(5, 7):
            return "explaining"
        elif item in range(7, 9):
            return "evaluating"
        elif item in range(9, 11):
            return "applying"
    return None

# Targeted population API
def targeted_population(period,api_key):
    url = "http://100032.pythonanywhere.com/api/targeted_population/v3/?api_key=3db9086b-527f-408b-9fea-ff552160bf40"

    payload = {
                "database_details": {
                "database_name": "datacube",
                "collection": "collection_1",
                "database": "livinglab_scale_response",
                "fields": [
                    "score"
                ]
            },
            "distribution_input": {
                "normal": 1,
                "poisson": 1,
                "binomial": 1,
                "bernoulli": 1
            },
            "number_of_variable": 1,
            "stages": [
            ],
            "time_input": {
                "column_name": "dowell_time.current_time",
                "split": "week",
                "period": period
            }
        }

    response = requests.post(url, json = payload)
    return response.json()

def get_display_names(channel_instance_list,current_channel_name,current_instance_name):
    for data in channel_instance_list:
        # print("ready", data["channel_name"])

        if current_channel_name == data["channel_name"]:
            print("ready", data["channel_name"])
            for instance in data["instances_details"]:
                print("ready", data["instances_details"])
                if current_instance_name == instance["instance_name"]:
                    channel_display_names = [data["channel_display_name"]]
                    instance_display_names = [instance["instance_display_name"]]
                    break

    if not channel_display_names or not instance_display_names:
        return "Channel or Instance not found"