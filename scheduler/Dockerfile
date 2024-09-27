# scheduler/Dockerfile
FROM python:3.9-slim

# Install cron
RUN apt-get update && apt-get install -y cron

# Set the working directory
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Install any Python dependencies (if any, otherwise omit this step)
# RUN pip install --no-cache-dir -r requirements.txt

# Add a cron job to run the script at 12:00 PM
RUN echo "0 12 * * * /usr/local/bin/python /usr/src/app/schedule.py >> /var/log/cron.log 2>&1" > /etc/cron.d/scheduler-cron

# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/scheduler-cron

# Apply cron job
RUN crontab /etc/cron.d/scheduler-cron

# Create the log file to be able to run tail
RUN touch /var/log/cron.log

# Run cron in the foreground
CMD cron && tail -f /var/log/cron.log
