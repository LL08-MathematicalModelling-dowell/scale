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

jwt_utils = JWTUtils()

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

        data = client_admin_login_response.get("response", {})
        user_info = {
            "workspace_name": workspace_name,
            "portfolio": portfolio
        }

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

        serializer = EmailSerializer(data={
            "email": email,
            "user_id": user_id
        })

        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Posting wrong data to API",
                "errors": serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # TODO: Replace this when required
        workspace_name = "manish_test_error_login"

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
            login_link="https://www.scales.uxlivinglab.online/voc/"
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
