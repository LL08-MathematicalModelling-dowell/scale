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

jwt_utils = JWTUtils()

@method_decorator(csrf_exempt, name='dispatch')
class healthCheck(APIView):
    def get(self, request):
        now = datetime.now(timezone.utc).isoformat()
        return Response({
            "success":True,
            "status": "UP",
            "version": "1.2.0",
            "timestamp": now,
            "server_time": now,
            "message":"The API server is healthy"
        }, status=status.HTTP_200_OK)
    
@method_decorator(csrf_exempt, name='dispatch')
class KitchenSinkServices(APIView):
    def post(self, request):
        type_request = request.GET.get('type')

        if type_request == "create_collection":
            return self.create_collection(request)
        else:
            return self.handle_error(request)
        
    def get(self, request): 
        type_request = request.GET.get('type')

        if type_request == "check_scale_data_database_status":
            return self.check_scale_data_database_status(request)
        elif type_request == "check_response_database_status":
            return self.check_response_database_status(request)
        else: 
            return self.handle_error(request)
    
    def set_db_details(self,workspace_id):
        # self.database = f'{workspace_id}_scale_meta_data'
        self.user_info_collection = f'{workspace_id}_user_info'
        self.scale_response_database = f'{workspace_id}_scale_response_data'
        self.scale_data_database = f'{workspace_id}_scale_meta_data'

    def create_collection(self,request):
        
        database_type = request.data.get('database_type')
        workspace_id = request.data.get('workspace_id')
        collection_name = request.data.get('collection_name')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        serializer = CreateCollectionSerializer(data= request.data)

        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        
        self.set_db_details(workspace_id=workspace_id)

        if database_type == "SCALE":
            database_name  =  self.scale_data_database

        elif database_type == "RESPONSE":
            database_name = self.scale_response_database

        response = json.loads(datacube_create_collection(
            api_key,
            database_name,
            collection_name
        ))

        if not response["success"]:
            return CustomResponse(False, "Falied to create collection, kindly contact the administrator.",response, status.HTTP_400_BAD_REQUEST)

        return CustomResponse(True,"Collection has been created successfully", None, status.HTTP_200_OK)


    def check_scale_data_database_status(self, request):   
        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
            
        workspace_id = request.GET.get('workspace_id')

        self.set_db_details(workspace_id=workspace_id)
        
        response_meta_data = json.loads(datacube_collection_retrieval(api_key, self.scale_data_database))
        print(response_meta_data)

        if not response_meta_data["success"]:
            return CustomResponse(False,"Meta Data is not yet available, kindly contact the administrator.", None, status.HTTP_501_NOT_IMPLEMENTED )

        
        list_of_scale_data_collection = [
            f'{workspace_id}_scale_info',
            f'{workspace_id}_user_info',
            f'{workspace_id}_scale_setting'
        ]

        missing_collections = []
        for collection in list_of_scale_data_collection:
            if collection not in response_meta_data["data"][0]:
                missing_collections.append(collection)

        if missing_collections:
            missing_collections_str = ', '.join(missing_collections)
            return CustomResponse(False, f"The following collections are missing: {missing_collections_str}", missing_collections, status.HTTP_404_NOT_FOUND)

        return CustomResponse(True,"Meta Data are available to be used", None, status.HTTP_200_OK )
    
    def check_response_database_status(self, request):
        
        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
            
        workspace_id = request.GET.get('workspace_id')


        self.set_db_details(workspace_id=workspace_id)


        response_data = json.loads(datacube_collection_retrieval(api_key,self.scale_response_database))

        print(response_data)
        if not response_data["success"]:
            return CustomResponse(False,"Database is not yet available, kindly contact the administrator", None, status.HTTP_501_NOT_IMPLEMENTED )

        list_of_data_collection = [f'{workspace_id}_scale_response']

        missing_collections = []
        for collection in list_of_data_collection:
            if collection not in response_data["data"][0]:
                missing_collections.append(collection)

        if missing_collections:
            missing_collections_str = ', '.join(missing_collections)
            return CustomResponse(False, f"The following collections are missing: {missing_collections_str}", missing_collections, status.HTTP_404_NOT_FOUND)

        return CustomResponse(True,"Databases are available to be used", None, status.HTTP_200_OK )
        
    def handle_error(self, request): 
       
        return Response({
            "success": False,
            "message": "Invalid request type"
        }, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class user_details_services(APIView):
    
    def post(self, request):
        type_request = request.GET.get('type')

        if type_request == "save_user_details":
            return self.save_user_details(request)
        elif type_request == "update_user_details":
            return self.update_user_details(request)
        elif type_request == "user_auth":
            return self.user_auth(request)
        else:
            return self.handle_error(request)
        
    def set_db_details(self,workspace_id):
        self.scale_data_database = f'{workspace_id}_scale_meta_data'
        self.user_info_collection = f'{workspace_id}_user_info'


    def get(self, request): 
        type_request = request.GET.get('type')

        if type_request == "retrieve_user_details":
            return self.retrieve_user_details(request)
        if type_request == "retrieve_user":
            return self.retrieve_user(request)
        else: 
            return self.handle_error(request)

    def save_user_details(self, request):
        username = request.data.get('username')
        workspace_id = request.data.get('workspace_id')
        timestamp = request.data.get('timestamp')
        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        serializer = UserDetailsSerializer(data=request.data)

        if not serializer.is_valid():
            return CustomResponse(False, "Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        
        #Set the instance variables based on the workspace ID
        self.set_db_details(workspace_id=workspace_id)

        user_data = {
            "username":username,
            "timestamp":timestamp,
            "isPaid":False,
            "isActive":True,
            "isDatabaseReady":False,
            "isCollectionReady":False
        }

        response = json.loads(datacube_data_insertion(
            api_key,
            self.scale_data_database,
            self.user_info_collection,
            user_data,
        ))

        if not response["success"]:
            return CustomResponse(True,"Failed to save user details", None, status.HTTP_400_BAD_REQUEST)
        
        return CustomResponse(True, "User details saved successfully",user_data, status.HTTP_201_CREATED)

    def retrieve_user_details(self, request):
        
        workspace_id = request.GET.get('workspace_id')
        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
        
        self.set_db_details(workspace_id=workspace_id)

        response = json.loads(datacube_data_retrieval(
            api_key,
            self.database,
            self.user_info_collection,
            {
                "workspace_id":workspace_id
            },
            1,
            0,
            False
        ))

        if not response.get("data"):
            return CustomResponse(False,"User details not found", None,status.HTTP_404_NOT_FOUND)
        
        return CustomResponse(True,"User details retrieved successfully",response["data"], status.HTTP_302_FOUND)
    
    def update_user_details(self, request):
        
        document_id = request.data.get('document_id')
        update_data = request.data.get('update_data')
        workspace_id = request.data.get('workspace_id')

        try:
            api_key = authorization_check(request.headers.get('Authorization'))
        except InvalidTokenException as e:
            return CustomResponse(False, str(e), None, status.HTTP_401_UNAUTHORIZED)
    
        serializer = UpdateUserDetailsSerializer(data=request.data)
        if not serializer.is_valid():
            return CustomResponse(False,"Posting wrong data to API",serializer.errors, status.HTTP_400_BAD_REQUEST)
        
        update_data["updated_at"] = dowell_time(timezone)["current_time"]
        
        self.set_db_details(workspace_id=workspace_id)

        response = json.loads(datacube_data_update(
            api_key,
            self.scale_data_database,
            self.user_info_collection,
            {
                "_id": document_id,
            },
            update_data
        ))

        if not response["success"] :
            return CustomResponse(False, "Failed to update user details", None, status.HTTP_400_BAD_REQUEST)
        
        return CustomResponse(True,"User details updated successfully",None,status.HTTP_200_OK)
    
    
    
    def retrieve_user(self, request):
        
        workspace_id = request.GET.get('workspace_id')

        self.set_db_details(workspace_id=workspace_id)
        
        response = json.loads(datacube_data_retrieval(
            "1b834e07-c68b-4bf6-96dd-ab7cdc62f07f",
            self.scale_data_database,
            self.user_info_collection,
            {
                "workspace_id":workspace_id
            },
            1,
            0,
            False
        ))

        if not response.get("data"):
            return CustomResponse(False,"User details not found", None,status.HTTP_404_NOT_FOUND)
        
        return CustomResponse(True,"User details retrieved successfully",response["data"], status.HTTP_302_FOUND)

    
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

        serializer = ScaleDetailsSerializer(data={
            "workspace_id": workspace_id,
            "portfolio": portfolio
        })
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Invalid data",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        response = json.loads(datacube_data_retrieval(
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



   
class ScaleCreateAPI(APIView):
    def post(self, request, format=None):
        type = request.GET.get("type")
        if type == 'create_scale':
            return self.create_scale(request)
        else:
            return self.handle_error(request)
    
    def get(self, request):
        type = request.GET.get("type")
        if type == 'get_scale':
            return self.get_scale(request)
        elif type == 'create-scale-response':
            return self.create_scale_response(request)
        elif type == 'get-scale-response':
            return self.get_scale_response(request)
        else:
            return self.handle_error(request)

    def create_scale(self,request):     
        scale_serializer = ScaleSerializer(data=request.data)
        if scale_serializer.is_valid():
            workspace_id = scale_serializer.validated_data['workspace_id']
            username = scale_serializer.validated_data['username']
            scale_name = scale_serializer.validated_data['scale_name']
            scale_type = scale_serializer.validated_data['scale_type']
            user_type = scale_serializer.validated_data['user_type']
            no_of_responses = scale_serializer.validated_data['no_of_responses']

            if not "redirect_url" in request.data:
                redirect_url = "https://dowellresearch.sg/"
            else:
                redirect_url = scale_serializer.validated_data['redirect_url']


            channel_instance_list = scale_serializer.validated_data['channel_instance_list']
        
            channel_serializer = ChannelInstanceSerializer(data=channel_instance_list, many=True)
            if channel_serializer.is_valid():
                validated_channel_instance_list = channel_serializer.validated_data

                for channel_instance in validated_channel_instance_list:
                    instance_serializer = InstanceDetailsSerializer(data=channel_instance['instances_details'], many=True)
                    if instance_serializer.is_valid():
                        validated_instance_details = instance_serializer.validated_data


            payload = {"settings":{
            "scale_type": scale_type,
            "channel_instance_list": channel_instance_list
            }
            }
            settings = payload["settings"]
            print(settings)

            if scale_type == "likert":
                pointers = scale_serializer.validated_data.get('pointers')
                if not pointers :
                    return Response("Missing field for likert", status=status.HTTP_400_BAD_REQUEST)

                settings['pointers'] = pointers

            elif scale_type == "stapel":
                axis_limit = scale_serializer.validated_data.get('axis_limit')
                if not axis_limit:
                    return Response("Missing field for stapel", status=status.HTTP_400_BAD_REQUEST)

                settings['axis_limit'] = axis_limit

            total_no_of_items = scale_type_fn(scale_type, payload)
            settings["total_no_of_items"] = total_no_of_items

            scale_range = adjust_scale_range(payload)
            print("Scale range",scale_range)
            payload["scale_range"] = scale_range

            event_id = get_event_id()

            payload = {
                    "workspace_id": workspace_id,
                    "settings": {
                        "scale_name": scale_name,
                        "username": username,
                        "scale_category": scale_type,
                        "user_type": user_type,
                        "total_no_of_items": total_no_of_items,
                        "no_of_channels": len(channel_instance_list),
                        "channel_instance_list":channel_instance_list,
                        "no_of_responses": no_of_responses,
                        "allow_resp": True,
                        "scale_range": list(scale_range),
                        "redirect_url":redirect_url,
                        "pointers": pointers if scale_type == "likert" else None,
                        "axis_limit": axis_limit if scale_type == "stapel" else None,
                        "event_id": event_id
                        }
                    }

            try:
                response = json.loads(datacube_data_insertion(api_key, "livinglab_scales", "collection_3", payload))
                scale_id = response['data'].get("inserted_id")
                payload['settings'].update({"scale_id":scale_id})

                # generate the button urls
                urls = generate_urls(payload)

                # insert urls into the db
                datacube_data_update(api_key, "livinglab_scales", "collection_3", {"_id": scale_id}, {"urls":urls})

                response_data = {
                    "workspace_id": workspace_id,
                    "username": username,
                    "scale_name": scale_name,
                    "scale_category": scale_type,
                    "scale_id": scale_id,
                    "user_type": user_type,
                    "total_no_of_buttons": total_no_of_items,
                    "no_of_responses": no_of_responses,
                    "no_of_channels":len(channel_instance_list),
                    "urls": urls,
                    "redirect_to":redirect_url
                            }
                return Response(response_data, status=status.HTTP_201_CREATED)
            except Exception as e:
                print(e)
                return Response({"message": "Could not process your request. Contact the admin."},status=status.HTTP_400_BAD_REQUEST)
        return Response(scale_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def handle_error(self, request): 
        return Response({
            "success": False,
            "message": "Invalid request type"
        }, status=status.HTTP_400_BAD_REQUEST)



    def get_scale(self,request):
        try:
            print(request.GET)
            if 'scale_id' in request.GET:
                scale_id = request.query_params.get('scale_id')

                response_data = json.loads(datacube_data_retrieval(api_key, "livinglab_scales", "collection_3", {"_id":scale_id}, 10000, 0, False))
                response = response_data['data'][0]
            
                if response:
                    # Extract the relevant information from the response

                    api_response_data = {
                    "scale_id":response["_id"],
                    "scale_name": response["settings"].get("scale_name"),
                    "scale_type":response["settings"].get("scale_category"),
                    "no_of_channels":response["settings"].get("no_of_channels"),
                    "channel_instance_details": response["settings"].get("channel_instance_list")
                    } 

                    return Response(
                        {"success": True, "message": "settings fetched successfully", "scale_data": api_response_data},
                        status=status.HTTP_200_OK)
                else:
                    return Response("Scale not found", status=status.HTTP_404_NOT_FOUND)
                
            elif 'workspace_id' and 'username' and "scale_type" in request.GET:
                workspace_id = request.GET.get('workspace_id')
                username = request.GET.get('username')
                scale_type = request.GET.get('scale_type')

                response_data = json.loads(datacube_data_retrieval(api_key, "livinglab_scales", "collection_3", {"workspace_id":workspace_id,"settings.username": username,"settings.scale_category":scale_type}, 10000, 0, False))
                
                response = response_data['data']
                
                scale_details = [{
                    "scale_id":scale["_id"],
                    "scale_name": scale["settings"].get("scale_name"),
                    "scale_type":scale["settings"].get("scale_category"),
                    "no_of_channels":scale["settings"].get("no_of_channels"),
                    "channel_instance_details": scale["settings"].get("channel_instance_list")
                    } for scale in response]
                
                return Response(
                    {"success": True, "message": "settings fetched successfully","total_scales":len(response), "scale_data": scale_details},
                    status=status.HTTP_200_OK)
        
            elif 'workspace_id' in request.GET:
                workspace_id = request.GET.get('workspace_id')

                response_data = json.loads(datacube_data_retrieval(api_key, "livinglab_scales", "collection_3", {"workspace_id":workspace_id}, 10000, 0, False))
            
                if response_data['data']:
                    response = response_data['data'][0]
                    print(response)
                    settings = response["settings"]
                    
                    return Response(
                        {"success": True, "message": "settings fetched successfully", "total":len(response),"scale_data": response_data['data']},
                        status=status.HTTP_200_OK)
                else:
                    return Response("No scales found in the requested workspace", status=status.HTTP_404_NOT_FOUND)
            else:
                return Response("scale_id or workspace_id required", status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(e)
            return Response(f"Unexpected error occured while fetching your data", status=status.HTTP_400_BAD_REQUEST)
        

    def create_scale_response(self,request):
        scale_id = request.GET.get('scale_id')
        item = int(request.GET.get('item'))
        workspace_id = request.GET.get('workspace_id')
        username = request.GET.get('username')
        user_type = request.GET.get('user_type')
        scale_type = request.GET.get('scale_type')
        channel_name = request.GET.get('channel_name')
        instance_name = request.GET.get('instance_name')
        header = dict(request.headers)


        try:
            # Category determination
            category = determine_category(scale_type, item)

            if category is None:
                return Response({"success": "false", "message": "Invalid value for score"}, status=status.HTTP_400_BAD_REQUEST)

            # Fetch the relevant settings meta data
            settings_meta_data = json.loads(datacube_data_retrieval(api_key, "livinglab_scales", "collection_3", {"_id": scale_id}, 10000, 0, False))
            data = settings_meta_data['data'][0]['settings']

            no_of_responses = data["no_of_responses"]
            channel_instance_list = data["channel_instance_list"]
            # redirect_url = data["redirect_url"]

            for data in channel_instance_list:
                if channel_name == data["channel_name"]:
                    for instance in data["instances_details"]:
                        if instance_name == instance["instance_name"]:
                            channel_display_names = [data["channel_display_name"]]
                            instance_display_names = [instance["instance_display_name"]]
                            break

            if not channel_display_names or not instance_display_names:
                return Response({"success": "false", "message": "Channel or Instance not found"}, status=status.HTTP_404_NOT_FOUND)

            # Response submission logic
            fields = {"scale_id": scale_id, "channel_name": channel_name, "instance_name": instance_name}
            response_data = json.loads(datacube_data_retrieval(api_key, "livinglab_scale_response", "collection_1", fields, 10000, 0, False))

            current_response_count = len(response_data['data']) + 1 if response_data['data'] else 1

            if current_response_count <= no_of_responses:
                event_id = get_event_id()
                created_time = dowell_time("Asia/Calcutta")

                learning_index_data = ""
                if scale_type == 'learning_index':
                    learner_category = {
                        "reading": 0,
                        "understanding": 0,
                        "explaining": 0,
                        "evaluating": 0,
                        "applying": 0
                    } if current_response_count == 1 else response_data['data'][-1].get("learning_index_data", {}).get("learning_level_count", {})

                    percentages, LLx, learning_stage, learner_category_cal = calcualte_learning_index(item, current_response_count, learner_category, category)
                    learning_index_data = {
                        "control_group_size": current_response_count,
                        "learning_level_count": learner_category_cal,
                        "learning_level_percentages": percentages,
                        "learning_level_index": LLx,
                        "learning_stage": learning_stage
                    }

                existing_data = {
                    "workspace_id": workspace_id,
                    "username": username,
                    "scale_id": scale_id,
                    "score": item,
                    "category": category,
                    "user_type": user_type,
                    "user_info": header,
                    "event_id": event_id,
                    "dowell_time": created_time,
                    "current_response_count": current_response_count,
                    "channel_name": channel_name,
                    "channel_display_name": channel_display_names[0],
                    "instance_name": instance_name,
                    "instance_display_name": instance_display_names[0],
                    "learning_index_data": learning_index_data
                }

                # Insertion into the DB
                responses = json.loads(datacube_data_insertion(api_key, "livinglab_scale_response", "collection_1", existing_data))
                response_id = responses['data']['inserted_id']

                if not user_type == "True":
                    return Response({
                        "success": responses['success'],
                        "message": "Response recorded successfully",
                        "response_id": response_id,
                        "score": item,
                        "category": category,
                        "channel": channel_name,
                        "channel_display_name": channel_display_names[0],
                        "instance_name": instance_name,
                        "instance_display_name": instance_display_names[0],
                        "current_response_no": current_response_count,
                        "no_of_available_responses": no_of_responses - current_response_count,
                        "time_stamp": created_time["current_time"]
                    })

                product_url = "https://www.uxlive.me/dowellscale/npslitescale"
                # generated_url = f"{product_url}/?workspace_id={workspace_id}&scale_type={scale_type}&score={item}&channel={channel_name}&instance={instance_name}&redirect_to={redirect_url}"
                generated_url = f"{product_url}/?workspace_id={workspace_id}&scale_type={scale_type}&score={item}&channel={channel_name}&instance={instance_name}"
                return redirect(generated_url)
            else:
                return Response({"success": False, "message": "All instances for this scale have been consumed. Create a new scale to continue"}, status=status.HTTP_200_OK)

        except Exception as e:
            print("response", e)
            return Response({"Resource not found! Contact the admin"}, status=status.HTTP_404_NOT_FOUND)


    def get_scale_response(self,request):
         
        scale_id = request.GET.get('scale_id')
        channel = request.GET.get('channel_name')
        instance = request.GET.get('instance_name')

        returned_items = []
        try:
            fields = {"scale_id":scale_id, "channel_name":channel,"instance_name":instance}
            response_data = json.loads(datacube_data_retrieval(api_key, "livinglab_scale_response", "collection_1", fields, 10000, 0, False))
            data = response_data['data']

            if not data:
                return Response({"success":"true",
                                    "message":"No responses found",
                                    "total_no_of_responses": 0
                                }, status=status.HTTP_404_NOT_FOUND)
            for valid_data in data:
                return_data={
                    "_id": valid_data["_id"],
                    "scale_id":valid_data["scale_id"],
                    "category":valid_data["category"],
                    "score":valid_data["score"],
                    "channel_name":valid_data["channel_name"],
                    "instance_name":valid_data["instance_name"],
                    "channel_display_name":valid_data["channel_display_name"],
                    "instance_display_name":valid_data["instance_display_name"],
                    "dowell_time":valid_data["dowell_time"]

                }

                returned_items.append(return_data)
           
            return Response({"success":"true",
                                    "message":"fetched the data for the requested channel, scale_name & instance_name",
                                    "total_no_of_responses": len(returned_items),
                                    "data": returned_items
                                    }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(e)

