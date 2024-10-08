FROM python:3.11-alpine

# Install system dependencies and font packages
RUN apk update && apk add --no-cache \
    build-base \
    libffi-dev \
    musl-dev \
    bash \
    ttf-dejavu  # Install DejaVuSans font package

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the requirements file into the container
COPY ./requirements.txt /usr/src/app/requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the Django app code to the container
COPY . /usr/src/app

# Run migrations
RUN python manage.py makemigrations && python manage.py migrate

# Expose the port on which the Django app will run
EXPOSE 8000

# Command to run the Django app using Django's built-in server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]
