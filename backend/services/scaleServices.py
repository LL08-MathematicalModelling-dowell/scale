from services.datacube import *
from utils.eventID import get_event_id
from itertools import chain

class scaleServicesClass:
    def __init__(self):
        pass

    def get_nps_scale(self, payload):
            scale_range = range(0,11)
            no_of_buttons = 11

            scale_details = {
                 "workspace_id": payload["workspace_id"],
                 "username": payload["username"],
                 "scale_name": payload["scale_name"],
                 "scale_type": payload["scale_type"],
                 "user_type": payload["user_type"],
                 "channel_instance_list": payload["channel_instance_list"],
                 "no_of_channels":len(payload["channel_instance_list"]),
                 "no_of_buttons": no_of_buttons,
                 "scale_range": list(scale_range),
                 "event_id": get_event_id()
            }
           
            # save data to db
            response = json.loads(datacube_data_insertion(api_key,"livinglab_scales","collection_3",scale_details))
            scale_id = response['data'].get("inserted_id")
            scale_details["scale_id"] = scale_id

            # generate the button urls
            urls = self.generate_urls(scale_details)

            # insert urls into the db
            datacube_data_update(api_key, "livinglab_scales", "collection_3", {"_id": scale_id}, {"urls":urls})

            scale_response = {
                "scale_id": scale_id,
                "scale_name":payload["scale_name"],
                "user_type":payload["user_type"],
                "no_of_channels":len(payload["channel_instance_list"]),
                "instance_urls": urls
            }
                
            return scale_response
    
    def get_nps_lite_scale(self, payload):
        scale_range = range(0,3)
        no_of_buttons = 3

        scale_details = {
                "workspace_id": payload["workspace_id"],
                "username": payload["username"],
                "scale_name": payload["scale_name"],
                "scale_type": payload["scale_type"],
                "user_type": payload["user_type"],
                "channel_instance_list": payload["channel_instance_list"],
                "no_of_channels":len(payload["channel_instance_list"]),
                "no_of_buttons": no_of_buttons,
                "scale_range": list(scale_range),
                "event_id": get_event_id()
        }
        
        # save data to db
        response = json.loads(datacube_data_insertion(api_key,"livinglab_scales","collection_3",scale_details))
        scale_id = response['data'].get("inserted_id")
        scale_details["scale_id"] = scale_id

        # generate the button urls
        urls = self.generate_urls(scale_details)

        # insert urls into the db
        datacube_data_update(api_key, "livinglab_scales", "collection_3", {"_id": scale_id}, {"urls":urls})

        scale_response = {
                "scale_id": scale_id,
                "scale_name":payload["scale_name"],
                "user_type":payload["user_type"],
                "no_of_channels":len(payload["channel_instance_list"]),
                "instance_urls": urls
            }
            
        return scale_response
    
    def get_likert_scale(self, payload):
        no_of_pointers = payload["pointers"]
        scale_range = range(1,no_of_pointers+1)
        no_of_buttons = no_of_pointers

        scale_details = {
                "workspace_id": payload["workspace_id"],
                "username": payload["username"],
                "scale_name": payload["scale_name"],
                "scale_type": payload["scale_type"],
                "user_type": payload["user_type"],
                "channel_instance_list": payload["channel_instance_list"],
                "no_of_channels":len(payload["channel_instance_list"]),
                "no_of_buttons": no_of_buttons,
                "scale_range": list(scale_range),
                "pointers": no_of_pointers,
                "event_id": get_event_id()
        }
        
        # save data to db
        response = json.loads(datacube_data_insertion(api_key,"livinglab_scales","collection_3",scale_details))
        scale_id = response['data'].get("inserted_id")
        scale_details["scale_id"] = scale_id

        # generate the button urls
        urls = self.generate_urls(scale_details)

        # insert urls into the db
        datacube_data_update(api_key, "livinglab_scales", "collection_3", {"_id": scale_id}, {"urls":urls})

        scale_response = {
                "scale_id": scale_id,
                "scale_name":payload["scale_name"],
                "user_type":payload["user_type"],
                "no_of_channels":len(payload["channel_instance_list"]),
                "instance_urls": urls
            }
            
        return scale_response
    
    def get_stapel_scale(self, payload):
        axis_limit = payload["axis_limit"]
        scale_range = chain(range(-axis_limit, 0), range(1, axis_limit+1))
        no_of_buttons = 2*axis_limit

        scale_details = {
                "workspace_id": payload["workspace_id"],
                "username": payload["username"],
                "scale_name": payload["scale_name"],
                "scale_type": payload["scale_type"],
                "user_type": payload["user_type"],
                "channel_instance_list": payload["channel_instance_list"],
                "no_of_channels":len(payload["channel_instance_list"]),
                "no_of_buttons": no_of_buttons,
                "scale_range": list(scale_range),
                "axis_limit": axis_limit,
                "event_id": get_event_id()
        }
        
        # save data to db
        response = json.loads(datacube_data_insertion(api_key,"livinglab_scales","collection_3",scale_details))
        scale_id = response['data'].get("inserted_id")
        scale_details["scale_id"] = scale_id

        # generate the button urls
        urls = self.generate_urls(scale_details)

        # insert urls into the db
        datacube_data_update(api_key, "livinglab_scales", "collection_3", {"_id": scale_id}, {"urls":urls})

        scale_response = {
                "scale_id": scale_id,
                "scale_name":payload["scale_name"],
                "user_type":payload["user_type"],
                "no_of_channels":len(payload["channel_instance_list"]),
                "instance_urls": urls
            }
            
        return scale_response
    
    def get_learning_index_scale(self, payload):
        scale_range = range(0,11)
        no_of_buttons = 11

        scale_details = {
                "workspace_id": payload["workspace_id"],
                "username": payload["username"],
                "scale_name": payload["scale_name"],
                "scale_type": payload["scale_type"],
                "user_type": payload["user_type"],
                "channel_instance_list": payload["channel_instance_list"],
                "no_of_channels":len(payload["channel_instance_list"]),
                "no_of_buttons": no_of_buttons,
                "scale_range": list(scale_range),
                "event_id": get_event_id()
        }
        
        # save data to db
        response = json.loads(datacube_data_insertion(api_key,"livinglab_scales","collection_3",scale_details))
        scale_id = response['data'].get("inserted_id")
        scale_details["scale_id"] = scale_id

        # generate the button urls
        urls = self.generate_urls(scale_details)

        # insert urls into the db
        datacube_data_update(api_key, "livinglab_scales", "collection_3", {"_id": scale_id}, {"urls":urls})

        scale_response = {
                "scale_id": scale_id,
                "scale_name":payload["scale_name"],
                "user_type":payload["user_type"],
                "no_of_channels":len(payload["channel_instance_list"]),
                "instance_urls": urls
            }
            
        return scale_response



    # helper functions to create the button links
    def build_urls(self, channel_instance,scale_details,instance_idx):
        urls = []
        scale_details["scale_range"]
        for idx in scale_details["scale_range"]:
            # url = f"{public_url}/addons/create-response/v3/?user={settings['user_type']}&scale_type={settings['scale_category']}&channel={channel_instance['channel_name']}&instance={channel_instance['instances_details'][instance_idx]['instance_name']}&workspace_id={payload['workspace_id']}&username={settings['username']}&scale_id={settings['scale_id']}&item={idx}"
            url = f"http://127.0.0.1:8000/addons/create-response/v3/?user={scale_details['user_type']}&scale_type={scale_details['scale_type']}&channel={channel_instance['channel_name']}&instance={channel_instance['instances_details'][instance_idx]['instance_name']}&workspace_id={scale_details['workspace_id']}&username={scale_details['username']}&scale_id={scale_details['scale_id']}&item={idx}"
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