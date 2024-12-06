import json
import requests

# api_key = "1b834e07-c68b-4bf6-96dd-ab7cdc62f07f"
base_url = "https://datacube.uxlivinglab.online"

# ------------ CRUD OPERATIONS ------------

def db_insert_data(database_name, collection_name, data):
    global base_url
    url = f"{base_url}/api/crud/"
    payload = {
        "db_name": database_name,
        "coll_name": collection_name,
        "operation": "insert",
        "data": data
    }

    response = requests.post(url, json=payload)
    print(response.text)
    return response.text

def db_retreive_data(database_name, collection_name, data, limit, offset, payment):
    global base_url
    url = f"{base_url}/api/crud"
    payload = {
        "db_name": database_name,
        "coll_name": collection_name,
        "operation": "fetch",
        "filters": data,
        "limit": limit,
        "offset": offset
    }

    response = requests.get(url, json=payload)
    return response.text

def db_update_data(api_key, db_name, coll_name, query, update_data):
    global base_url
    url = f"{base_url}/api/crud/"

    payload = {
        "db_name": db_name,
        "coll_name": coll_name,
        "operation": "update",
        "query": query,
        "update_data": update_data
    }

    response = requests.put(url, json=payload)
    return response.text

def db_delete_data(db_name, collection_name, query):
    global base_url
    url = f"{base_url}/api/crud/"

    payload = {
        "db_name": db_name,
        "coll_name": collection_name,
        "operation": "delete",
        "query": query
    }
    response = requests.delete(url, json=payload)
    return response.text


# CREATE NEW DATABASE
def db_create_database(database_name, num_of_collections, collection_names, num_of_fields, field_labels):
    global base_url
    url = f"{base_url}/api/create_database/"
    
    payload = {
        "db_name": "new_database",
        "num_collections": 5,
        "coll_names": ["collection1", "collection2"],
        "num_documents": 100,
        "num_fields": 10,
        "field_labels": ["label1", "label2"]
    }

    response = requests.post(url, json=payload)
    return response.text


# ADD A NEW COLLECTION TO A DATABASE
def db_create_collection(db_name, collection_name):
    global base_url
    url = f"{base_url}/api/add_collection/"

    payload = {
        "db_name": db_name,
        "coll_names": collection_name,
        "num_collections": 1
    }

    response = requests.post(url, json=payload)
    return response.text


def db_retreive_collections(db_name):
    global base_url
    url = f"{base_url}/api/list_collections/"
    
    payload = {
        "db_name": db_name
    }
    
    response = requests.get(url, json=payload)
    return response.text


