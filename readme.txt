// commands to follow in order to run the project (make sure the virtual environment is running)

// before installing requirements
pip install wheel

// Step 1: run docker
sudo dockerd

// Step 2: run redis in a docker container
sudo docker run -p 6379:6379 -d redis:5

// Step 3: run django server
python manage.py runserver