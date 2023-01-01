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
  * [Short_Note](#Short_Note)
- [Installation](#Installation)
  * [application_setup](#application_setup)
- [Documentation](#Documentation)

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

## Short_Note
For this application i have only made available the apis or backend part, so that you can feel free to design your own UI, based on any frontend library or framework of your choice. You can also test the apis with postman (APIs are present in this directory => project_files, once downloaded just import the apis file in your postman app). 

## Installation
after downloading/cloning the repository code, follow below steps:

### application_setup

- create your virtual environment
`python -m venv myenv` 

- activate your virtual environment
`myenv\scripts\activate`

- install project dependencies
`pip install -r requirements.txt`

- make your first migration
`python manage.py makemigrations`

- migrate your changes
`python manage.py migrate`

- run the server
`python manage.py runserver`


## All set :)


## Documenation

Here we will build the mini discord application step by step. I tried to explain every single step in as simplest way possible to keep it simple for beginners as well. So, let's gets started :)

### Basic_Setup

<p><a href="#top">Back to Top</a></p>

