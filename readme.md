
## Documenation

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

`pip install crispy_forms` (enhanced bootstrap forms)

`pip install crispy_bootstrap5` (enhanced bootstrap forms)

* Create two django applications namely "chat" and "accounts"

`python manage.py startapp chat` (will work on the conversation related logic)

`python manage.py startapp accounts` (will work on sign up related logic)

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

* Now, Place a templates folder at the root level of your project.

### Models

* In this application we will keep a record or two things: Rooms and Message.

* Room_Model

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


* Message_Model

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

`python manage.py makemigrations`

`python manage.py migrate`

### Chat app Views

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

### chat app Urls

Let's declare the urls which will run our views when a particular url gets called. Inside the chap application create a new file `urls.py`

	from django.urls import path
	from . import views

	urlpatterns = [
	    path("", views.home_page, name="home"),
	    path("chat/", views.index, name="index"),
	    path("chat/<str:room_name>/", views.room, name="room"),
	]
	
### useraccount app Views

* Lets' create our useraccount views and templates now. (inside useraccount application)

* At this point we are basically trying to handle the logic of User Registration or sign up, as Django has many in built functionalities so we can make use of that and avoid creating something from scratch. 

* The `UserCreationForm` from `django.contrib.auth.forms` provides an easy interface for user sign up form, by default it provides a form with fields of username,
password and password confirmation field. Also, im using generic class views which provides `CreateView` to create our form based on form_class we provide. As, shown below;

* here => useraccounts/views.py

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


### useraccount app Urls

* Let's declare the urls which will run our useraccount views when a particular url gets called. Inside the useraccount application create a new file `urls.py` and
put the following code in it.

	from django.urls import path
	from .views import SignUpView

	urlpatterns = [
	    path('signup/', SignUpView.as_view(), name='signup'),
	]
	
### Project Level Urls

* As, we are serving seperate urls.py files for both chat and useraccount application, we need to tell django about it by updating the project level urls.py file.

		from django.contrib import admin
		from django.urls import path, include
		from django.contrib.auth import views as auth_views 

		urlpatterns = [
		    path('admin/', admin.site.urls),
		    path('accounts/', include('django.contrib.auth.urls')), 		# handles login and logout urls
		    path('user/', include('useraccount.urls')),				# points to useraccount app urls.py file
		    path('', include('chat.urls')),					# points to chat app urls.py file
		]


### Templates

* Now, let move to the templates part, at the root level of our project create a directory called templates (you can see the structure of this
repository to get an idea about the directories order) inside templates folder create five html files namely `base.html`, `navbar.html`, `homepage.html`,
`index.html` and `room.html`

* base.html

It the root or parent html whose properties will be inherited by the children htmls (homepage.html, index.html and room.html), the file contains all the
cdn links and scripts for the bootstrap ui to work. Get the code from here =>  <a href="https://github.com/YashMarmat/mini-discord/blob/master/templates/base.html" target="_blank">base.html</a>

<hr />

* navbar.html

for easier navigation of Home, Chat, Login, and Sign Up Pages. In navbar you will see your username if logged in, else anonymous user will be displayed. Get the code from here => <a href="https://github.com/YashMarmat/mini-discord/blob/master/templates/navbar.html" target="_blank">navbar.html</a>

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

### static_files

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

### WSGI vs ASGI

Now, that our Models, views and templates are done setting up lets work on the ASYNC logic which is the core part of this application. To undertand the django channels we need to understand how WSGI (on which django works by default works on) and ASGI works.

<img width="584" alt="wsgi vs asgi in django" src="https://user-images.githubusercontent.com/59337853/210166957-ff26a76d-4ded-405b-8d06-49c2287d2567.png">

The key thing to note here is, in case of normal django flow the http request gets closed once the response is provided by the server. In order to open
the connection again the client needs to send another http request which again gets closed once the response is received. On the other hand in case of
django channels the connection is controlled by web sockets which is very different from http requests, as in case of web sockets the connection gets
closed when one of sides (either client or server) closes the connection, until then the connection remains open for multiple requests without any break.

<p><a href="#top">Back to Top</a></p>

