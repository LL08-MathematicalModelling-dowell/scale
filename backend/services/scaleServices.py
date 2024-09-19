from services.datacube import *
from services.dowellclock import dowell_time
from utils.eventID import get_event_id
from itertools import chain

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
        urls = self.generate_urls(payload)

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
            "nps": self.handle_nps_response(params, scale_response_data, settings_meta_data),
            "nps_lite": self.handle_nps_lite_response(params, scale_response_data, settings_meta_data),
            "learning_index": self.handle_learning_index_response(params, scale_response_data, settings_meta_data),
            "likert": self.handle_likert_response(params, scale_response_data, settings_meta_data),
            "stapel": self.handle_stapel_response(params, scale_response_data, settings_meta_data)
        }

        response_data = handlers[scale_type]

        return response_data


    def retrieve_scale_settings(self, payload):
        return payload


    # ------ helper functions ------
    def build_urls(self, channel_instance,scale_details,instance_idx):
        urls = []
        scale_details["scale_range"]
        for idx in scale_details["scale_range"]:
            # url = f"{public_url}/v1/scale-services/?user={scale_details['user_type']}&scale_type={scale_details['scale_type']}&channel={channel_instance['channel_name']}&instance={channel_instance['instances_details'][instance_idx]['instance_name']}&workspace_id={scale_details['workspace_id']}&username={scale_details['username']}&scale_id={scale_details['scale_id']}&item={idx}"
            url = f"http://localhost:8001/v1/scale-services/?user={scale_details['user_type']}&scale_type={scale_details['scale_type']}&channel={channel_instance['channel_name']}&instance={channel_instance['instances_details'][instance_idx]['instance_name']}&workspace_id={scale_details['workspace_id']}&username={scale_details['username']}&scale_id={scale_details['scale_id']}&item={idx}"
            urls.append(url)
        return urls

    def generate_urls(self, scale_details):
        response = []
        for channel_instance in scale_details["channel_instance_list"]:
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
                    "instance_urls": self.build_urls(channel_instance, scale_details,instance_idx)
                }
                channel_response["urls"].append(instance_response)
            response.append(channel_response)
        
        return response
    
    def get_display_names(self, channel_instance_list,current_channel_name,current_instance_name):
        for data in channel_instance_list:
            if current_channel_name == data["channel_name"]:
                for instance in data["instances_details"]:
                    if current_instance_name == instance["instance_name"]:
                        channel_display_names = [data["channel_display_name"]]
                        instance_display_names = [instance["instance_display_name"]]
                        break

        if not channel_display_names or not instance_display_names:
            return self.error_esponse("Channel or Instance not found",None)
        
        return channel_display_names, instance_display_names
    
    def calculate_learning_index(self, score, group_size, learner_category, category):
        print(score,group_size,learner_category)
        percentages = {}
        LLx = 0
        learning_stage = ""    

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
        
    def handle_nps_response(self,params,scale_response_data,settings_meta_data):
        scale_type = "nps"
        workspace_id = params["workspace_id"]
        item = params["item"]
        current_response_count = scale_response_data["current_response_count"]
        no_of_responses = settings_meta_data["no_of_responses"]
        channel_instance_list = settings_meta_data["channel_instance_list"]
        channel_name = params["channel_name"]
        instance_name = params["instance_name"]

        if item in range(0,7):
            category = "detractor"
        elif item in range(7,9):
            category = "passive"
        elif item in range(9,11):
            category = "promoter"
        else:
            return "Invalid value for score"
        
        channel_display_names, instance_display_names = self.get_display_names(channel_instance_list,channel_name,instance_name)

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
                "redirect_url": generated_url
            }

            return scale_response_data
        
        else:
            return "No more responses allowed for this instance."
        
    def handle_nps_lite_response(self,params,scale_response_data,settings_meta_data):
        scale_type = "nps"
        workspace_id = params["workspace_id"]
        item = params["item"]
        current_response_count = scale_response_data["current_response_count"]
        no_of_responses = settings_meta_data["no_of_responses"]
        channel_instance_list = settings_meta_data["channel_instance_list"]
        channel_name = params["channel_name"]
        instance_name = params["instance_name"]

        if item == 0:
            category = "detractor"
        elif item == 1:
            category = "passive"
        elif item == 2:
            category = "promoter"
        else:
            return "Invalid value for score"
        
        channel_display_names, instance_display_names = self.get_display_names(channel_instance_list,channel_name,instance_name)

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
                "redirect_url": generated_url
            }

            return scale_response_data
        
        else:
            return "No more responses allowed for this instance."
        
    def handle_learning_index_response(self,params,scale_response_data,settings_meta_data):
        scale_type = "nps"
        workspace_id = params["workspace_id"]
        item = params["item"]
        current_response_count = scale_response_data["current_response_count"]
        existing_response_data = scale_response_data["existing_response_data"]
        no_of_responses = settings_meta_data["no_of_responses"]
        channel_instance_list = settings_meta_data["channel_instance_list"]
        channel_name = params["channel_name"]
        instance_name = params["instance_name"]

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

        percentages, LLx, learning_stage, learner_category_cal = self.calculate_learning_index(item, current_response_count, learner_category, category)
        
        learning_index_data = {
            "control_group_size": current_response_count,
            "learning_level_count": learner_category_cal,
            "learning_level_percentages": percentages,
            "learning_level_index": LLx,
            "learning_stage": learning_stage
        }
        
        channel_display_names, instance_display_names = self.get_display_names(channel_instance_list,channel_name,instance_name)

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
                "redirect_url": generated_url
            }

            return scale_response_data
    
        else:
            return "No more responses allowed for this instance."
    
    def handle_likert_response(self,params,scale_response_data,settings_meta_data):
        scale_type = "nps"
        workspace_id = params["workspace_id"]
        item = params["item"]
        current_response_count = scale_response_data["current_response_count"]
        no_of_responses = settings_meta_data["no_of_responses"]
        channel_instance_list = settings_meta_data["channel_instance_list"]
        channel_name = params["channel_name"]
        instance_name = params["instance_name"]


        channel_display_names, instance_display_names = self.get_display_names(channel_instance_list,channel_name,instance_name)

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
                "redirect_url": generated_url
            }

            return scale_response_data
        
        else:
            return "No more responses allowed for this instance."
        
    def handle_stapel_response(self,params,scale_response_data,settings_meta_data):
        scale_type = "nps"
        workspace_id = params["workspace_id"]
        item = params["item"]
        current_response_count = scale_response_data["current_response_count"]
        no_of_responses = settings_meta_data["no_of_responses"]
        channel_instance_list = settings_meta_data["channel_instance_list"]
        channel_name = params["channel_name"]
        instance_name = params["instance_name"]


        channel_display_names, instance_display_names = self.get_display_names(channel_instance_list,channel_name,instance_name)

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
                "redirect_url": generated_url
            }

            return scale_response_data
        
        else:
            return "No more responses allowed for this instance."