from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout,logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from . utils import request_access_token, verify_access_token


def signup_view(request):
    """
    signup_view  to register user data 
    - username
    - password
    and store in db and redirect to chate page.
    """
    if request.user.is_authenticated:
        return redirect('/chat/home')
    
    if request.method == 'POST':

        form = UserCreationForm(request.POST)

        if form.is_valid():

            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password1')
            response = request_access_token(username)
            if response.status_code == 200:
                form.save()
                user = authenticate(request, username=username, password=password)
                login(request, user)
                request.session['access_token'] = response.json()['access']
                request.session['refresh_token'] = response.json()['refresh']
                return redirect('/chat/home')
            else:
                return render(request, 'user/register.html', {'auth_problem': "Problem in authentiction on server."})

        else:
            return render(request, 'user/register.html', {'form': form})
    
    else:
        form = UserCreationForm()
        return render(request, 'user/register.html', {'form': form})

def signin_view(request):
    """
    signin_view to authenticate user data 
    - username
    - password
    and redirect to chat page.
    """
    access_token = request.session.get('access_token', None)   
            
    if request.user.is_authenticated and access_token != None:
        response = verify_access_token(access_token)
        if response.status_code == 200:
            return redirect('/chat/home')
        else:
            form = AuthenticationForm()
            logout(request)
            return render(request, 'user/login.html', {'form': form})
    
    if request.method == 'POST':
        form = AuthenticationForm(request=request, data=request.POST)
        if form.is_valid():
            if access_token == None:
                response = request_access_token(request.POST.get('username'))
                if response.status_code == 200:
                    request.session['access_token'] = response.json()['access']
                    request.session['refresh_token'] = response.json()['refresh']
                    user = form.get_user()
                    login(request, user)
                    return redirect('/chat/home')
    else:
        form = AuthenticationForm()
    return render(request, 'user/login.html', {'form': form})

def signout_view(request):
    """
    signout_view to logout authenticated.
    """
    logout(request)
    return redirect('/login')