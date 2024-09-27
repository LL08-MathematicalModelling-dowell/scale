# Use the official Python image as the base image
FROM python:3.9-slim

# Install cron and requests
RUN apt-get update && apt-get install -y cron && pip install requests

# Set the working directory
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Add a cron job to run the script at 7:30 AM UTC (which is 1:00 PM IST)
RUN echo "30 8 * * * /usr/local/bin/python /usr/src/app/schedule.py >> /var/log/cron.log 2>&1" > /etc/cron.d/scheduler-cron

# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/scheduler-cron

# Apply cron job
RUN crontab /etc/cron.d/scheduler-cron

# Create the log file to be able to run tail
RUN touch /var/log/cron.log

# Run cron in the foreground
CMD ["cron", "-f"]
