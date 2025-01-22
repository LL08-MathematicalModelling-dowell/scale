import requests

def targeted_population(database_name, collection_name, fields, column_name,period):
    url = "https://100032.pythonanywhere.com/api/targeted_population/"
    payload = {
    "database_details": {
        "database_name": "datacube",
        "collection": collection_name,
        "database": database_name,
        "fields": fields
    },
    "distribution_input": {
        "normal": 1,
        "poisson": 1,
        "binomial": 0,
        "bernoulli": 0
    },
    "number_of_variable": 1,
    "stages": [
    ],
    "time_input": {
        "column_name": column_name,
        "split": "week",
        "period": period
    }
}
    
    response = requests.post(url, json=payload)
    return response.json()