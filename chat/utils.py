import requests

def get_answer_cognitron_server(access_token,data):
    url = 'https://testcognitron2.azurewebsites.net/cognitron_chat_stream_api'
    headers = {'Authorization': f'Bearer {access_token}', 'X-API_KEY':'39596e8b-6a23-46c6-bc97-a4677847db3d'}
    message = data.get('message')
    data = {'message': message}
    return requests.post(url, headers = headers, data=data)

def set_feedback_cognitron_server(access_token, data):
    url = 'https://testcognitron2.azurewebsites.net/thumbs-up-prompt/'
    headers = {'Authorization': f'Bearer {access_token}', "Content-Type":"application/json"}
    return requests.post(url, headers = headers, json=data)
    
    