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


def get_portfolio_details(workspace_name, portfolio_id):
    url = 'https://100093.pythonanywhere.com/api/portfoliodetails'
    payload = {
        'workspace_name': workspace_name,
        'portfolio_id': portfolio_id
    }
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status() 
        return {
            "success": True,
            "message": "Portfolio details retrieved successfully",
            "response": response.json()["response"]
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

def save_location_data(workspaceId,latitude,longitude,userId,event):
    url = "https://www.scales.uxlivinglab.online/services/v1/location-services/save-location"
    
    payload = {
        "workspaceId": workspaceId,
        "latitude": latitude,
        "longitude": longitude,
        "event":event,
        "userId": userId
    }
    
    response = requests.post(url, json=payload)

    print(response.text)
    
    return response.text

