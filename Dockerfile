# Use an official Nginx image from the Docker Hub
FROM nginx:alpine

# Set the working directory to /usr/share/nginx/html (default location for Nginx)
WORKDIR /usr/share/nginx/html

# Copy the contents of the quran-frontend folder into the container's html directory
COPY . /usr/share/nginx/html/

# Expose port 80 to make the container accessible via HTTP
EXPOSE 80

# The default command to run when the container starts (Nginx will serve the files)
CMD ["nginx", "-g", "daemon off;"]
