# Use an official Node.js runtime as the base image
FROM node:20

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libxss1 \
    libxtst6 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

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

# Set Puppeteer environment variables to use system Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
ENV PUPPETEER_CACHE_DIR=/usr/src/anonacy-api/.cache/puppeteer

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
