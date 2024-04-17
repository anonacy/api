# Use an official Node.js runtime as the base image
FROM node:20

# Set the working directory in the Docker container
WORKDIR /usr/src/anonacy-api

# Copy package.json and package-lock.json into the Docker container
COPY package*.json ./

# Install the application dependencies inside the Docker container
RUN npm install

# Copy the application source code into the Docker container
COPY . .

# Build the application
RUN npx unbuild

# Expose port 3001 for the application
EXPOSE 3001

# Define the command to run the application
CMD [ "node", "dist/app.mjs" ]
