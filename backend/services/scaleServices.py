from services.datacube import *
from services.dowellclock import dowell_time
from utils.eventID import get_event_id
from utils.helper import generate_urls, get_display_names, calculate_learning_index, parse_response_datetime
from itertools import chain
from collections import defaultdict
from datetime import datetime, timedelta

public_url = "https://www.scales.uxlivinglab.online/api"

class scaleServicesClass:
    def __init__(self):
        pass
    
    def create_scale_service(self, payload):
        scale_range_dict = {
            "nps": range(0,11),
            "nps_lite": range(0,3),
            "learning_index": range(0,11),
            # "likert": range(1,(payload.get("pointers"))+1),
            # "stapel": chain(range(-(payload.get("axis_limit")), 0), range(1, payload.get("axis_limit")+1))
        }
        scale_range = list(scale_range_dict.get(payload["scale_type"]))
        payload["scale_range"] = scale_range
        
        # generate the button urls
        urls = generate_urls(payload)

        scale_response = {
            "scale_id": payload["scale_id"],
            "scale_name":payload["scale_name"],
            "user_type":payload["user_type"],
            "no_of_channels":len(payload["channel_instance_list"]),
            "instance_urls": urls
        }
            
        return scale_response

    def create_scale_response(self, params, scale_response_data, settings_meta_data):
        scale_type = params["scale_type"]
            
        handlers = {
            "nps": self.handle_nps_response,
            "nps_lite": self.handle_nps_lite_response,
            "learning_index": self.handle_learning_index_response,
            "likert": self.handle_likert_response,
            "stapel": self.handle_stapel_response
        }
        if scale_type in handlers:
            response_data = handlers[scale_type](params, scale_response_data, settings_meta_data)
            return response_data
        else:
            raise ValueError(f"Unsupported scale type: {scale_type}")
        


    def retrieve_scale_settings(self, payload):
        return payload

    def generate_scale_report(self, scale_type, payload, start_date, end_date):

        scale_type_handlers = {
            "nps": self.get_nps_report,
            "likert": self.get_likert_report,
            "learning_index": self.get_learning_index_report,
            "nps_lite": self.get_nps_lite_report,
            "stapel":self.get_stapel_report
        }

        if scale_type in scale_type_handlers:
            report_data = scale_type_handlers[scale_type](payload, start_date, end_date)
            return report_data
        else:
            raise ValueError(f"Unsupported scale type: {scale_type}")


    # ---------- HANDLERS ----------

    def handle_nps_response(self,params,scale_response_data,settings_meta_data):
        scale_type = "nps"
        workspace_id = params["workspace_id"]
        item = params["item"]
        current_response_count = scale_response_data["current_response_count"]
        no_of_responses = settings_meta_data["no_of_responses"]
        channel_instance_list = settings_meta_data["channel_instance_list"]
        channel_name = params["channel_name"]
        instance_name = params["instance_name"]
        data_type = params["data_type"]

        if item in range(0,7):
            category = "detractor"
        elif item in range(7,9):
            category = "passive"
        elif item in range(9,11):
            category = "promoter"
        else:
            return "Invalid value for score"
        
        channel_display_names, instance_display_names = get_display_names(channel_instance_list,channel_name,instance_name)

        product_url = "https://www.uxlive.me/dowellscale/npslitescale"
        generated_url = f"{product_url}/?workspace_id={workspace_id}&scale_type={scale_type}&score={item}&channel={channel_name}&instance={instance_name}"
    
        if current_response_count <= no_of_responses:
            event_id = get_event_id()
            created_time = dowell_time("Asia/Calcutta")

            scale_response_data = {
                "workspace_id": params["workspace_id"],
                "username": params["username"],
                "scale_id": params["scale_id"],
                "scale_type": scale_type,
                "score": params["item"],
                "category": category,
                "user_type": params["user_type"],
                "event_id": event_id,
                "dowell_time": created_time["current_time"],
                "current_response_count": current_response_count,
                "no_of_available_responses": no_of_responses - current_response_count,
                "channel_name": channel_name,
                "channel_display_name": channel_display_names[0],
                "instance_name": instance_name,
                "instance_display_name": instance_display_names[0],
                "data_type": data_type,
                "redirect_url": generated_url
            }

            return scale_response_data
        
        else:
            return "No more responses allowed for this instance."
        
    def handle_nps_lite_response(self,params,scale_response_data,settings_meta_data):
        scale_type = "nps_lite"
        workspace_id = params["workspace_id"]
        item = params["item"]
        current_response_count = scale_response_data["current_response_count"]
        no_of_responses = settings_meta_data["no_of_responses"]
        channel_instance_list = settings_meta_data["channel_instance_list"]
        channel_name = params["channel_name"]
        instance_name = params["instance_name"]
        data_type = params["data_type"]

        if item == 0:
            category = "detractor"
        elif item == 1:
            category = "passive"
        elif item == 2:
            category = "promoter"
        else:
            return "Invalid value for score"
        
        channel_display_names, instance_display_names = get_display_names(channel_instance_list,channel_name,instance_name)

        product_url = "https://www.uxlive.me/dowellscale/npslitescale"
        generated_url = f"{product_url}/?workspace_id={workspace_id}&scale_type={scale_type}&score={item}&channel={channel_name}&instance={instance_name}"
    
        if current_response_count <= no_of_responses:
            event_id = get_event_id()
            created_time = dowell_time("Asia/Calcutta")

            scale_response_data = {
                "workspace_id": params["workspace_id"],
                "username": params["username"],
                "scale_id": params["scale_id"],
                "scale_type": scale_type,
                "score": params["item"],
                "category": category,
                "user_type": params["user_type"],
                "event_id": event_id,
                "dowell_time": created_time["current_time"],
                "current_response_count": current_response_count,
                "no_of_available_responses": no_of_responses - current_response_count,
                "channel_name": channel_name,
                "channel_display_name": channel_display_names[0],
                "instance_name": instance_name,
                "instance_display_name": instance_display_names[0],
                "data_type": data_type,
                "redirect_url": generated_url
            }

            return scale_response_data
        
        else:
            return "No more responses allowed for this instance."
        
    def handle_learning_index_response(self,params,scale_response_data,settings_meta_data):
        scale_type = "learning_index"
        workspace_id = params["workspace_id"]
        item = params["item"]
        current_response_count = scale_response_data["current_response_count"]
        existing_response_data = scale_response_data["existing_response_data"]
        no_of_responses = settings_meta_data["no_of_responses"]
        channel_instance_list = settings_meta_data["channel_instance_list"]
        channel_name = params["channel_name"]
        instance_name = params["instance_name"]
        data_type = params["data_type"]

        if item in range(0, 3):
            category = "reading"
        elif item in range(3, 5):
            category = "understanding"
        elif item in range(5, 7):
            category = "explaining"
        elif item in range(7, 9):
            category = "evaluating"
        elif item in range(9, 11):
            category = "applying"
        else:
            return "Invalid value for score"
        
        learner_category = {
                    "reading": 0,
                    "understanding": 0,
                    "explaining": 0,
                    "evaluating": 0,
                    "applying": 0
                } if current_response_count == 1 else existing_response_data[-1].get("learning_index_data", {}).get("learning_level_count", {})

        percentages, LLx, learning_stage, learner_category_cal = calculate_learning_index(item, current_response_count, learner_category, category)
        
        learning_index_data = {
            "control_group_size": current_response_count,
            "learning_level_count": learner_category_cal,
            "learning_level_percentages": percentages,
            "learning_level_index": LLx,
            "learning_stage": learning_stage
        }
        
        channel_display_names, instance_display_names = get_display_names(channel_instance_list,channel_name,instance_name)

        product_url = "https://www.uxlive.me/dowellscale/npslitescale"
        generated_url = f"{product_url}/?workspace_id={workspace_id}&scale_type={scale_type}&score={item}&channel={channel_name}&instance={instance_name}"
    
        if current_response_count <= no_of_responses:
            event_id = get_event_id()
            created_time = dowell_time("Asia/Calcutta")

            scale_response_data = {
                "workspace_id": params["workspace_id"],
                "username": params["username"],
                "scale_id": params["scale_id"],
                "scale_type": scale_type,
                "score": params["item"],
                "category": category,
                "user_type": params["user_type"],
                "event_id": event_id,
                "dowell_time": created_time["current_time"],
                "current_response_count": current_response_count,
                "no_of_available_responses": no_of_responses - current_response_count,
                "channel_name": channel_name,
                "channel_display_name": channel_display_names[0],
                "instance_name": instance_name,
                "instance_display_name": instance_display_names[0],
                "learning_index_data": learning_index_data,
                "data_type": data_type,
                "redirect_url": generated_url
            }

            return scale_response_data
    
        else:
            return "No more responses allowed for this instance."
    
    def handle_likert_response(self,params,scale_response_data,settings_meta_data):
        scale_type = "likert"
        workspace_id = params["workspace_id"]
        item = params["item"]
        current_response_count = scale_response_data["current_response_count"]
        no_of_responses = settings_meta_data["no_of_responses"]
        channel_instance_list = settings_meta_data["channel_instance_list"]
        channel_name = params["channel_name"]
        instance_name = params["instance_name"]
        data_type = params["data_type"]


        channel_display_names, instance_display_names = get_display_names(channel_instance_list,channel_name,instance_name)

        product_url = "https://www.uxlive.me/dowellscale/npslitescale"
        generated_url = f"{product_url}/?workspace_id={workspace_id}&scale_type={scale_type}&score={item}&channel={channel_name}&instance={instance_name}"
    
        if current_response_count <= no_of_responses:
            event_id = get_event_id()
            created_time = dowell_time("Asia/Calcutta")

            scale_response_data = {
                "workspace_id": params["workspace_id"],
                "username": params["username"],
                "scale_id": params["scale_id"],
                "scale_type": scale_type,
                "pointers": settings_meta_data["pointers"],
                "score": params["item"],
                "user_type": params["user_type"],
                "event_id": event_id,
                "dowell_time": created_time["current_time"],
                "current_response_count": current_response_count,
                "no_of_available_responses": no_of_responses - current_response_count,
                "channel_name": channel_name,
                "channel_display_name": channel_display_names[0],
                "instance_name": instance_name,
                "instance_display_name": instance_display_names[0],
                "data_type": data_type,
                "redirect_url": generated_url
            }

            return scale_response_data
        
        else:
            return "No more responses allowed for this instance."
        
    def handle_stapel_response(self,params,scale_response_data,settings_meta_data):
        scale_type = "stapel"
        workspace_id = params["workspace_id"]
        item = params["item"]
        current_response_count = scale_response_data["current_response_count"]
        no_of_responses = settings_meta_data["no_of_responses"]
        channel_instance_list = settings_meta_data["channel_instance_list"]
        channel_name = params["channel_name"]
        instance_name = params["instance_name"]
        data_type = params["data_type"]


        channel_display_names, instance_display_names = get_display_names(channel_instance_list,channel_name,instance_name)

        product_url = "https://www.uxlive.me/dowellscale/npslitescale"
        generated_url = f"{product_url}/?workspace_id={workspace_id}&scale_type={scale_type}&score={item}&channel={channel_name}&instance={instance_name}"
    
        if current_response_count <= no_of_responses:
            event_id = get_event_id()
            created_time = dowell_time("Asia/Calcutta")

            scale_response_data = {
                "workspace_id": params["workspace_id"],
                "username": params["username"],
                "scale_id": params["scale_id"],
                "scale_type": scale_type,
                "axis_limit": settings_meta_data["axis_limit"],
                "score": params["item"],
                "user_type": params["user_type"],
                "event_id": event_id,
                "dowell_time": created_time["current_time"],
                "current_response_count": current_response_count,
                "no_of_available_responses": no_of_responses - current_response_count,
                "channel_name": channel_name,
                "channel_display_name": channel_display_names[0],
                "instance_name": instance_name,
                "instance_display_name": instance_display_names[0],
                "data_type": data_type,
                "redirect_url": generated_url
            }

            return scale_response_data
        
        else:
            return "No more responses allowed for this instance."
        
    # NPS scale report
    def get_nps_report(self, data, start_date, end_date):    
    
        daily_counts = defaultdict(lambda: {"promoter": 0, "detractor": 0, "passive": 0, "nps": 0})
        start_date = parse_response_datetime(start_date)
        end_date = parse_response_datetime(end_date)

        # Initialize counts for each day in the range, even if no data is present for that day
        current_date = start_date
        while current_date <= end_date:
            daily_counts[str(current_date.date())] 
            current_date += timedelta(days=1)

        # Update daily_counts with actual responses from the data
        for response in data:
            response_date = str(parse_response_datetime(response['dowell_time']['current_time']).date())
            daily_counts[response_date][response["category"]] += 1
        
        for date, counts in daily_counts.items():
            total_responses = counts["promoter"] + counts["detractor"] + counts["passive"]
            if total_responses > 0:
                counts["nps"] = (counts["promoter"] - counts["detractor"]) / total_responses * 100
            else:
                counts["nps"] = 0 

        score_list = [response.get('score') for response in data]
        category_dict = {key: sum(counts[key] for counts in daily_counts.values()) for key in ["promoter", "detractor", "passive"]}
        percentage_category_distribution = {key: value / len(score_list) * 100 for key, value in category_dict.items()}
        nps = percentage_category_distribution["promoter"] - percentage_category_distribution["detractor"]
        total_score = sum(score_list)
        max_score = len(score_list) * 10
        
        return {
                "no_of_responses": len(score_list),
                "total_score": f"{total_score} / {max_score}",
                "nps": nps,
                "nps_category_distribution": percentage_category_distribution,
                "daily_counts": daily_counts
            }
        
    # Likert scale report
    def get_likert_report(self, data, start_date, end_date):
        score_list = [response['score'] for response in data]
        pointers = 5 
        
        daily_counts = defaultdict(lambda: {score: 0 for score in range(1, 6)})
        daily_average_score = {}

        # Convert string dates to datetime objects
        start_date = parse_response_datetime(start_date)
        end_date = parse_response_datetime(end_date)

        # Initialize counts for each day in the range, even if no data is present for that day
        current_date = start_date
        while current_date <= end_date:
            daily_counts[str(current_date.date())]
            current_date += timedelta(days=1)

        # Update daily_counts with actual responses from the data
        for response in data:
            response_date = str(parse_response_datetime(response['dowell_time']['current_time']).date())
            score = response['score']
            daily_counts[response_date][score] += 1

        # Calculate the total and average score
        total_score = sum(score_list)
        average_score = total_score / len(score_list) if score_list else 0

        # Initialize percentage_distribution with all scores from 1 to 5 set to 0%
        total_responses = len(score_list)
        max_score = pointers * total_responses

        # Calculate daily average score
        for date, scores in daily_counts.items():
            total_daily_score = sum(score * count for score, count in scores.items())
            daily_responses = sum(scores.values())
            if daily_responses > 0:
                daily_average_score[date] = total_daily_score / daily_responses
            else:
                daily_average_score[date] = 0 

        return {
            "no_of_responses": total_responses,
            "total_score": f"{total_score} / {max_score}",
            "average_score": average_score,
            "daily_counts": daily_counts,
            "daily_average_score": daily_average_score,
            # "score_list": score_list,
            "pointers": pointers,
        }
    
    def get_learning_index_report(self, data, start_date, end_date):
        return [{
                    "response_id":data["_id"],
                    "score":data["score"],
                    "category":data["category"],
                    "channel":data["channel_name"],
                    "instance":data["instance_name"],
                    "learning_index_data": data["learning_index_data"],
                    "date_created":data.get("dowell_time", {}).get("current_time")
                    } for data in data]
    
    def get_nps_lite_report(self, data, start_date, end_date):
        daily_average_score = {}
        daily_counts = defaultdict(lambda: {score: 0 for score in range(0,3)})
        daily_nps_counts = defaultdict(lambda: {"promoter": 0, "detractor": 0, "passive": 0, "nps": 0})
        start_date = parse_response_datetime(start_date)
        end_date = parse_response_datetime(end_date)

        # Initialize counts for each day in the range, even if no data is present for that day
        current_date = start_date
        while current_date <= end_date:
            daily_nps_counts[str(current_date.date())] 
            daily_counts[str(current_date.date())]
            current_date += timedelta(days=1)
           
        # Update daily_counts with actual responses from the data
        for response in data:
            response_date = str(parse_response_datetime(response['dowell_time']['current_time']).date())
            daily_counts[response_date][response["score"]]+=1
            daily_nps_counts[response_date][response["category"]] += 1
        
        for date, counts in daily_nps_counts.items():
            total_responses = counts["promoter"] + counts["detractor"] + counts["passive"]
            if total_responses > 0:
                counts["nps"] = (counts["promoter"] - counts["detractor"]) / total_responses * 100
            else:
                counts["nps"] = 0 

        # Calculate daily average score
        for date, scores in daily_counts.items():
            total_daily_score = sum(score * count for score, count in scores.items())
            print(scores.values())
            print(total_daily_score)
            daily_responses = sum(scores.values())
            print(daily_responses)
            if daily_responses > 0:
                daily_average_score[date] = total_daily_score / daily_responses
            else:
                daily_average_score[date] = 0 
        
        score_list = [response['score'] for response in data]
        print(score_list)
        category_dict = {key: sum(counts[key] for counts in daily_nps_counts.values()) for key in ["promoter", "detractor", "passive"]}
        percentage_category_distribution = {key: value / len(score_list) * 100 for key, value in category_dict.items()}
        nps = percentage_category_distribution["promoter"] - percentage_category_distribution["detractor"]
        total_score = sum(score_list)
        max_score = len(score_list) * 2
        
        return {
                "no_of_responses": len(score_list),
                "total_score": f"{total_score} / {max_score}",
                "overall_average_score": round((total_score/ max_score) * 2,4) if max_score > 2 else 0,
                # "nps": nps,
                # "nps_category_distribution": percentage_category_distribution,
                "daily_counts": daily_counts,
                "daily_average_score":daily_average_score
                # "daily_nps_counts": daily_nps_counts
            }
    
    def get_stapel_report(self, data, start_date, end_date):
        return data
    