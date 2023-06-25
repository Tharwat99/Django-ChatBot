import requests

def request_access_token(username):
    """
    method to request access token for user.
    """
    url = 'https://testcognitron2.azurewebsites.net/api/token/'
    headers = {
    'X-API_KEY':'39596e8b-6a23-46c6-bc97-a4677847db3d',
    }
    data = {
    "user_id": username,
    "bot_id": "fb95c125-67a6-4c21-8c96-a6146fe69b07"
    }
    response = requests.post(url, headers = headers, data=data)
    return response

def verify_access_token(token):
    """

    """
    url = 'https://testcognitron2.azurewebsites.net/api/token/verify/'
    data ={
        "token": token
    }
    response = requests.post(url, data=data)
    return response
            