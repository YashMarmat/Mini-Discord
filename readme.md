# Mini Discord
A mini discord application where users can join or create chat rooms to communicate. Developed with Django 4.1 and Django Channels.

<p id ="top" align="center">
  <img width="960" alt="homepage" src="https://user-images.githubusercontent.com/59337853/210165087-b135a862-da10-4123-8d7d-d20668a3ca97.png">  
</p>

# Table of contents
- [Technologies_and_Tech_stack_involved](#Technologies_and_Tech_stack_involved)
  * [Chat_room](#Chat_room)
  * [Conversation_room](#Conversation_room)
  * [Multi_users](#Multi_users)
  * [Login_Page](#Login_Page)
  * [Sign_up_page](#Sign_up_page)
- [Installation](#Installation)
  * [application_setup](#application_setup)
- [Project_Documentation](#Project_Documentation)
  * [Setup](#Setup)
  * [Models](#Models)
  * [chat_app_Views](#chat_app_Views)
  * [chat_app_Urls](#chat_app_Urls)
  * [useraccount_app_Views](#useraccount_app_Views)
  * [useraccount_app_Urls](#useraccount_app_Urls)
  * [Project_Level_Urls](#Project_Level_Urls)
  * [Templates](#Templates)
  * [Static_Files](#Static_Files)
  * [ASGI](#ASGI)
  * [Websockets_Routes](#Websockets_Routes)
  * [Consumers](#Consumers)
  * [Channel_Layers](#Channel_Layers)
  * [Remaining_Methods](#Remaining_Methods)
  * [Run_server](#Run_server)
- [Helpful_Links_on_Django_Channels](#Helpful_Links_on_Django_Channels)

## Technologies_and_Tech_stack_involved
- Python
- Django (4.1)
- Django Channels
- light weight sqlite database

### Chat_room
Here users can create or join an existing chat room.
<p align="center">
  <img width="960" alt="chat room" src="https://user-images.githubusercontent.com/59337853/210165259-3cbcec26-3810-4f98-87c9-f37247996ca2.png">
</p>

### Conversation_room
The page displays the number of people present in the room, as well as the conversation. 
<p align="center">
  <img width="960" alt="conversation" src="https://user-images.githubusercontent.com/59337853/210165314-24e8fb32-adbd-466b-b42c-e73cace5dec6.png">
</p>

### Multi_users
Multiple users can join the room once logged in.
<p align="center">
  <img width="960" alt="multi users" src="https://user-images.githubusercontent.com/59337853/210165332-3b346000-8124-456c-a6db-6a50e356fa01.png">
</p>

### Login_Page
<p align="center">
  <img width="958" alt="login" src="https://user-images.githubusercontent.com/59337853/210165347-cce761c7-a867-42a0-b6d8-f9fee7c30a54.png">
</p>

### Sign_up_page
<p align="center">
  <img width="960" alt="sign up" src="https://user-images.githubusercontent.com/59337853/210165353-00f21a00-b6ab-4c3b-af10-53e9c9b4a535.png">
</p>

## Installation
after downloading/cloning the repository code, follow below steps:

### application_setup

- create your virtual environment
`python -m venv myenv` 

- activate your virtual environment
`myenv\scripts\activate`

- install project dependencies
`pip install -U channels["daphne"] django crispy_bootstrap5`

- make your first migration
`python manage.py makemigrations`

- migrate your changes
`python manage.py migrate`

- run the server
`python manage.py runserver`

### All set :)

## Project_Documentation

Here we will build the mini discord application step by step. I tried to explain every single step in as simplest way possible to keep it simple for beginners as well. So, let's gets started :)

## Setup

* Note: you can keep your project anywhere you like. 

* Let's open the terminal and create a project folder called "chat_app" and setup application.

`mkdir chat_app`

`cd chat_app`

`python -m venv myenv` (for linux => python3 -m venv myenv)

`myenv\scripts\activate` (for linux => source myenv/bin/activate)

`pip install django`

`pip install -U channels["daphne"]` (for django channels to work)

`pip install crispy_bootstrap5` (enhanced bootstrap forms)

`django-admin startproject mysite .`

* Create two django applications namely "chat" and "accounts"

`python manage.py startapp chat` (will work on the conversation related logic)

`python manage.py startapp useraccount` (will work on sign up related logic)

* Let's update INSTALLED_APPS section in settings.py file, so that django can know about these changes.

	   INSTALLED_APPS = [

      'daphne',  # our django channels application
      'crispy_forms', # to enhance login and signup forms UI
      'crispy_bootstrap5', # more settings at the end of this file

      # my apps
      'chat',
      'useraccount',

      'django.contrib.admin',
      'django.contrib.auth',
      'django.contrib.contenttypes',
      'django.contrib.sessions',
      'django.contrib.messages',
      'django.contrib.staticfiles',
	    ]

* Description

The crispy_form and crispy_bootstrap5 basically enhanced the UI of our regular HTML forms like login and signup.
At the end of the settings.py we need to put few more things like static files management, login/logout redirects
and few bootstrap settings, as mentioned below (just compare and paste it at end of our file).

    STATIC_URL = 'static/'

    STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]

    # Default primary key field type
    # https://docs.djangoproject.com/en/4.1/ref/settings/#default-auto-field

    DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

    CRISPY_ALLOWED_TEMPLATE_PACKS = "bootstrap5"

    CRISPY_TEMPLATE_PACK = "bootstrap5"

    LOGIN_REDIRECT_URL = 'home'

    LOGOUT_REDIRECT_URL = 'home'


* and directory updates for our templates (in settings.py)

      TEMPLATES = [
          {
              'BACKEND': 'django.template.backends.django.DjangoTemplates',
              'DIRS': [os.path.join(BASE_DIR, 'templates')],                  # changes here
              'APP_DIRS': True,
              'OPTIONS': {
                  'context_processors': [
                      'django.template.context_processors.debug',
                      'django.template.context_processors.request',
                      'django.contrib.auth.context_processors.auth',
                      'django.contrib.messages.context_processors.messages',
                  ],
              },
          },
      ]

* Now, Place two folders at the root level of your project namely "templates" and "static".

### Models

* In this application we will keep a record or two things: Rooms and Message.

* Room_Model (here: chat/models.py)

      from django.contrib.auth.models import User
      from django.db import models

      class Room(models.Model):
          name = models.CharField(max_length=200)
          online = models.ManyToManyField(to=User, blank=True)

          def get_online_count(self):
              return self.online.count()

          def __str__(self):
              return f'{self.name} (Online: {self.get_online_count()})'


* Rooms will contain the record of all the available rooms created by the logged users or admin. It contains
two fields; "name" which holds the name of the room and "online" which will contain the list of users who
are present or online in the room as its going to multiple user thats why i have used a many to many model relationship, 
we will add the users in this field by using the .add function through our views (more on this shortly).

* It contains two seperate methods which provides an online count of users and another one display the name for the room object,
we basically using these methods for our django admin page only.


* Message_Model (here: chat/models.py)

      class Message(models.Model):
          user = models.ForeignKey(to=User, on_delete=models.CASCADE)
          room = models.ForeignKey(to=Room, on_delete=models.CASCADE)
          content = models.CharField(max_length=512)
          timestamp = models.DateTimeField(auto_now_add=True)

          def __str__(self):
              return f'{self.user.username} | {self.content} [{self.timestamp}]'

* The message model contains four fields which basically holds the name of the user who sent the message, the room for which the message was intended, the
content or body of the message and the timestamp which records at what time the message was sent. Lastly, a method for representing our message model object.

* Now, that we have created our models lets run our migrations in order to create the DB tables.

`python manage.py makemigrations chat`

`python manage.py migrate`

### chat_app_Views

* Lets' create our views and templates now. (inside chat application)
* here => Chat/views.py

      from django.shortcuts import render
      from django.core.exceptions import PermissionDenied
      from .models import Room, Message

      # the main application homepage
      def home_page(request):
          return render(request, 'homepage.html')

      # serves the chat room page
      def index(request):
          return render(request, "index.html", context={"rooms": Room.objects.all()})

      # the conversation room
      def room(request, room_name):
          # print("\nchecking =>", request.user.is_authenticated)
          if request.user.is_authenticated:
              chat_room, created = Room.objects.get_or_create(name=room_name)
              earlier_room_messages = Message.objects.filter(room=chat_room.id)
              # print("\nearlier_room_messages ==>", earlier_room_messages)

              return render(
                  request,
                  "room.html",
                  {"room_name": room_name, "earlier_room_messages": earlier_room_messages}
              )
          else:
              raise PermissionDenied


* The index view function basically renders the index.html and displays the list of room names available to join, which we are
passing through a context dictionary by making a query to the DB of Room.objects.all() => returns all of the room objects.

* The room view function allows access to only logged in users otherwise a permission denied exception will get raised. The function
basically creates or locates the room object whose name is given by the user, once the room is located we pass the information of room 
name and all the earlier room messages made by users so far to the room.html template to display.

### chat_app_Urls

Let's declare the urls which will run our views when a particular url gets called. Inside the chap application create a new file `urls.py`

	from django.urls import path
	from . import views

	urlpatterns = [
	    path("", views.home_page, name="home"),
	    path("chat/", views.index, name="index"),
	    path("chat/<str:room_name>/", views.room, name="room"),
	]
	
### useraccount_app_Views

* Lets' create our useraccount views and templates now. (inside useraccount application)

* At this point we are basically trying to handle the logic of User Registration or sign up, as Django has many in built functionalities so we can make use of that and avoid creating something from scratch. 

* The `UserCreationForm` from `django.contrib.auth.forms` provides an easy interface for user sign up form, by default it provides a form with fields of username,
password and password confirmation field. Also, im using generic class views which provides `CreateView` to create our form based on form_class we provide. As, shown below;

* here => useraccount/views.py

		from django.shortcuts import render
		from django.contrib.auth.forms import UserCreationForm
		from django.urls import reverse_lazy
		from django.views import generic


		class SignUpView(generic.CreateView):
		    form_class = UserCreationForm
		    success_url = reverse_lazy('login')
		    template_name = 'registration/signup.html'

    
* Let's create a folder called registration (why? more on this shortly) inside the templates folder and put our `signup.html` file there. As, shown below;

<img width="182" alt="image" src="https://user-images.githubusercontent.com/59337853/210170468-858a3da4-501f-4e08-b589-c02f6cd6d5e5.png">

* Signup.html code is <a href="https://github.com/YashMarmat/mini-discord/blob/master/templates/registration/signup.html">here</a>.

* With the User Sign Up in place we also need a functionality to login, django provides an easy way to do this via `django.contrib.auth.urls` which serves many built in templates required for the user account related process like login, logout, password reset/change etc. 

* For now, we will keep the login and logout in our project. When using this feature django tries to locate the login.html template by automatically searching for this file at this location => templates/registration/login.html

* So, in order to avoid template related errors we have already added the registration folder inside the templates (while placing the signup.html file). So, in this registration folder you need to place the `login.html` file. Get the code from <a href="https://github.com/YashMarmat/mini-discord/blob/master/templates/registration/login.html">here</a>.


### useraccount_app_Urls

* Let's declare the urls which will run our useraccount views when a particular url gets called. Inside the useraccount application create a new file `urls.py` and
put the following code in it.

		from django.urls import path
		from .views import SignUpView

		urlpatterns = [
		    path('signup/', SignUpView.as_view(), name='signup'),
		]
	
### Project_Level_Urls

* As, we are serving seperate urls.py files for both chat and useraccount application, we need to tell django about it by updating the project level urls.py file.

		from django.contrib import admin
		from django.urls import path, include

		urlpatterns = [
		    path('admin/', admin.site.urls),
		    path('accounts/', include('django.contrib.auth.urls')), 		# handles login and logout urls
		    path('user/', include('useraccount.urls')),				# points to useraccount app urls.py file
		    path('', include('chat.urls')),					# points to chat app urls.py file
		]


### Templates

* Now, lets move to the templates part, at the root level of our project inside your templates directory create five html files namely `base.html`, `navbar.html`, `homepage.html`, `index.html` and `room.html`

* base.html

It the root or parent html whose properties will be inherited by the children htmls (homepage.html, index.html and room.html), the file contains all the
cdn links and scripts for the bootstrap ui to work. Get the code from here =>  <a href="https://github.com/YashMarmat/mini-discord/blob/master/templates/base.html" target="_blank">base.html</a>

<hr />

* navbar.html

for easier navigation of Home, Chat, Login, and Sign Up Pages. In navbar you will see your username if logged in, else anonymous user will be displayed. Get the code from here => <a href="https://github.com/YashMarmat/mini-discord/blob/master/templates/navbar.html" target="_blank">navbar.html</a>

<hr />

* homepage.html

Serves the main homepage of our application. Get the code from here => <a href="https://github.com/YashMarmat/mini-discord/blob/master/templates/homepage.html" target="_blank">homepage.html</a>

<hr />

* index.html

The page contains the input to take in the room name which is to be created or you can select the available room names from the list as well.
The file also contains some javascript scripts which handles the functionality of the form. I added the comments in the code itself f Sor better
understanding of the script. Get the code from here => <a href="https://github.com/YashMarmat/mini-discord/blob/master/templates/index.html" target="_blank">index.html</a>

<hr />

* room.html

The page displays all the messages made by the user so far, the template is getting the data from the context dictionary which we passed in the room view function.
It also displays the number of online users and few more javascript functionality for better user experience. Get the room.html code from here => <a href="https://github.com/YashMarmat/mini-discord/blob/master/templates/room.html" target="_blank">room.html</a>

<hr />

### Static_Files

* Static files serves CSS, JS, Images etc. At the root level of your project create a directory called static, inside this directory create four folders namely `css`, `js`, `images`, `svgs`.

* Inside js directory create a new file `room.js`.

* Get the room.js code from here => <a href="https://github.com/YashMarmat/mini-discord/blob/master/static/js/room.js" target="_blank">room.js</a>

* Make sure to put all the static files in your project. Get the static files from here => <a href="https://github.com/YashMarmat/mini-discord/tree/master/static" target="_blank">Static Files</a>

### room.js code description 

* frontend websockets logic

* Below we have WebSocket instance with the url which needs to be invoked when user/client opens up a request.

      const chatSocket = new WebSocket(
          'ws://'
          + window.location.host
          + '/ws/chat/'
          + roomName
          + '/'
      );            
      
* The websocket have some inbuilt methods such as onmessage which gets invoked whenever a request invokes an event (for example when client sends a message
thats also an event)

<img width="500" alt="image" src="https://user-images.githubusercontent.com/59337853/210167868-8e0acc56-6c39-423d-a06b-237cf86180df.png">

the data.type allows us to identify which type of event got invoked. We are handling three types of event here `new_message`, `user_list` and `forbidden access`

* new_message

when this event gets invoked, we basically append the HTML code as in the ul tag of id="chat_log" (just like appending child elements in the parent element), its like pasting the html in the existing html code.

<hr />

* user_list

when this event gets invoked, we first locate the ul tag of id="online-users" and in this tag we first of all removing the existing child elements so that an updated list of child elements can be added (basically list of users).

Based on the number of users we have an online users count is provided, by locating the ul tag of id="num-of-users"

<hr />

* forbidden_access

when this event gets invokded an alert gets raised of login required and user gets redirected to the chat page. Though this case will only occur if the user
somehow to bypasses the room view logic of permission denied.

<hr />

### ASGI 

* (Asynchronous Server Gateway Interface)

Now, that our Models, views and templates are done setting up lets work on the ASYNC logic which is the core part of this application on which django channels works. To undertand the django channels we need to understand how WSGI (on which django works by default works on) and ASGI works.

<img width="584" alt="wsgi_vs_asgi_in_django" src="https://user-images.githubusercontent.com/59337853/210166957-ff26a76d-4ded-405b-8d06-49c2287d2567.png" />

The key thing to note here is, in case of normal django flow the http request gets closed once the response is provided by the server. In order to open
the connection again the client needs to send another http request which again gets closed once the response is received. On the other hand in case of
django channels the connection is controlled by web sockets which is very different from http requests, as in case of web sockets the connection gets
closed when one of sides (either client or server) closes the connection, until then the connection remains open for multiple requests without any break.


* asgi.py

inside your mysite project folder there is a file called asgi.py, we need to make changes in this file in such a way that i could serve both HTTP and Websockets protocols. Changes shown below;

		from channels.routing import ProtocolTypeRouter, URLRouter
		from django.core.asgi import get_asgi_application

		import os
		from channels.auth import AuthMiddlewareStack
		from channels.security.websocket import AllowedHostsOriginValidator
		import chat.routing

		os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')

		django_asgi_app = get_asgi_application()


		application = ProtocolTypeRouter({
		    'http': django_asgi_app,
		    "websocket": AllowedHostsOriginValidator(
			AuthMiddlewareStack(
			    URLRouter(
				chat.routing.websocket_urlpatterns
			    )
			)
		    )
		})

* Also, for ASGI to work we need to tell django about it so go the settings.py file and put the below code just below WSGI_APPLICATION variable. As, shown below;

		WSGI_APPLICATION = 'mysite.wsgi.application'

		# Daphne
		ASGI_APPLICATION = "mysite.asgi.application"
		
* The above code is all about handling routings in our application via Routers, Routers are themselves a valid ASGI applications. As, per django channels documentation it is recommended to use ProtocolTypeRouter, it basically nests both type of protocols http and websockets, for views the http protocols get invoked and for our consumers (more on this shortly) the "websockets" protocol get used.

* `AllowedHostsOriginValidator` is a security middleware here, it automatically allows local connections through if the site is in DEBUG mode, much like Django’s host validation. If you want to allow some custom connections to pass through you can use `OriginValidator` more on this <a href="https://channels.readthedocs.io/en/stable/topics/security.html?highlight=AllowedHostsOriginValidator">here</a>

* In order to use authentication in our django channels project we need to use `AuthMiddlewareStack` which combines the logic of SessionMiddleware and CookieMiddleware. More on this <a href="https://channels.readthedocs.io/en/stable/topics/authentication.html">here</a>

* `chat.routing.websocket_urlpatterns` points to the location where our ws or websockets urls are present (path => chat/routing.py). So, let's create our websockets routes (mentioned below).

### Websockets_Routes

* create a new file inside your chat application and name it as routing.py, once done put the following code in it.

		from django.urls import re_path

		from . import consumers

		websocket_urlpatterns = [
		    re_path(r"ws/chat/(?P<room_name>\w+)/$", consumers.ChatConsumer.as_asgi()),
		]
		
* The layout of this file is very similar to our django urls, notice we are using re_path instead of regular "path" of django, one of the benefits of this is we can include regular expression in our url paths, another point is that we cannot pre-assume what room_name the user will going to choose or type, therefore a regular experssion is used here which basically accepts any characters or words placed after chat in the url, for example ws/chat/xyz_room/.

* Once the url is invoked it will call the consumer attached in the path, which is ChatConsumer, for now we only need to know that consumers is a class, the as_asgi() will basically create an instance of our consumer class, in case of asgi applications these instances could be multiple because they serve asynchronous requests.

### Consumers

* Before jumping into consumers make sure to create consumers.py file inside your chat application.

* As per documentation Consumers are a rich abstraction that allows you to create ASGI applications easily. In practical terms Consumers are very much alike views its just that instead of rendering any templates they invokes certain events. To generate these events our consumers wraps the data in a json format and sends it as an event to the frontend. Once, the data received is parse into javascript object we can make use of this data in any way we like.

* For our ChatConsumer to work it requires a websocket, for our application i have used WebsocketConsumer. Shown below;

<img width="495" alt="image" src="https://user-images.githubusercontent.com/59337853/210175416-2a74cb59-3c38-4069-8dd5-31ad0a0eb571.png">

* Let's break it down one by one

* __init__ method
<img width="263" alt="image" src="https://user-images.githubusercontent.com/59337853/210175465-3bed5d8c-5cc6-45bc-b976-b6532b471e7a.png">

A basic class constructor to hold our key value pairs, which we will update on the go.

* connect method

<img width="449" alt="image" src="https://user-images.githubusercontent.com/59337853/210175537-1808788c-0114-46dd-8fe6-8c90ca15c2c3.png">

In case of django views we can extract information from the request argument if defined like this `def some_function(request, *args, **kwargs)`, so in order to get user information we do something like this `request.user`. Similary, in case of consumers we have scope instead of request, and in order to extract data we use bracket notations (not dot notations in case of request.user), so, we do something like this `self.scope["user"]`, you can see all the available keys value pairs inside this self.scope by just simply printing it `print(self.scope)`.

So, as shown in image we are following bracket notations in order to get our room name and from that only we are constructing our group name. Also, locating our room by object by the room name give by the user.

<img width="592" alt="image" src="https://user-images.githubusercontent.com/59337853/210175872-5ecb478f-3a8a-4629-8f8a-5faae83737f8.png">

Further in the same method we are accepting the connection by `self.accept()`. Once, accepted if the user found to be unauthorized an event of "forbidden_access" gets invoked which basically redirects the user back to chat page (discussed while mentioning about room.js). Later in the code, we have used `async_to_sync` which basically takes in a asynchronous funtion and return it as an synchronous function. More on this in upcomming section Channel Layers.

### Channel_Layers

The point of our discord application is to allow multiple users to chat or communicate in real time without any break in connection, in order to achieve that our consumers needs support of Channel Layers, A channel layer basically allows multiple consumer instances to talk with each other, and with other parts of Django. Every consumer instance has an automatically generated unique channel name, and so can be communicated with via a channel layer.

* As per documentation:

- A channel is a mailbox where messages can be sent to. Each channel has a name. Anyone who has the name of a channel can send a message to the channel.

- A group is a group of related channels. A group has a name. Anyone who has the name of a group can add/remove a channel to the group by name and send a message to all channels in the group. It is not possible to enumerate what channels are in a particular group.

* More on channels layers <a href="https://channels.readthedocs.io/en/stable/topics/channel_layers.html">here</a>

* For our project we are using In-memory channels layers to test it locally, for production redis channel is the recommend. Implementation of redis <a href="https://channels.readthedocs.io/en/stable/topics/channel_layers.html">here</a>.

* Let's go the settings.py file and place our channels configurations, you can place these settings above DATABASES section (or you can checkout my repository code). As shown below:

		CHANNEL_LAYERS = {
		    "default": {
			"BACKEND": "channels.layers.InMemoryChannelLayer"
		    }
		}
		
* Coming back to our consumers, we need to remember a flow, to send something in chat room we first need to join the group by the method `group_add` provided by the channel layer, then we need to use another method of channel layer `group_send` in order to send an event type to the group, this event is basically a function only which gets invoked by this layer method. Note: all the methods of channel layers are asynchronous in nature so in order to work with WebsocketConsumer which is synchronous in nature we need to use async_to_sync methods. Steps shown below: 

* (Step 1): Join the room

<img width="359" alt="image" src="https://user-images.githubusercontent.com/59337853/210176768-27c6dc21-0b66-428a-9bf5-65b44aebad88.png">

* (Step 2): Prepare an event to invoke

<img width="578" alt="image" src="https://user-images.githubusercontent.com/59337853/210176785-195eca91-3f31-486b-8877-7df2adf8cfd0.png">

* (Step 3): Declare the python function mentioned in the event (in Step 2)

<img width="299" alt="image" src="https://user-images.githubusercontent.com/59337853/210176823-7a4e98a5-5027-4bcb-ba52-82018518f190.png">

* These are the crucial steps in order to invoke events in django channels. These events gets lastly gets received on the frontend level (which we discussed at room.js)

* In our connect method, we are using this line of code `self.room.online.add(self.user)` in order to update the changes in our DB as well (keeping a record of online users).

### Remaining_Methods

* disconnect method

<img width="482" alt="image" src="https://user-images.githubusercontent.com/59337853/210177020-34b1f2bd-24b6-4a99-98d7-a3e85999ac9b.png">

1) the first line of code updates the DB and removes the user from the online list.

2) being in the room group an event type "chat_room_left" is passed which basically invokes a python function "chat_room_left" (the function sends an event type of "user_list" which updates the online user count in the chat room)

* receive method

<img width="527" alt="image" src="https://user-images.githubusercontent.com/59337853/210177222-fb27b2a0-97c9-45a4-a263-eeb40f0ad28b.png">

1) converts the text message into python string format with `json.loads`.

2) An event type "chat_message" is passed which basically invokes a python function "chat_message" (the function sends an event type of "new_message" which when received on frontend side (present in room.js), appends a new message in the chat room).

3) Lastly, we are storing the user message in DB by `Message.objects.create(user=self.user, room=self.room, content=message)`.

* paste below code in chat/consumers.py

			import json
			# import random

			from asgiref.sync import async_to_sync
			from channels.generic.websocket import WebsocketConsumer
			from .models import Room, Message
			from django.shortcuts import redirect


			class ChatConsumer(WebsocketConsumer):

			    def __init__(self, *args, **kwargs):
				super().__init__(args, kwargs)
				self.room_name = None
				self.room_group_name = None
				self.room = None
				self.user = None

			    def connect(self):

				# see current user
				# print("Current user =>", self.scope["user"])

				self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
				self.room_group_name = "chat_%s" % self.room_name
				self.room = Room.objects.get(name=self.room_name)
				self.user = self.scope["user"]

				# just playing around below
				# if self.user.is_anonymous:
				#     return self.disconnect(1000)

				# accept the connection
				self.accept()

				if not self.user.is_authenticated:
				    print("not authenticated!")
				    # a redirect to chat page
				    self.send(json.dumps({
					'type': 'forbidden_access'
				    }))

				# work flow => 1) join room (by group_add), 2) send events in the room (by group_send)

				# join the room group
				async_to_sync(self.channel_layer.group_add)(
				    self.room_group_name,
				    self.channel_name,
				)

				user_to_add = self.user.username
				joined_users = [user.username for user in self.room.online.all()]

				if user_to_add not in joined_users:
				    # print("checking")
				    joined_users.append(user_to_add)

				# Send message to room group
				async_to_sync(self.channel_layer.group_send)(
				    self.room_group_name, {
					'type': 'chat_room_joined',                                     # function to invoke
					'users': joined_users,    # event              
				    }
				)

				self.room.online.add(self.user)
				print("user joined!")

			    def chat_room_joined(self, event):
				existing_users = event['users']

				self.send(text_data=json.dumps(
				    {
					"type": "user_list", 
					"users": existing_users, 
					}))

			    def disconnect(self, close_code):

				# updates in DB (for room)
				self.room.online.remove(self.user)

				# send the leave event to the room (needs to be in the room first)
				async_to_sync(self.channel_layer.group_send)(
				    self.room_group_name,
				    {
					'type': 'chat_room_left',
					'remaining_users': [user.username for user in self.room.online.all()],
				    }
				)

				# Leave room group
				async_to_sync(self.channel_layer.group_discard)(
				    self.room_group_name,
				    self.channel_name
				)

				print("user left!")

			    def chat_room_left(self, event):
				remaining_users = event['remaining_users']

				# updating the user_list (using the case user_list to update the online users list)
				self.send(text_data=json.dumps(
				    {"type": "user_list", "users": remaining_users }))

			    # Receive message from WebSocket
			    def receive(self, text_data):

				# # current user
				# current_user = self.scope["user"]
				# print("current user =>", current_user)

				text_data_json = json.loads(text_data)
				message = text_data_json["message"]

				# Send message to room group
				async_to_sync(self.channel_layer.group_send)(
				    self.room_group_name, {
					"type": "chat_message",         # function to invoke
					"message": message,             # will sent as an event
					"user_name": self.user.username # will sent as an event
				    }
				)

				# saving the user message in the DB
				Message.objects.create(user=self.user, room=self.room, content=message)

			    # Receive message from room group
			    def chat_message(self, event):
				message = event["message"]
				user_name = event["user_name"]

				# Send message to WebSocket
				self.send(text_data=json.dumps(
				    {"type": "new_message", "message": message, "user_name": user_name}))
				    
### Run_server

* Finally, Let's run our development server.

<img width="473" alt="image" src="https://user-images.githubusercontent.com/59337853/210205948-742ab758-1478-4023-9287-0cc7370530bf.png">

* If the server says its "Starting ASGI/Daphne version 4.0.0 development.....", this means we configured our django channels properly.

* All set!, we finally created our mini discord application, you can modify or play around with this application in any way you like.

## Happy Coding :)

## Helpful_Links_on_Django_Channels

* (Docs) https://channels.readthedocs.io/en/stable/ 
* (Blog) https://testdriven.io/blog/django-channels/
* (Youtube Tutorial) https://www.youtube.com/watch?v=F4nwRQPXD8w&list=PLY2Jo2XRoTHoymGmVBeQ2dt0iWZ2FZbpc&index=5

<p><a href="#top">Back to Top</a></p>

