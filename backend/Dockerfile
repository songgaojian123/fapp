# Use Node.js v16
FROM node:16

# Create app directory
WORKDIR /app

# Copy source code
COPY . .

# Install serve to serve your static files
RUN npm install 

# Bind the port that your app will run on
EXPOSE 80

# Define the Docker command to run your app
CMD [ "node", "server.js" ]
