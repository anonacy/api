# Use an official Node.js runtime as the base image
FROM node:20

# Default environment variables (fallbacks only)
# These will be overridden by .env file or hosting service environment variables
ENV API_DOMAIN='127.0.0.1'
ENV API_PORT='3001'
ENV RUN_HEADLESS='TRUE'
ENV BROWSER_TIMEOUT='30'
ENV POSTAL_SUBDOMAIN='postal'
ENV POSTAL_URL=''
ENV POSTAL_USER=''
ENV POSTAL_PASS=''
ENV MARIADB_HOST='127.0.0.1'
ENV MARIADB_PORT='3306'
ENV MARIADB_USER='root'
ENV MARIADB_PASS=''
ENV MARIADB_NAME='postal'

# Set the working directory in the Docker container
WORKDIR /usr/src/anonacy-api

# Copy package.json and package-lock.json into the Docker container
COPY package*.json ./

# Copy the application source code into the Docker container
COPY . .

# Install ALL dependencies (including devDependencies needed for build)
RUN npm install

# Build the application
RUN npm run build

# Set NODE_ENV to production after build
ENV NODE_ENV='production'

# Expose port 3001 for the application
EXPOSE 3001

# Define the command to run the application
CMD [ "node", "dist/app.mjs" ]
