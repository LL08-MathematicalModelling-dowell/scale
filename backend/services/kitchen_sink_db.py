import requests


def kitchen_sink_create_collection(api_key,database_type, workspace_id,collection_name):
    """
    creates a collection in the kitchen sink database

    :api_key: api key for authentication
    :param database_type: The specified database type
    :param workspace_id: The workspace ID
    :param collection_name: The  collection name
            
    """

    url = ""

    headers = {
        "Authorization":api_key
    }

    payload  = {
        "database_type":database_type,
        "workspace_id":workspace_id,
        "collection_name":collection_name
    }
    response = requests.post(url=url,json=payload,headers=headers)
    return response.text


def kitchen_sink_check_db_status(api_key,workspace_id,date):
    """
    checks the status of the database
    
    :param api_key: api_key is required for authentication
    :param workspace_id: The workspace ID
    :param date: The date
    """

    url = ""

    headers = {
        "Authorization": api_key
    }
    payload = {
        "workspace_id":workspace_id,
        "date":date
    }

    response = requests.get(url=url, headers=headers,params=payload)
    return response.text


def kitchen_sink_check_metadata_status(api_key,workspace_id):
    """
    checks the status of the metadata
    
    :param api_key: api_key is required for authentication
    :param workspace_id: The workspace ID
    """

    url = ""

    headers = {
        "Authorization": api_key
    }
    payload = {
        "workspace_id":workspace_id,
    }

    response = requests.get(url=url, headers=headers,params=payload)
    return response.text

