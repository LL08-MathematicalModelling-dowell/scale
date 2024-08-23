import jwt
import os
from datetime import datetime, timedelta
from typing import Dict, Optional
from functools import wraps
from django.http import JsonResponse
import requests
import time
import qrcode
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from itertools import chain
import json
from functools import partial
from core.settings import public_url
import pytz
from rest_framework.response import Response



auth_jwt_config = {
    'JWT_SECRET_KEY': os.getenv("JWT_SECRET_KEY", "voc"),
    'JWT_ALGORITHM': os.getenv("JWT_ALGORITHM", "HS256"),
    'JWT_ALLOW_REFRESH': True,
    'JWT_EXPIRATION_DELTA': timedelta(days=2),
    'JWT_REFRESH_EXPIRATION_DELTA': timedelta(days=7),
}

class JWTUtils:
    def __init__(self):
        self.secret_key = auth_jwt_config['JWT_SECRET_KEY']
        self.algorithm = auth_jwt_config['JWT_ALGORITHM']
        self.expiry_delta = auth_jwt_config['JWT_EXPIRATION_DELTA']
        self.refresh_expiry_delta = auth_jwt_config['JWT_REFRESH_EXPIRATION_DELTA']

    def generate_jwt_tokens(self, data: Dict[str, any]) -> Dict[str, str]:
        
        access_payload = {
            '_id': data["_id"],
            'workspace_id': data["workspace_id"],
            'portfolio': data["portfolio"],
            'email': data["email"],
            'profile_image': data["profile_image"],
            'workspace_owner_name': data["workspace_owner_name"],
            'portfolio_username': data["portfolio_username"],
            'member_type': data["member_type"],
            'data_type': data["data_type"],
            'operations_right': data["operations_right"],
            'status': data["status"],
            'exp': datetime.utcnow() + self.expiry_delta
        }
        access_token = jwt.encode(access_payload, self.secret_key, algorithm=self.algorithm)

        refresh_payload = {
            '_id': data["_id"],
            'workspace_id': data["workspace_id"],
            'portfolio': data["portfolio"],
            'email': data["email"],
            'profile_image': data["profile_image"],
            'workspace_owner_name': data["workspace_owner_name"],
            'portfolio_username': data["portfolio_username"],
            'member_type': data["member_type"],
            'data_type': data["data_type"],
            'operations_right': data["operations_right"],
            'status': data["status"],
            'exp': datetime.utcnow() + self.refresh_expiry_delta
        }
        refresh_token = jwt.encode(refresh_payload, self.secret_key, algorithm=self.algorithm)

        return {
            'access_token': access_token,
            'refresh_token': refresh_token
        }

    def decode_jwt_token(self, token: str) -> Optional[Dict[str, any]]:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

def login_required(view_func):
    @wraps(view_func)
    def _wrapped_view(view, request, *args, **kwargs):
        token = request.COOKIES.get('access_token') or request.headers.get('Authorization', '').replace('Bearer ', '')

        if not token:
            return JsonResponse({
                "success": False,
                "message": "Please login to access the resource"
            }, status=401)

        try:
            decoded_jwt_payload = jwt.decode(token, auth_jwt_config["JWT_SECRET_KEY"], algorithms=[auth_jwt_config["JWT_ALGORITHM"]])
            print(decoded_jwt_payload)

            if not decoded_jwt_payload["_id"]:
                return JsonResponse({
                    "success": False,
                    "message": "User not found"
                }, status=401)
            return view_func(view, request, *args, **kwargs)
        except jwt.ExpiredSignatureError:
            return JsonResponse({
                "success": False,
                "message": "Token has expired"
            }, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({
                "success": False,
                "message": "Invalid token"
            }, status=401)

    return _wrapped_view

def scale_data(worksapce_id,username,scale_type="nps"):
    resonse = requests.get(
        f"https://100035.pythonanywhere.com/addons/create-scale/v3/?workspace_id={worksapce_id}&username={username}&scale_type={scale_type}"
    )

    if resonse.status_code == 200:
        return {
            "success": True,
            "message": "Scale data was successfully retrieved",
            "response": resonse.json()["scale_data"]
        }
    else:
        return {
            "success": False, 
            "message": "Failed to fetch scale data"
        }
def generate_file_name(prefix='qrcode', extension='png'):
    timestamp = int(time.time() * 1000)
    filename = f'{prefix}_{timestamp}.{extension}'
    return filename


def generate_qr_code(url, portfolio_name):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )

    qr.add_data(url)
    qr.make(fit=True)
    
    img = qr.make_image(fill='black', back_color='white').convert('RGB')
    
    draw = ImageDraw.Draw(img)

    try:
        font = ImageFont.truetype('/usr/share/fonts/ttf/dejavu/DejaVuSans-Bold.ttf', 24)
    except IOError:
        font = ImageFont.load_default()

    def draw_bottom_centered_text(draw, text, font, img, additional_offset=10):
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        width, height = img.size
        
        x = (width - text_width) / 2
        y = height - text_height - 20 + additional_offset  # Add additional offset below the text
        
        draw.text((x, y), text, font=font, fill='black')

    draw_bottom_centered_text(draw, portfolio_name, font, img)

    return img


def upload_qr_code_image(img, file_name):
    url = 'https://dowellfileuploader.uxlivinglab.online/uploadfiles/upload-qrcode-to-drive/'
    with BytesIO() as buffer:
        img.save(buffer, format='PNG')
        buffer.seek(0)
        files = {
            'file': (file_name, buffer, 'image/png')
        }
        try:
            response = requests.post(url, files=files)
            response.raise_for_status()  # Raises an HTTPError for bad responses
            file_url = response.json().get('file_url')
            return file_url
        except requests.exceptions.HTTPError as http_err:
            print(f'Server responded with non-success status: {http_err.response.status_code}')
        except requests.exceptions.RequestException as req_err:
            print(f'Error making request: {req_err}')
        except Exception as err:
            print(f'Unexpected error: {err}')
        return None
    

def dowell_login(workspace_name, username, password):
    url = 'https://100093.pythonanywhere.com/api/portfoliologin'
    payload = {
        'portfolio': username,
        'password': password,
        'workspace_name': workspace_name,
        "username": "false",
    }
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return {
            "success": True,
            "message": "Login successful",
            "response": response.json()
        }
    except requests.exceptions.HTTPError as http_err:
        return {
            "success": False,
            "message": f"Server responded with status code {response.status_code}: {http_err}"
        }
    except requests.exceptions.RequestException as req_err:
        return {
            "success": False,
            "message": f"Request failed: {req_err}"
        }
    except ValueError as json_err:
        return {
            "success": False,
            "message": f"Error parsing JSON response: {json_err}"
        }


def build_urls(channel_instance,payload,instance_idx):
        urls = []
        print(payload)
        settings = payload["settings"]
        scale_range = settings["scale_range"]
        
        for idx in scale_range:
            url = f"{public_url}/addons/create-response/v3/?user={settings['user_type']}&scale_type={settings['scale_category']}&channel={channel_instance['channel_name']}&instance={channel_instance['instances_details'][instance_idx]['instance_name']}&workspace_id={payload['workspace_id']}&username={settings['username']}&scale_id={settings['scale_id']}&item={idx}"
            # url = f"http://127.0.0.1:8000/addons/create-response/v3/?user={settings['user_type']}&scale_type={settings['scale_category']}&channel={channel_instance['channel_name']}&instance={channel_instance['instances_details'][instance_idx]['instance_name']}&workspace_id={payload['workspace_id']}&username={settings['username']}&scale_id={settings['scale_id']}&item={idx}"
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


def adjust_scale_range(payload):
    print("Inside adjust_scale_range function")
    settings = payload["settings"]
    scale_type = settings['scale_type']
    print(scale_type)
    print(f"Scale type: {scale_type}")
    
    total_no_of_items = int(settings['total_no_of_items'])
    print(f"Total number of items: {total_no_of_items}")
    print("++++++++++++++")
    if "pointers" in payload:
        pointers = payload['pointers']
    if "axis_limit" in payload:
        axis_limit = payload['axis_limit']
    print(f"Scale type: {scale_type}, Total number of items: {total_no_of_items}")

    if scale_type == 'nps' or scale_type == 'learning_index':
        scale_range = range(0, 11)
        print(scale_range)
        return scale_range

    elif scale_type == 'nps_lite':
        return range(0, 3)
    elif scale_type == 'stapel':
        if 'axis_limit' in payload:
            pointers = int(payload['axis_limit'])
            return chain(range(-axis_limit, 0), range(1, axis_limit + 1))
    elif scale_type == 'likert':
        if 'pointers' in payload:
            pointers = int(payload['pointers'])
            return range(1, pointers + 1)
        else:
            raise ValueError("Number of pointers not specified for Likert scale")
    else:
        raise ValueError("Unsupported scale type")
    

def calcualte_learning_index(score, group_size, learner_category, category):
    print(score,group_size,learner_category)    



def dowell_time(timezone):
    url = "https://100009.pythonanywhere.com/dowellclock/"
    payload = json.dumps({
        "timezone":timezone,
        })
    headers = {
        'Content-Type': 'application/json'
        }

    response = requests.request("POST", url, headers=headers, data=payload)

    if response.status_code != 200:
        res= json.loads(response.text)

    else:
        timezone = pytz.timezone('Asia/Calcutta')

        current_time = datetime.now(timezone)
        
        res = {"current_time" : current_time.strftime("%Y-%m-%d %H:%M:%S")}


    return res


dowell_time_asian_culta = partial(dowell_time , "Asia/Calcutta")



def determine_category(scale_type, item):
    index = {0:"detractor",1:"passive",2:"promoter"}
    if scale_type == "nps_lite":
        return index[item]
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


class InvalidTokenException(Exception):
    pass

def authorization_check(api_key):
    """
    Checks the validity of the API key.

    :param api_key: The API key to be validated.
    :return: The extracted token if the API key is valid.
    :raises InvalidTokenException: If the API key is missing, invalid, or has an incorrect format.
    """
    if not api_key or not api_key.startswith('Bearer '):
        
        raise InvalidTokenException("Bearer token is missing or invalid")
    try:
        _, token = api_key.split(' ')
    except ValueError:
        raise InvalidTokenException("Invalid Authorization header format")
    
    return token

def CustomResponse(success=True, message=None, response=None, status_code=None):
    """
    Create a custom response.
    :param success: Whether the operation was successful or not.
    :param message: Any message associated with the response.
    :param data: Data to be included in the response.
    :param status_code: HTTP status code for the response.
    :return: Response object.
    """
    response_data = {"success": success}
    if message is not None:
        response_data["message"] = message
    if response is not None:
        response_data["response"] = response

    return Response(response_data, status=status_code) if status_code else Response(response_data)