from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.http import StreamingHttpResponse
from django.shortcuts import redirect
import json
from . utils import get_answer_cognitron_server, set_feedback_cognitron_server

@login_required
def chat_view(request):
    """
    chat_view to render to chat home page.
    """
    return render(request, 'chat/home.html')

def remote_data_view(request):
    """
    remote_data_view to request answer from cognitron_server endpoint
    """
    data = json.loads(request.body)
    response = get_answer_cognitron_server(request.session['access_token'], data)
    
    # Set the response headers to indicate that the response will be streamed
    content_type = response.headers.get('content-type', 'application/octet-stream')
    response_headers = {
        'Content-Type': content_type,
    }
    # Define a generator function that yields chunks of data from the remote server
    def generate_chunks():
        for chunk in response.iter_content(chunk_size=50):
            yield chunk

    # Return a StreamingHttpResponse object that streams the data to the client in chunks
    return StreamingHttpResponse(generate_chunks(), headers=response_headers)

def remote_feedback_view(request):
    """
    remote_feedback_view to sent feedback for each answer by prompt id.
    """
    data = json.loads(request.body)
    response = set_feedback_cognitron_server(request.session['access_token'], data)
    print(response.text)
    return redirect('/chat/home')