from django.shortcuts import render,redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import *
from services.datacube import *
from django.contrib.auth.hashers import make_password, check_password
import asyncio
import json
from utils.helper import *
from utils.eventID import get_event_id
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timezone
from services.sendEmail import *
from services.scaleServices import scaleServicesClass
import random

jwt_utils = JWTUtils()
scales = scaleServicesClass()

@method_decorator(csrf_exempt, name='dispatch')
class healthCheck(APIView):
    def get(self, request):
        now = datetime.now(timezone.utc).isoformat()
        return Response({
            "success":True,
            "status": "UP",
            "version": "1.7.0",
            "timestamp": now,
            "server_time": now,
            "message":"The API server is healthy"
        }, status=status.HTTP_200_OK)
    
@method_decorator(csrf_exempt, name='dispatch')
class UserManagement(APIView):
    def post(self, request):
        type = request.GET.get('type')
        if type == 'get_access_token':
            return self.get_access_token(request)
        elif type == 'update_profile':
            return self.update_userprofile(request)
        elif type == 'authenticate_user':
            return self.authenticate_user(request)
        elif type == 'send_customer_email':
            return self.send_customer_email(request)
        elif type == 'login_using_pin':
            return self.login_using_pin(request)
        else:
            return self.handle_error(request)
    
    
    def get_access_token(self,request):
        refresh_token = request.COOKIES.get('refresh_token') or request.headers.get('Authorization', '').replace('Bearer ', '') or request.data.get('refresh_token')

        if not refresh_token:
            return Response({
                "success": False,
                "message": "Refresh token not provided"
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        decoded_payload = jwt_utils.decode_jwt_token(refresh_token)
        if not decoded_payload:
            return Response({
                "success": False,
                "message": "Refresh token expired"
            }, status=status.HTTP_401_UNAUTHORIZED)
        user_response = json.loads(datacube_data_retrieval(
            api_key, 
            "voc", 
            "voc_user_management", 
            {
                "_id": decoded_payload["_id"]
            },
            0,
            0,
            False
        ))

        if not user_response['success']:
            return Response({
                "success": False,
                "message": "User not found"
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        token = jwt_utils.generate_jwt_tokens(
            user_response['data'][0]['_id'], 
            user_response['data'][0]['workspace_id'], 
            user_response['data'][0]['portfolio']
        )
        return Response({
            "success": True,
            "message": "Access token generated successfully",
            "access_token": token["access_token"],
            "refresh_token": token["refresh_token"],
            "response": user_response['data'][0]
        })
    
    def authenticate_user(self, request):
        workspace_name = request.data.get("workspace_name")
        portfolio = request.data.get("portfolio")
        password = request.data.get("password")
        latitude = request.data.get("latitude")
        longitude = request.data.get("longitude")

        serializer = UserAuthSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Posting wrong data to API",
                "errors": serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)

        client_admin_login_response = dowell_login(workspace_name, portfolio, password)

        # return Response(client_admin_login_response)
        if not client_admin_login_response.get("success") or client_admin_login_response.get("response") == 0:
            return Response({
                "success": False,
                "message": client_admin_login_response.get("message", "Authentication failed")
            }, status=status.HTTP_401_UNAUTHORIZED)
        status = client_admin_login_response["status"]

        data = client_admin_login_response.get("response", {})
        if status == "CID":
            user_info = {
                "workspace_name": workspace_name,
                "portfolio": portfolio
            }
        if status == "UID":
            user_info = {
                "workspace_name": workspace_name,
                "portfolio": data.get("portfolio_info", {}).get("portfolio_name", portfolio)
            }

        # return Response(user_info)
        existing_user_response = json.loads(datacube_data_retrieval(api_key, "voc", "voc_user_management", user_info, 10000, 0, False))
        existing_user = existing_user_response.get('data', [])

        if not existing_user:
            create_user_response = json.loads(datacube_data_insertion(
                api_key,
                "voc",
                "voc_user_management",
                {
                    **user_info,
                    "email": "",
                    "profile_image": "",
                    "workspace_id": data["userinfo"]["owner_id"],
                    "workspace_owner_name": data["userinfo"]["owner_name"],
                    "portfolio_username": data["portfolio_info"]["username"][0],
                    "member_type": data["portfolio_info"]["member_type"],
                    "data_type": data["portfolio_info"]["data_type"],
                    "operations_right": data["portfolio_info"]["operations_right"],
                    "status": data["portfolio_info"]["status"]
                }
            ))

            if not create_user_response.get("success"):
                return Response({
                    "success": False,
                    "message": "Error while creating user",
                }, status=status.HTTP_400_BAD_REQUEST)

            data = {
                "_id": create_user_response["data"]["inserted_id"],
                **user_info,
                "email": "",
                "profile_image": "",
                "workspace_id": data["userinfo"]["owner_id"],
                "workspace_owner_name": data["userinfo"]["owner_name"],
                "portfolio_username": data["portfolio_info"]["username"][0],
                "member_type": data["portfolio_info"]["member_type"],
                "data_type": data["portfolio_info"]["data_type"],
                "operations_right": data["portfolio_info"]["operations_right"],
                "status": data["portfolio_info"]["status"]
            }

            message = "User created successfully"
        else:
            existing_user_data = existing_user[0]
            data = {
                "_id": existing_user_data["_id"],
                **user_info,
                "email": existing_user_data["email"],
                "profile_image": existing_user_data["profile_image"],
                "workspace_id": existing_user_data["workspace_id"],
                "workspace_owner_name": existing_user_data["workspace_owner_name"],
                "portfolio_username": existing_user_data["portfolio_username"],
                "member_type": existing_user_data["member_type"],
                "data_type": existing_user_data["data_type"],
                "operations_right": existing_user_data["operations_right"],
                "status": existing_user_data["status"]
            }

            message = "User authenticated successfully"
        print(latitude, longitude,data["workspace_id"])
        if latitude and longitude:
            try:
                response_location = json.loads(save_location_data(
                    workspaceId=data["workspace_id"],
                    latitude=latitude,
                    longitude=longitude,
                    userId=data["portfolio_username"],
                    event= "login"
                ))
                print(response_location)
            except Exception as e:
                print(f"Location save failed: {e}")
                
                pass

        token = jwt_utils.generate_jwt_tokens(data)
        return Response({
            "success": True,
            "message": message,
            "access_token": token["access_token"],
            "refresh_token": token["refresh_token"],
            "response": data
        })
    
    @login_required
    def update_userprofile(self,request):
        _id = request.data.get("_id")

        existing_user_response = json.loads(datacube_data_retrieval(api_key, "voc", "voc_user_management", {"_id":_id}, 10000, 0, False))
        existing_user = existing_user_response.get('data', [])

        if existing_user:
            existing_user_data = existing_user[0]

            recent_data = request.data["data"]

            if recent_data:
                update_serializer = UserUpdateSerializer(data=recent_data)
                if not update_serializer.is_valid():
                    return Response({
                        "success": False,
                        "message": "Posting wrong data to API",
                        "errors": update_serializer.errors,
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                email = update_serializer.validated_data.get("email",None)
                profile_image = update_serializer.validated_data.get("profile_image",None)

                updated_data = {

                    "email": email,
                    "profile_image": profile_image
                }
        
                user_update = json.loads(datacube_data_update(
                    api_key,
                    "voc",
                    "voc_user_management",
                    {"_id":_id},  
                    updated_data
                ))

                message = user_update.get("message")
                return Response({
                        "success":True,
                        "message":message
                    }, status=status.HTTP_204_NO_CONTENT)
            else:
                data = {
                    "_id": existing_user_data["_id"],
                    "email": existing_user_data["email"],
                    "profile_image": existing_user_data["profile_image"],
                    "workspace_id": existing_user_data["workspace_id"],
                    "workspace_owner_name": existing_user_data["workspace_owner_name"],
                    "portfolio_username": existing_user_data["portfolio_username"],
                    "member_type": existing_user_data["member_type"],
                    "data_type": existing_user_data["data_type"],
                    "operations_right": existing_user_data["operations_right"],
                    "status": existing_user_data["status"]
                }

                message = "Nothing to update"
                return Response({
                        "success": True,
                        "message": message,
                        "response": data
                    })

                
        else:
            return Response({
                "success":False,
                "message":"User does not exist"
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def send_customer_email(self, request):
        email = request.data.get("email")
        user_id = request.data.get("user_id")
        latitude = request.data.get("latitude")
        longitude = request.data.get("longitude")
        workspace_name= request.data.get("workspace_name")

        serializer = EmailSerializer(data={
            "email": email,
            "user_id": user_id,
            "workspace_name":workspace_name
        })

        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Posting wrong data to API",
                "errors": serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # TODO: Replace this when required

        user_email_response = json.loads(datacube_data_retrieval(
            api_key, 
            "voc", 
            "voc_user_management", 
            {
                "portfolio_username": user_id,
                "workspace_name": workspace_name
            },
            1,
            0,
            False
        ))

        # return Response(user_email_response)

        if not user_email_response["data"]:
            return Response({
                "success": False,
                "message": "Please enter valid user ID"
            }, status=status.HTTP_404_NOT_FOUND)
        

        if user_email_response["data"][0]["email"] == "":
            response = get_portfolio_details(workspace_name, user_id)

            if not response["success"]:
                return Response({
                    "success": False,
                    "message": response["message"]
                }, status=status.HTTP_404_NOT_FOUND)
        
            user_update = json.loads(datacube_data_update(
                api_key,
                "voc",
                "voc_user_management",
                {"_id":user_email_response["data"][0]["_id"]},  
                {

                    "email": email
                }
            ))

            if not user_update["success"]:
                return Response({
                    "success": False,
                    "message": "Faild to update email"
                }, status=status.HTTP_400_BAD_REQUEST)

            portfolio_details = response["response"][0]
            customer_id = portfolio_details["portfolio_info"]["portfolio_name"]
            product_id = workspace_name
            user_id = user_id
            password = portfolio_details["portfolio_info"]["password"]

            pin = None

            check_pin = json.loads(datacube_data_retrieval(
                api_key,
                "voc",
                "scale_pin_auth",
                {
                    "user_id": user_id,
                    "customer_id":customer_id,
                    "product_id": product_id,
                    "password":password
                },
                1,
                0,
                False
            ))

            if not check_pin["success"]:
                return Response({
                    "success": False,
                    "message": "Failed to fetch the pin"
                })
            if len(check_pin["data"]) == 0:
                print("here is no pin")

                pins = json.loads(datacube_data_retrieval(
                    api_key,
                    "voc",
                    "scale_pin_auth",
                    {},
                    0,
                    0,
                    False
                ))

                # Retrieve all current pins to ensure uniqueness
                all_existing_pins = set(entry["pin"] for entry in pins.get("data", []) if "pin" in entry)
                
                # Generate a unique 4-digit PIN
                while True:
                    pin = f"{random.randint(1000, 9999)}"
                    if pin not in all_existing_pins:
                        break  # Exit loop if PIN is unique

                insert_pin_response = json.loads(datacube_data_insertion(
                    api_key,
                    "voc",
                    "scale_pin_auth",
                    {
                        "user_id": user_id,
                        "customer_id": customer_id,
                        "product_id": product_id,
                        "password": password,
                        "pin": pin
                    },
                ))
                if not insert_pin_response["success"]:
                    return Response({
                        "success": False,
                        "message": "Failed to insert pin"
                    }, status=status.HTTP_400_BAD_REQUEST)
            if check_pin["data"]:
                print("here is a pin")
                pin = check_pin["data"][0]["pin"]   

            if latitude and longitude:
                try:
                    save_location_data(
                        workspace_id=portfolio_details["userinfo"]["owner_id"],
                        latitude=latitude,
                        longitude=longitude,
                        user_id=user_id,
                        event="registration"
                    )
                except Exception as e:
                    print(f"Location save failed: {e}")
                    pass

            response_send_email = json.loads(send_email(
                toname=email,
                toemail=email,
                customer_id=customer_id,
                product_id=product_id,    
                user_id=user_id,
                password=password,   
                pin= pin,     
                login_link="https://youtube.com/shorts/FmqMJJf7ei0?feature=share",
                direct_login_link= f"https://www.scales.uxlivinglab.online/voc/?workspace_name={product_id}&portfolio={customer_id}&password={password}"
            ))

            if not response_send_email["success"]:
                return Response({
                    "success": False,
                    "message": "Failed to send email, Please try again"
                }, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                "success": True,
                "message": "Email sent successfully"
            }, status=status.HTTP_200_OK)
        
        if user_email_response["data"][0]["email"]!= email:
            return Response({
                "success": False,
                "message": "This account is registered with another user. If you want to claim this account contact us at dowell@dowellresearch.sg"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if user_email_response["data"][0]["email"] == email:
            response = get_portfolio_details(workspace_name, user_id)

            if not response["success"]:
                return Response({
                    "success": False,
                    "message": response["message"]
                }, status=status.HTTP_404_NOT_FOUND)

            portfolio_details = response["response"][0]
            customer_id = portfolio_details["portfolio_info"]["portfolio_name"]
            product_id = workspace_name
            user_id = user_id
            password = portfolio_details["portfolio_info"]["password"]

            pin = None

            check_pin = json.loads(datacube_data_retrieval(
                api_key,
                "voc",
                "scale_pin_auth",
                {
                    "user_id": user_id,
                    "customer_id":customer_id,
                    "product_id": product_id,
                    "password":password
                },
                1,
                0,
                False
            ))

            if not check_pin["success"]:
                return Response({
                    "success": False,
                    "message": "Failed to fetch the pin"
                })
            if len(check_pin["data"]) == 0:
                print("here is no pin")

                pins = json.loads(datacube_data_retrieval(
                    api_key,
                    "voc",
                    "scale_pin_auth",
                    {},
                    0,
                    0,
                    False
                ))

                # Retrieve all current pins to ensure uniqueness
                all_existing_pins = set(entry["pin"] for entry in pins.get("data", []) if "pin" in entry)
                
                # Generate a unique 4-digit PIN
                while True:
                    pin = f"{random.randint(1000, 9999)}"
                    if pin not in all_existing_pins:
                        break 

                insert_pin_response = json.loads(datacube_data_insertion(
                    api_key,
                    "voc",
                    "scale_pin_auth",
                    {
                        "user_id": user_id,
                        "customer_id": customer_id,
                        "product_id": product_id,
                        "password": password,
                        "pin": pin
                    },
                ))
                if not insert_pin_response["success"]:
                    return Response({
                        "success": False,
                        "message": "Failed to insert pin"
                    }, status=status.HTTP_400_BAD_REQUEST)
            if check_pin["data"]:
                print("here is a pin")
                pin = check_pin["data"][0]["pin"]   

            if latitude and longitude:
                try:
                    save_location_data(
                        workspace_id=portfolio_details["userinfo"]["owner_id"],
                        latitude=latitude,
                        longitude=longitude,
                        user_id=user_id,
                        event="registration"
                    )
                except Exception as e:
                    print(f"Location save failed: {e}")
                    pass

            response_send_email = json.loads(send_email(
                toname=email,
                toemail=email,
                customer_id=customer_id,
                product_id=product_id,    
                user_id=user_id,
                password=password,  
                pin=pin,      
                login_link="https://youtube.com/shorts/FmqMJJf7ei0?feature=share",
                direct_login_link= f"https://www.scales.uxlivinglab.online/voc/?workspace_name={product_id}&portfolio={customer_id}&password={password}"
            ))

            if not response_send_email["success"]:
                return Response({
                    "success": False,
                    "message": "Failed to send email, Please try again"
                }, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                "success": True,
                "message": "Email sent successfully"
            }, status=status.HTTP_200_OK)
        
    def login_using_pin(self,request):
        pin = request.GET.get("pin")

        if not pin:
            return Response({
                "success": False,
                "message": "Pin is required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        get_pin = json.loads(datacube_data_retrieval(
            api_key,
            "voc",
            "scale_pin_auth",
            {
                "pin": pin
            },
            1,
            0,
            False
        ))

        if not get_pin["success"]:
            return Response({
                "success": False,
                "message": "Invalid pin or wrong pin"
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "success": True,
            "message": "Pin verified successfully",
            "response": get_pin["data"]
        })
    
    def handle_error(self, request): 
        return Response({
            "success": False,
            "message": "Invalid request type"
        }, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class ScaleManagement(APIView):

    def post(self, request):
        type = request.GET.get('type')
        if type =='save_scale_details':
            return self.save_scale_details(request)
        elif type == 'scale_details':
            return self.scale_details(request)
        elif type == 'save_scale_details_type':
            return self.save_scale_details_type(request)
        elif type == 'qrcodessss':
            return self.qrcodessss(request)
        else:
            return self.handle_error(request)

    # @login_required
    def save_scale_details(self, request):
        workspace_id = request.data.get("workspace_id")
        username = request.data.get("username")
        portfolio = request.data.get("portfolio")
        portfolio_username = request.data.get("portfolio_username")
        
        serializer = ScaleRetrieveSerializer(data={
            "workspace_id": workspace_id,
            "username": username,
            "portfolio": portfolio,
            "portfolio_username": portfolio_username
        })
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Invalid data",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        voc_scale_data = json.loads(datacube_data_retrieval(
            api_key,
            "voc",
            "voc_scales",
            {
                "workspace_id": workspace_id,
                "portfolio": portfolio
            },
            0,
            0,
            False
        ))


        if not voc_scale_data['success']:
            return Response({
                "success": False,
                "message": "Failed to retrieve scale data",
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if voc_scale_data["data"]:
            return Response({
                "success": False,
                "message": "Scale details already exist for this workspace, username, and portfolio",
            }, status=status.HTTP_400_BAD_REQUEST)
        
        
        scale_data_response = json.loads(datacube_data_retrieval(
            api_key,
            "livinglab_scales",
            "collection_3",
            {
                "workspace_id": workspace_id,
                "settings.username": username,
                "settings.scale_category": "nps"
            },
            0,
            0,
            False
        ))
        if not scale_data_response["success"]:
            return Response({
                "success": False,
                "message": "Failed to retrieve scale data",
            }, status=status.HTTP_400_BAD_REQUEST)
        
        scale_details = [{
            "scale_id":scale["_id"],
            "scale_name": scale["settings"].get("scale_name"),
            "scale_type":scale["settings"].get("scale_category"),
            "no_of_channels":scale["settings"].get("no_of_channels"),
            "channel_instance_details": scale["settings"].get("channel_instance_list")
            } for scale in scale_data_response["data"]]
        
    
        data_for_voc_scale = json.loads(datacube_data_retrieval(
            api_key,
            "voc",
            "voc_scales",
            {},
            0,
            0,
            False
        ))

        if not data_for_voc_scale['success']:
            return Response({
                "success": False,
                "message": "Failed to retrieve scale data for VOC",
            }, status=status.HTTP_400_BAD_REQUEST)

        
        existing_scale_ids = {scale['scale_id'] for scale in data_for_voc_scale.get('data', [])}
        
        
        available_scales = [scale for scale in scale_details if scale['scale_id'] not in existing_scale_ids]


        if not available_scales:
            return Response({
                "success": False,
                "message": "No new scale data available to assign",
            }, status=status.HTTP_400_BAD_REQUEST)

        assigned_scale = available_scales[0]  

       
        links_details = []
        scale_type = assigned_scale.get('scale_type')
        for channel in assigned_scale.get('channel_instance_details', []):
            channel_name = channel.get('channel_name', '') 
            channel_display_name = channel.get('channel_display_name', '')
            for instance in channel.get('instances_details', []):
                instance_name = instance.get('instance_name', '')  
                instance_display_name = instance.get('instance_display_name', '')
                link = (
                    f"https://www.scales.uxlivinglab.online/api/voc/scale/?workspace_id={workspace_id}&username={username}&"
                    f"scale_id={assigned_scale['scale_id']}&scale_type={scale_type}&channel={channel_name}&"
                    f"instance_name={instance_name}&channel_display_name={channel_display_name}&instance_display_name={instance_display_name}"
                )
                qrcode_image = generate_qr_code(url=link, portfolio_name=portfolio_username)
                file_name = generate_file_name(prefix='qrcode', extension='png')
                qrcode_image_url = upload_qr_code_image(qrcode_image, file_name)
                links_details.append({
                    "scale_link": link,
                    "qrcode_image_url": qrcode_image_url
                })
        
        
        report_link = {
            "report_link": f"https://www.scales.uxlivinglab.online/api/voc/report/?workspace_id={workspace_id}&username={username}&scale_id={assigned_scale['scale_id']}",
            "qrcode_image_url": None
        }
        
       
        report_qrcode_image = generate_qr_code(report_link["report_link"],portfolio_name=portfolio_username)
        report_qrcode_file_name = generate_file_name(prefix='report_qrcode', extension='png')
        report_qrcode_image_url = upload_qr_code_image(report_qrcode_image, report_qrcode_file_name)
        report_link["qrcode_image_url"] = report_qrcode_image_url

        login = {
            "login_link": f"https://www.scales.uxlivinglab.online/api/voc/login/?workspace_name={username}",
            "qrcode_image_url": None
        }


        login_qrcode_image = generate_qr_code(url=login["login_link"], portfolio_name=portfolio_username)
        login_qrcode_file_name = generate_file_name(prefix='login_qrcode', extension='png')
        login_qrcode_image_url = upload_qr_code_image(login_qrcode_image, login_qrcode_file_name)
        login["qrcode_image_url"] = login_qrcode_image_url

        
        data_to_be_inserted = {
            "workspace_id": workspace_id,
            "username": username,
            "portfolio": portfolio,
            "scale_id": assigned_scale['scale_id'],
            "links_details": links_details,
            "report_link": report_link,
            "login": login,
            "created_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "records": [{"record": "1", "type": "overall"}]
        }

        response = json.loads(datacube_data_insertion(
            api_key,
            "voc",
            "voc_scales",
            data_to_be_inserted
        ))
        
        if not response['success']:
            return Response({
                "success": False,
                "message": "Failed to save scale details"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            "success": True,
            "message": "Scale details saved successfully",
            "response": data_to_be_inserted
        })

    # @login_required
    def scale_details(self, request):
        workspace_id = request.data.get("workspace_id")
        portfolio = request.data.get("portfolio")
        type_of_scale = request.data.get("type_of_scale")

        serializer = ScaleDetailsSerializer(data={
            "workspace_id": workspace_id,
            "portfolio": portfolio,
            "type_of_scale": type_of_scale
        })
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Invalid data",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if type_of_scale == "nps":
            collection_name = "voc_scales"
            data_to_be_fetched = {
                "workspace_id": workspace_id,
                "portfolio": portfolio
            }
        else:
            collection_name = "voc_scales_1"
            data_to_be_fetched = {
                "workspace_id": workspace_id,
                "portfolio": portfolio,
                "type_of_scale": type_of_scale
            }
        
        response = json.loads(datacube_data_retrieval(
            api_key,
            "voc",
            collection_name,
            data_to_be_fetched,
            0,
            0,
            False
        ))

        if not response['success']:
            return Response({
                "success": False,
                "message": "No scale details found"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            "success": True,
            "message": f"Scale details for portfolio {portfolio} found",
            "response": response['data']
        }, status=status.HTTP_200_OK)
    
    # @login_required
    def save_scale_details_type(self, request):
        workspace_id = request.data.get("workspace_id")
        username = request.data.get("username")
        portfolio = request.data.get("portfolio")
        portfolio_username = request.data.get("portfolio_username")
        type_of_scale = request.data.get("type_of_scale")
        
        serializer = SaceScaleDetailsSerializer(data={
            "workspace_id": workspace_id,
            "username": username,
            "portfolio": portfolio,
            "portfolio_username": portfolio_username,
            "type_of_scale": type_of_scale
        })
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Invalid data",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        voc_scale_data = json.loads(datacube_data_retrieval(
            api_key,
            "voc",
            "voc_scales_1",
            {
                "workspace_id": workspace_id,
                "portfolio": portfolio,
                "type_of_scale": type_of_scale
            },
            0,
            0,
            False
        ))

        if not voc_scale_data['success']:
            return Response({
                "success": False,
                "message": "Failed to retrieve scale data",
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if voc_scale_data["data"]:
            return Response({
                "success": False,
                "message": "Scale details already exist for this workspace, username, and portfolio and scale type",
            }, status=status.HTTP_400_BAD_REQUEST)
        
        
        scale_data_response = json.loads(datacube_data_retrieval(
            api_key,
            "livinglab_scales",
            "collection_3",
            {
                "workspace_id": workspace_id,
                "settings.username": username,
                "settings.scale_category": type_of_scale
            },
            0,
            0,
            False
        ))
        if not scale_data_response["success"]:
            return Response({
                "success": False,
                "message": "Failed to retrieve scale data",
            }, status=status.HTTP_400_BAD_REQUEST)
        
        scale_details = [{
            "scale_id":scale["_id"],
            "scale_name": scale["settings"].get("scale_name"),
            "scale_type":scale["settings"].get("scale_category"),
            "no_of_channels":scale["settings"].get("no_of_channels"),
            "channel_instance_details": scale["settings"].get("channel_instance_list")
            } for scale in scale_data_response["data"]]
        
        data_for_voc_scale = json.loads(datacube_data_retrieval(
            api_key,
            "voc",
            "voc_scales_1",
            {},
            0,
            0,
            False
        ))

        if not data_for_voc_scale['success']:
            return Response({
                "success": False,
                "message": "Failed to retrieve scale data for VOC",
            }, status=status.HTTP_400_BAD_REQUEST)

        
        existing_scale_ids = {scale['scale_id'] for scale in data_for_voc_scale.get('data', [])}
        
        
        available_scales = [scale for scale in scale_details if scale['scale_id'] not in existing_scale_ids]


        if not available_scales:
            return Response({
                "success": False,
                "message": "No new scale data available to assign",
            }, status=status.HTTP_400_BAD_REQUEST)

        assigned_scale = available_scales[0]  

       
        links_details = []
        scale_type = assigned_scale.get('scale_type')
        for channel in assigned_scale.get('channel_instance_details', []):
            channel_name = channel.get('channel_name', '') 
            channel_display_name = channel.get('channel_display_name', '')
            for instance in channel.get('instances_details', []):
                instance_name = instance.get('instance_name', '')  
                instance_display_name = instance.get('instance_display_name', '')
                link = (
                    f"https://www.scales.uxlivinglab.online/api/voc/scale/?workspace_id={workspace_id}&username={username}&"
                    f"scale_id={assigned_scale['scale_id']}&scale_type={scale_type}&channel={channel_name}&"
                    f"instance_name={instance_name}&channel_display_name={channel_display_name}&instance_display_name={instance_display_name}"
                )
                qrcode_image = generate_qr_code(url=link, portfolio_name=portfolio_username)
                file_name = generate_file_name(prefix='qrcode', extension='png')
                qrcode_image_url = upload_qr_code_image(qrcode_image, file_name)
                links_details.append({
                    "scale_link": link,
                    "qrcode_image_url": qrcode_image_url
                })
        
        
        report_link = {
            "report_link": f"https://www.scales.uxlivinglab.online/api/voc/report/?workspace_id={workspace_id}&username={username}&scale_id={assigned_scale['scale_id']}",
            "qrcode_image_url": None
        }
        
       
        report_qrcode_image = generate_qr_code(report_link["report_link"],portfolio_name=portfolio_username)
        report_qrcode_file_name = generate_file_name(prefix='report_qrcode', extension='png')
        report_qrcode_image_url = upload_qr_code_image(report_qrcode_image, report_qrcode_file_name)
        report_link["qrcode_image_url"] = report_qrcode_image_url

        login = {
            "login_link": f"https://www.scales.uxlivinglab.online/api/voc/login/?workspace_name={username}",
            "qrcode_image_url": None
        }


        login_qrcode_image = generate_qr_code(url=login["login_link"], portfolio_name=portfolio_username)
        login_qrcode_file_name = generate_file_name(prefix='login_qrcode', extension='png')
        login_qrcode_image_url = upload_qr_code_image(login_qrcode_image, login_qrcode_file_name)
        login["qrcode_image_url"] = login_qrcode_image_url

        
        data_to_be_inserted = {
            "workspace_id": workspace_id,
            "username": username,
            "portfolio": portfolio,
            "scale_id": assigned_scale['scale_id'],
            "type_of_scale": type_of_scale,
            "links_details": links_details,
            "report_link": report_link,
            "login": login,
            "created_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "records": [{"record": "1", "type": "overall"}]
        }

        response = json.loads(datacube_data_insertion(
            api_key,
            "voc",
            "voc_scales_1",
            data_to_be_inserted
        ))
        
        if not response['success']:
            return Response({
                "success": False,
                "message": "Failed to save scale details"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            "success": True,
            "message": "Scale details saved successfully",
            "response": data_to_be_inserted
        })

    def qrcodessss(self, request):
        login = {
            "login_link": "www.example.com",
            "qrcode_image_url": None
        }


        login_qrcode_image = generate_qr_code(url=login["login_link"], portfolio_name="manish")
        login_qrcode_file_name = generate_file_name(prefix='login_qrcode', extension='png')
        login_qrcode_image_url = upload_qr_code_image(login_qrcode_image, login_qrcode_file_name)
        login["qrcode_image_url"] = login_qrcode_image_url

        return Response({
            "success": True,
            "message": "QR code generated successfully",
            "response": login
        }, status=status.HTTP_200_OK)
    
    def handle_error(self, request): 
        return Response({
            "success": False,
            "message": "Invalid request type"
        }, status=status.HTTP_400_BAD_REQUEST)
    


@method_decorator(csrf_exempt, name='dispatch')
class ScaleCreationView(APIView):
    # Create and retrieve scales
    def post(self, request):
        service_type = request.GET.get("service_type")
        
        if service_type == "create_scale":
            return self.create_scale(request)
        elif service_type == "get_scale_details":
            return self.fetch_scale_data(request)
        elif service_type == "get_scale_report":
            return self.get_scale_report(request)
    
    # Create response for a scale
    def get(self, request):
        try:
            parameters = {
                "scale_id": request.GET.get('scale_id'),
                "item": int(request.GET.get('item')),
                "workspace_id": request.GET.get('workspace_id'),
                "username": request.GET.get('username'),
                "user_type": request.GET.get('user'),
                "scale_type": request.GET.get('scale_type'),
                "channel_name": request.GET.get('channel'),
                "instance_name": request.GET.get('instance'),
                "data_type": request.GET.get('data_type')
            }
            serializer = ScaleResponseSerializer(data = parameters)

            if not serializer.is_valid():
                return self.error_response(message = "Invalid parameters. Cannot complete the request.", error = serializer.errors)

            workspace_id = serializer.validated_data["workspace_id"]
            settings_meta_data = {}
        
            # Checking for existing responses in the db
            fields = {
                "scale_id": serializer.validated_data["scale_id"], 
                "channel_name": serializer.validated_data["channel_name"], 
                "instance_name": serializer.validated_data["instance_name"]
                }
            
            existing_response = json.loads(datacube_data_retrieval(
                api_key,
                "livinglab_scale_response",
                "collection_1",
                fields,
                10000,
                0,
                False
            ))
            
            # existing_response = json.loads(datacube_data_retrieval(
            #     api_key,
            #     f"{workspace_id}_scale_response_data",
            #     f"{workspace_id}_scale_response",
            #     fields,
            #     10000,
            #     0,
            #     False
            # ))
            existing_response_data = existing_response["data"]
           
            # Fetch the scale congifurations
            scale_settings = json.loads(datacube_data_retrieval(
                api_key,
                "livinglab_scales",
                "collection_3",
                {"_id": serializer.validated_data["scale_id"]},
                10000,
                0,
                False
            ))
            # scale_settings = json.loads(datacube_data_retrieval(
            #     api_key,
            #     f"{workspace_id}_scale_meta_data",
            #     f"{workspace_id}_scale_setting",
            #     {"_id": serializer.validated_data["scale_id"]},
            #     10000,
            #     0,
            #     False
            # ))
            scale_settings_data = scale_settings['data'][0]
            
            scale_response_data = {
                "current_response_count": len(existing_response_data) + 1 if existing_response_data else 1,
                "existing_response_data": existing_response_data
            }
            settings_meta_data.update(scale_settings_data["settings"])

            response_data = scales.create_scale_response(parameters, scale_response_data, settings_meta_data)

            if isinstance(response_data, str):
                return self.error_response(message=response_data, error=None)
            else:
                # Insertion into the DB
                response_data["user_info"] = dict(request.headers)

                inserted_response = json.loads(datacube_data_insertion(
                    api_key,
                    "livinglab_scale_response",
                    "collection_1",
                    response_data
                ))

                # inserted_response = json.loads(datacube_data_insertion(
                #     api_key,
                #     f"{workspace_id}_scale_response_data",
                #     f"{workspace_id}_scale_response",
                #     response_data
                # ))
                if not inserted_response["data"]:
                    return self.error_response("Unable to insert scale response",None)
                
                inserted_response_data = inserted_response['data']
                response_id = inserted_response_data['inserted_id']

                if parameters["user_type"] == "True":
                    return redirect(response_data["redirect_url"])
                else:
                    data = {
                            "response_id": response_id,
                            "score": response_data["score"],
                            "category": response_data["category"],
                            "channel": response_data["channel_name"],
                            "channel_display_name": response_data["channel_display_name"],
                            "instance_name": response_data["instance_name"],
                            "instance_display_name": response_data["instance_display_name"],
                            "current_response_no": response_data["current_response_count"],
                            "no_of_available_responses": response_data["no_of_available_responses"],
                            "data_type": response_data["data_type"],
                            "created_at": response_data["dowell_time"]
                    }
                    if parameters["scale_type"] == "learning_index":
                        data["learning_index_data"] = response_data.get("learning_index_data")


                    return self.success_response(
                        message = "Response recorded successfully",
                        data = data)
                    
        except Exception as e:
            return self.error_response(message = "Resource not found! Contact the admin",error = str(e))
    
    # Update scale settings
    def put(self, request):

        serializer = ScaleUpdateSerializer(data={
            "scale_id": request.data.get("scale_id"),
            "workspace_id": request.data.get("workspace_id"),
            "update_settings": request.data.get("update_settings")
        })

        if not serializer.is_valid():
            return self.error_response(message= "Posting incorrect data", error= serializer.errors)
        
        scale_id = serializer.validated_data["scale_id"]
        update_settings = serializer.validated_data["update_settings"]

        data_to_update = {
            "settings.user_type": update_settings["user_type"],
            "settings.no_of_channels": update_settings["no_of_channels"],
            "settings.channel_instance_list": update_settings["channel_instance_list"],
            "settings.no_of_responses": update_settings["no_of_responses"]
        }
        
        # db_response = json.loads(datacube_data_insertion(
        #     api_key,
        #     f"{workspace_id}_scale_meta_data",
        #     f"{workspace_id}_scale_setting",
        #     scale_data
        # ))
        
        db_response = json.loads(datacube_data_update(api_key,"livinglab_scales","collection_3",{"_id":scale_id},data_to_update))
        
        if db_response["success"] == False:
            return self.error_response(db_response["message"], None)

        return self.success_response(db_response["message"], None)

    # Method for creating scale links based on the scale_type
    def create_scale(self, request):  
        try:  
            scale_type = request.GET.get("scale_type")

            if not scale_type:
                return self.error_response("Missing scale_type in query parameters", error = None)

            scale_type_handler = {
                "nps": self.handle_nps_scale(request),
                "nps_lite": self.handle_nps_lite_scale(request),
                # "likert": self.handle_likert_scale(request),
                # "stapel": self.handle_stapel_scale(request),
                "learning_index": self.handle_learning_index_scale(request)
            }

            scale_data = scale_type_handler[scale_type]
            
            if isinstance(scale_data, str):
                return self.error_response(message = scale_data, error = None)
            
            print(scale_data)

            serializer = ScaleCreationSerializer(data=scale_data)
            if not serializer.is_valid():
                return self.error_response("Posting incorrect data",serializer.errors)
            
            workspace_id = serializer.validated_data["workspace_id"]
           
            
            # db_response = json.loads(datacube_data_insertion(
            #     api_key,
            #     f"{workspace_id}_scale_meta_data",
            #     f"{workspace_id}_scale_setting",
            #     scale_data
            # ))
            db_response = json.loads(datacube_data_insertion(api_key,"livinglab_scales","collection_3",scale_data))
            scale_id = db_response['data'].get("inserted_id")
            scale_data["scale_id"] = scale_id

            # Insert scale info into the info collection
            scale_info = {
                "scale_id": scale_data["scale_id"],
                "scale_name": scale_data["scale_name"]
            }

            # datacube_data_insertion(
            #     api_key,
            #     f"{workspace_id}_scale_meta_data",
            #     f"{workspace_id}_scale_info",
            #     scale_info
            # )
            
            response_data = scales.create_scale_service(scale_data)

            # datacube_data_update(
            #     api_key,
            #     f"{workspace_id}_scale_meta_data",
            #     f"{workspace_id}_scale_setting",
            #     {"_id": scale_id},
            #     {"urls": response_data["urls"]}
            # )

            return self.success_response("New scale created successfully", response_data)
        
        except Exception as e:
            return self.error_response("Something went wrong while processing your request",str(e))


    # Handlers to get different inputs based on the scale_type    
    def handle_nps_scale(self, request):
        try:
            return {
                    "api_key": request.GET.get("api_key"),
                    "workspace_id": request.data.get("workspace_id"),
                    "settings": {
                        "username": request.data.get("username"),
                        "scale_name": request.data.get("scale_name"),
                        "scale_category": request.GET.get("scale_type"),
                        "user_type": request.data.get("user_type"),
                        "no_of_responses": request.data.get("no_of_responses"),
                        "channel_instance_list": request.data.get("channel_instance_list")
                    }
                }
        except Exception as e:
            raise ValueError(f"Error extracting Likert scale data: {str(e)}")
        
    def handle_nps_lite_scale(self, request):
        try:
            return {
                    "api_key": request.GET.get("api_key"),
                    "workspace_id": request.data.get("workspace_id"),
                    "settings":{
                        "username": request.data.get("username"),
                        "scale_name": request.data.get("scale_name"),
                        "scale_category": request.GET.get("scale_type"),
                        "user_type": request.data.get("user_type"),
                        "no_of_responses": request.data.get("no_of_responses"),
                        "channel_instance_list": request.data.get("channel_instance_list")
                    }
                }
        except Exception as e:
            raise ValueError(f"Error extracting NPS scale data: {str(e)}")
        
    def handle_likert_scale(self, request):
        try:
            return {
                "api_key": request.GET.get("api_key"),
                "workspace_id": request.data.get("workspace_id"),
                "settings":{
                    "username": request.data.get("username"),
                    "scale_name": request.data.get("scale_name"),
                    "scale_category": request.GET.get("scale_type"),
                    "user_type": request.data.get("user_type"),
                    "no_of_responses": request.data.get("no_of_responses"),
                    "channel_instance_list": request.data.get("channel_instance_list"),
                    "pointers": request.data.get("pointers")
                }
            }
        except Exception as e:
            raise ValueError(f"Error extracting Likert scale data: {str(e)}")

    def handle_stapel_scale(self, request):
        try:
            return {
                    "api_key": request.GET.get("api_key"),
                    "workspace_id": request.data.get("workspace_id"),
                    "settings":{
                        "username": request.data.get("username"),
                        "scale_name": request.data.get("scale_name"),
                        "scale_category": request.GET.get("scale_type"),
                        "user_type": request.data.get("user_type"),
                        "no_of_responses": request.data.get("no_of_responses"),
                        "channel_instance_list": request.data.get("channel_instance_list"),
                        "axis_limit": request.data.get("axis_limit")
                    }
                    
                }
        except Exception as e:
            raise ValueError(f"Error extracting Stapel scale data: {str(e)}")
    
    def handle_learning_index_scale(self, request):
        try:
            return {
                    "api_key": request.GET.get("api_key"),
                    "workspace_id": request.data.get("workspace_id"), 
                    "settings":{
                        "username": request.data.get("username"),
                        "scale_name": request.data.get("scale_name"),
                        "scale_category": request.GET.get("scale_type"),
                        "user_type": request.data.get("user_type"),
                        "no_of_responses": request.data.get("no_of_responses"),
                        "channel_instance_list": request.data.get("channel_instance_list")
                    }    
                }
        except Exception as e:
            raise ValueError(f"Error extracting Learning Index scale data: {str(e)}")
    
    # Method to retrieve scale settings from the db
    def fetch_scale_data(self, request):
        api_key = request.GET.get("api_key")
        
        if not api_key:
            return self.error_response("Missing api_key in query parameters", error = None)
        
        if 'workspace_id' and 'scale_id' and 'channel_name' and 'instance_name' in request.data:
            data = {
                "scale_id": request.data.get("scale_id"),
                "workspace_id": request.data.get("workspace_id"),
                "channel_name": request.data.get("channel_name"),
                "instance_name": request.data.get("instance_name")
            }
            filter = {
                "_id": request.data.get("scale_id"),
                "workspace_id": request.data.get("workspace_id")
            }

        elif 'workspace_id' and 'scale_id' in request.data:
            data = {
                "workspace_id": request.data.get("workspace_id"),
                "scale_id": request.data.get("scale_id")
            }
            filter = {
                "_id": request.data.get("scale_id")
            }

        elif 'workspace_id' and 'username' and "scale_type" in request.data:
            data = {
                "workspace_id": request.data.get("workspace_id"),
                "username": request.data.get("username"),
                "scale_type": request.data.get("scale_type")
            }
            filter = {
                "workspace_id": request.data.get("workspace_id"),
                "settings.username": request.data.get("username"),
                "settings.scale_category": request.data.get("scale_type")
            }
    
        elif 'workspace_id' in request.data:
            data = {
                "workspace_id": request.data.get("workspace_id")
            }
            filter = data

        serializer = ScaleRetrievalSerializer(data=data)
        
        if not serializer.is_valid():
            return self.error_response("Posting incorrect/ incomplete data", serializer.errors)
        
        workspace_id = serializer.validated_data["workspace_id"]
        
        response_json = json.loads(datacube_data_retrieval(api_key, "livinglab_scales", "collection_3", filter, 10000, 0, False))
        # response_json = json.loads(datacube_data_retrieval(
        #         api_key,
        #         f"{workspace_id}_scale_meta_data",
        #         f"{workspace_id}_scale_setting",
        #         filter,
        #         10000,
        #         0,
        #         False
        #     ))

        response_data = response_json["data"]
        if not response_data:
            return self.error_response("Could not find the requested resource. Please check if the scale exists.", None)
        
        if "channel_name" and "instance_name" in request.data:
            channel_instance_list = response_data[0]["settings"].get("channel_instance_list")
            channel_display_name, instance_display_name = get_display_names(channel_instance_list, serializer.validated_data["channel_name"], serializer.validated_data["instance_name"])
            response = {
                "channel_display_name": channel_display_name,
                "instance_display_name": instance_display_name
            }
        else:
            response = {
                "total_no_of_scales":len(response_data),
                "scale_details": [{
                    "scale_id":response["_id"],
                    "scale_name": response["settings"].get("scale_name"),
                    "scale_type":response["settings"].get("scale_category"),
                    "no_of_channels":response["settings"].get("no_of_channels"),
                    "channel_instance_details": response["settings"].get("channel_instance_list")
                } for response in response_data]
            }
    
        return self.success_response(message="Retrieved the scale details succcessfully", data=response)
    
    def get_scale_report(self, request):
        data = {
            "scale_type": request.GET.get("scale_type"),
            "scale_id": request.data.get("scale_id"),
            # "workspace_id": request.data.get("workspace_id"),
            "channel_names": request.data.get("channel_names"),
            "instance_names": request.data.get("instance_names"),
            "period": request.data.get("period")
        }
        
        serializer = ScaleReportSerializer(data=data)

        if not serializer.is_valid():
            return self.error_response(message="Posting invalid data", error=serializer.errors)
        
        validated_data = serializer.validated_data

        scale_type = validated_data["scale_type"]
        # workspace_id = validated_data["workspace_id"]

        start_date, end_date = get_date_range(validated_data["period"])
        
        filters = {
            "scale_id": validated_data["scale_id"],
            # "dowell_time.current_time": {"$gte": start_date, "$lte": end_date}
        }
        if "all" not in validated_data["channel_names"]:
            filters["channel_name"] = {"$in": validated_data["channel_names"]}
        if "all" not in validated_data["instance_names"]:
            filters["instance_name"] = {"$in": validated_data["instance_names"]}

        responses = json.loads(datacube_data_retrieval(api_key, 'livinglab_scale_response', 'collection_1', filters, 10000, 0, False))
        print(responses)

        # responses = json.loads(datacube_data_retrieval(
        #     api_key,
        #     f"{workspace_id}_scale_response_data",
        #     f"{workspace_id}_scale_response",
        #     filters,
        #     10000,
        #     0,
        #     False
        # ))

        if not responses['data']:
            return self.error_response(message="No data found", error=None)

        report = scales.generate_scale_report(scale_type, responses['data'], start_date, end_date)

        if not report:
            return self.error_response(message="Failed to generate the report. Contact admin", error=None)
        
        return self.success_response(message=f"Successfully generated the {scale_type} scale report", data=report)
    
    
    # Method to return a success response
    def success_response(self, message, data):
        return Response({
            "success": "true",
            "message": message,
            "data": data,
        }, status=status.HTTP_201_CREATED)

    # Method to return an error response
    def error_response(self, message, error):
        return Response({
            "success": "false",
            "message": message,
            "error":error
        }, status=status.HTTP_400_BAD_REQUEST)


# Scale Management APIs for LLx
@method_decorator(csrf_exempt, name='dispatch')
class LLxScaleManagement(APIView):

    def post(self, request):
        type = request.GET.get('type')
        if type =='save_scale_details':
            return self.save_scale_details(request)
        elif type == 'scale_details':
            return self.scale_details(request)
        elif type == 'save_scale_details_type':
            return self.save_scale_details_type(request)
        else:
            return self.handle_error(request)

    @login_required
    def save_scale_details(self, request):
        workspace_id = request.data.get("workspace_id")
        username = request.data.get("username")
        portfolio = request.data.get("portfolio")
        portfolio_username = request.data.get("portfolio_username")
        
        serializer = ScaleRetrieveSerializer(data={
            "workspace_id": workspace_id,
            "username": username,
            "portfolio": portfolio,
            "portfolio_username": portfolio_username
        })
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Invalid data",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        voc_scale_data = json.loads(datacube_data_retrieval(
            api_key,
            "voc",
            "voc_llx_scales",
            {
                "workspace_id": workspace_id,
                "portfolio": portfolio
            },
            0,
            0,
            False
        ))


        if not voc_scale_data['success']:
            return Response({
                "success": False,
                "message": "Failed to retrieve scale data",
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if voc_scale_data["data"]:
            return Response({
                "success": False,
                "message": "Scale details already exist for this workspace, username, and portfolio",
            }, status=status.HTTP_400_BAD_REQUEST)
        
        
        scale_data_response = json.loads(datacube_data_retrieval(
            api_key,
            "livinglab_scales",
            "collection_3",
            {
                "workspace_id": workspace_id,
                "settings.username": username,
                "settings.scale_category": "learning_index"
            },
            0,
            0,
            False
        ))
        if not scale_data_response["success"]:
            return Response({
                "success": False,
                "message": "Failed to retrieve scale data",
            }, status=status.HTTP_400_BAD_REQUEST)
        
        scale_details = [{
            "scale_id":scale["_id"],
            "scale_name": scale["settings"].get("scale_name"),
            "scale_type":scale["settings"].get("scale_category"),
            "no_of_channels":scale["settings"].get("no_of_channels"),
            "channel_instance_details": scale["settings"].get("channel_instance_list")
            } for scale in scale_data_response["data"]]
        
    
        data_for_voc_scale = json.loads(datacube_data_retrieval(
            api_key,
            "voc",
            "voc_llx_scales",
            {},
            0,
            0,
            False
        ))

        if not data_for_voc_scale['success']:
            return Response({
                "success": False,
                "message": "Failed to retrieve scale data for VOC",
            }, status=status.HTTP_400_BAD_REQUEST)

        
        existing_scale_ids = {scale['scale_id'] for scale in data_for_voc_scale.get('data', [])}
        
        
        available_scales = [scale for scale in scale_details if scale['scale_id'] not in existing_scale_ids]


        if not available_scales:
            return Response({
                "success": False,
                "message": "No new scale data available to assign",
            }, status=status.HTTP_400_BAD_REQUEST)

        assigned_scale = available_scales[0]  

       
        links_details = []
        scale_type = assigned_scale.get('scale_type')
        for channel in assigned_scale.get('channel_instance_details', []):
            channel_name = channel.get('channel_name', '') 
            channel_display_name = channel.get('channel_display_name', '')
            for instance in channel.get('instances_details', []):
                instance_name = instance.get('instance_name', '')  
                instance_display_name = instance.get('instance_display_name', '')
                link = (
                    f"https://www.scales.uxlivinglab.online/api/llx/scale/?workspace_id={workspace_id}&username={username}&"
                    f"scale_id={assigned_scale['scale_id']}&scale_type={scale_type}&channel={channel_name}&"
                    f"instance_name={instance_name}&channel_display_name={channel_display_name}&instance_display_name={instance_display_name}"
                )
                qrcode_image = generate_qr_code(url=link, portfolio_name=portfolio_username)
                file_name = generate_file_name(prefix='qrcode', extension='png')
                qrcode_image_url = upload_qr_code_image(qrcode_image, file_name)
                links_details.append({
                    "scale_link": link,
                    "qrcode_image_url": qrcode_image_url
                })
        
        
        report_link = {
            "report_link": f"https://www.scales.uxlivinglab.online/api/llx/report/?workspace_id={workspace_id}&username={username}&scale_id={assigned_scale['scale_id']}",
            "qrcode_image_url": None
        }
        
       
        report_qrcode_image = generate_qr_code(report_link["report_link"],portfolio_name=portfolio_username)
        report_qrcode_file_name = generate_file_name(prefix='report_qrcode', extension='png')
        report_qrcode_image_url = upload_qr_code_image(report_qrcode_image, report_qrcode_file_name)
        report_link["qrcode_image_url"] = report_qrcode_image_url

        login = {
            "login_link": f"https://www.scales.uxlivinglab.online/api/llx/login/?workspace_name={username}",
            "qrcode_image_url": None
        }


        login_qrcode_image = generate_qr_code(url=login["login_link"], portfolio_name=portfolio_username)
        login_qrcode_file_name = generate_file_name(prefix='login_qrcode', extension='png')
        login_qrcode_image_url = upload_qr_code_image(login_qrcode_image, login_qrcode_file_name)
        login["qrcode_image_url"] = login_qrcode_image_url

        
        data_to_be_inserted = {
            "workspace_id": workspace_id,
            "username": username,
            "portfolio": portfolio,
            "scale_id": assigned_scale['scale_id'],
            "links_details": links_details,
            "report_link": report_link,
            "login": login,
            "created_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "records": [{"record": "1", "type": "overall"}]
        }

        response = json.loads(datacube_data_insertion(
            api_key,
            "voc",
            "voc_scales",
            data_to_be_inserted
        ))
        
        if not response['success']:
            return Response({
                "success": False,
                "message": "Failed to save scale details"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            "success": True,
            "message": "Scale details saved successfully",
            "response": data_to_be_inserted
        })

    @login_required
    def scale_details(self, request):
        workspace_id = request.data.get("workspace_id")
        portfolio = request.data.get("portfolio")
        type_of_scale = request.data.get("type_of_scale")

        serializer = ScaleDetailsSerializer(data={
            "workspace_id": workspace_id,
            "portfolio": portfolio,
            "type_of_scale": type_of_scale
        })
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Invalid data",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        
        collection_name = "voc_llx_scales"
        data_to_be_fetched = {
            "workspace_id": workspace_id,
            "portfolio": portfolio,
            "type_of_scale": type_of_scale
        }
        
        response = json.loads(datacube_data_retrieval(
            api_key,
            "voc",
            collection_name,
            data_to_be_fetched,
            0,
            0,
            False
        ))

        if not response['success']:
            return Response({
                "success": False,
                "message": "No scale details found"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            "success": True,
            "message": f"Scale details for portfolio {portfolio} found",
            "response": response['data']
        }, status=status.HTTP_200_OK)
    
    @login_required
    def save_scale_details_type(self, request):
        workspace_id = request.data.get("workspace_id")
        username = request.data.get("username")
        portfolio = request.data.get("portfolio")
        portfolio_username = request.data.get("portfolio_username")
        type_of_scale = request.data.get("type_of_scale")
        
        serializer = SaceScaleDetailsSerializer(data={
            "workspace_id": workspace_id,
            "username": username,
            "portfolio": portfolio,
            "portfolio_username": portfolio_username,
            "type_of_scale": type_of_scale
        })
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Invalid data",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        voc_scale_data = json.loads(datacube_data_retrieval(
            api_key,
            "voc",
            "voc_llx_scales",
            {
                "workspace_id": workspace_id,
                "portfolio": portfolio,
                "type_of_scale": type_of_scale
            },
            0,
            0,
            False
        ))

        if not voc_scale_data['success']:
            return Response({
                "success": False,
                "message": "Failed to retrieve scale data",
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if voc_scale_data["data"]:
            return Response({
                "success": False,
                "message": "Scale details already exist for this workspace, username, and portfolio and scale type",
            }, status=status.HTTP_400_BAD_REQUEST)
        
        
        scale_data_response = json.loads(datacube_data_retrieval(
            api_key,
            "livinglab_scales",
            "collection_3",
            {
                "workspace_id": workspace_id,
                "settings.username": username,
                "settings.scale_category": type_of_scale
            },
            0,
            0,
            False
        ))
        if not scale_data_response["success"]:
            return Response({
                "success": False,
                "message": "Failed to retrieve scale data",
            }, status=status.HTTP_400_BAD_REQUEST)
        
        scale_details = [{
            "scale_id":scale["_id"],
            "scale_name": scale["settings"].get("scale_name"),
            "scale_type":scale["settings"].get("scale_category"),
            "no_of_channels":scale["settings"].get("no_of_channels"),
            "channel_instance_details": scale["settings"].get("channel_instance_list")
            } for scale in scale_data_response["data"]]
        
        data_for_voc_scale = json.loads(datacube_data_retrieval(
            api_key,
            "voc",
            "voc_llx_scales",
            {},
            0,
            0,
            False
        ))

        if not data_for_voc_scale['success']:
            return Response({
                "success": False,
                "message": "Failed to retrieve scale data for LLx",
            }, status=status.HTTP_400_BAD_REQUEST)

        
        existing_scale_ids = {scale['scale_id'] for scale in data_for_voc_scale.get('data', [])}
        
        
        available_scales = [scale for scale in scale_details if scale['scale_id'] not in existing_scale_ids]


        if not available_scales:
            return Response({
                "success": False,
                "message": "No new scale data available to assign",
            }, status=status.HTTP_400_BAD_REQUEST)

        assigned_scale = available_scales[0]  

        
        links_details = []
        scale_type = assigned_scale.get('scale_type')
        for channel in assigned_scale.get('channel_instance_details', []):
            channel_name = channel.get('channel_name', '') 
            channel_display_name = channel.get('channel_display_name', '')
            for instance in channel.get('instances_details', []):
                instance_name = instance.get('instance_name', '')  
                instance_display_name = instance.get('instance_display_name', '')
                link = (
                    f"https://www.scales.uxlivinglab.online/api/llx/scale/?workspace_id={workspace_id}&username={username}&"
                    f"scale_id={assigned_scale['scale_id']}&scale_type={scale_type}&channel={channel_name}&"
                    f"instance_name={instance_name}&channel_display_name={channel_display_name}&instance_display_name={instance_display_name}"
                )
                qrcode_image = generate_qr_code(url=link, portfolio_name=portfolio_username)
                file_name = generate_file_name(prefix='qrcode', extension='png')
                qrcode_image_url = upload_qr_code_image(qrcode_image, file_name)
                links_details.append({
                    "scale_link": link,
                    "qrcode_image_url": qrcode_image_url
                })
        
        
        report_link = {
            "report_link": f"https://www.scales.uxlivinglab.online/api/llx/report/?workspace_id={workspace_id}&username={username}&scale_id={assigned_scale['scale_id']}",
            "qrcode_image_url": None
        }
        
        
        report_qrcode_image = generate_qr_code(report_link["report_link"],portfolio_name=portfolio_username)
        report_qrcode_file_name = generate_file_name(prefix='report_qrcode', extension='png')
        report_qrcode_image_url = upload_qr_code_image(report_qrcode_image, report_qrcode_file_name)
        report_link["qrcode_image_url"] = report_qrcode_image_url

        login = {
            "login_link": f"https://www.scales.uxlivinglab.online/api/llx/login/?workspace_name={username}",
            "qrcode_image_url": None
        }


        login_qrcode_image = generate_qr_code(url=login["login_link"], portfolio_name=portfolio_username)
        login_qrcode_file_name = generate_file_name(prefix='login_qrcode', extension='png')
        login_qrcode_image_url = upload_qr_code_image(login_qrcode_image, login_qrcode_file_name)
        login["qrcode_image_url"] = login_qrcode_image_url

        
        data_to_be_inserted = {
            "workspace_id": workspace_id,
            "username": username,
            "portfolio": portfolio,
            "scale_id": assigned_scale['scale_id'],
            "type_of_scale": type_of_scale,
            "links_details": links_details,
            "report_link": report_link,
            "login": login,
            "created_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "records": [{"record": "1", "type": "overall"}]
        }

        response = json.loads(datacube_data_insertion(
            api_key,
            "voc",
            "voc_llx_scales",
            data_to_be_inserted
        ))
        
        if not response['success']:
            return Response({
                "success": False,
                "message": "Failed to save scale details"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            "success": True,
            "message": "Scale details saved successfully",
            "response": data_to_be_inserted
        })


    def handle_error(self, request): 
        return Response({
            "success": False,
            "message": "Invalid request type"
        }, status=status.HTTP_400_BAD_REQUEST)
