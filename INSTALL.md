# Installation Guide

This api is an adaptive layer for an open source Postal mail server. A pre-requisite is setting up your own Postal instance.

***

## Postal Install
This api relies on a pre-existing Postal server setup, with a few small tweaks outlined below. Read the changes below, and then follow the installation guide at [postalserver.io](https://docs.postalserver.io/getting-started)

#### Note: 
You will need a cloud provider that does not block port `25` for mail exchange. If you are hosting yourself, you may need to request your ISP to unblock port `25`. You will also need a clean (non-blacklisted) IP for mail delivery. [Check your IP here](http://multirbl.valli.org/lookup/)

#### Tweaks:

A couple of tweaks are needed during the Postal installation process. To get access to the `mariadb` instance that postal uses from an external network, there are 2 options:

#### Mariadb
This api needs a connection to the `mariadb` database instance, setup in the 'pre-requisites' section of the Postal guide. It should be run on the same machine as Postal. 

In the meantime, there are **2** approaches if running the api on a different network.

#### Option 1

* Expose port 3306 to the internet
This approach is not recommended. Only do this with a strong password for mariadb and set up a firewall where only your api's IP address is allowed through.

You can expose the port by changing the port option in the mariadb docker run command from `-p 127.0.0.1:3306:3306` to `-p 3306:3306`. This will make the db available on the external port 3306, instead of only on the local machine. You can also set it to a different external port.


You now also connect with your favorite mySQL gui.

*Note:* When you set up `mariadb` consider using the option `-v ~/mariadb-data:/var/lib/mysql`. This will keep the data in the `~/mariadb-data` folder and allow it to persist between docker images.

#### Option 2

* Run a TCP Proxy to forward traffic sent to a domain name to port 3306.

This approach gives you a bit more control over the traffic that can come through.

#### Option 3

* Run the api on the same server as postal. This is ideal and coming soon.

***

## Environment Variables

The following config is needed in a `.env` file at the root of the project.

#### Server Config

```
NODE_ENV='development' or `production`
API_DOMAIN=`http://localhost` or `https://your-api-domain`
PORT=3001
```

#### Postal Connection
The api interacts with Postal in 2 ways. Set the following variables in .env file to connect:
1. Direct SQL queryies.
 ```
MARIADB_HOST=[IP address]
MARIADB_PORT=3306
MARIADB_USER=[mariadb user]
MARIADB_PASS=[mariadb pw]
MARIADB_NAME=postal
 ```
2. Puppeteer
```
POSTAL_CONTROL_PANEL=postal
POSTAL_URL=[domain name]
POSTAL_USER=[user email]
POSTAL_PASS=[user pw]
RUN_HEADLESS=TRUE # change to false to view browser during development
BROWSER_TIMEOUT=30 # Timeout in seconds for puppet browser to auto close
```
Puppeteer takes the login info of the postal web portal, as it interacts with the postal UI. It may be a good idea to make a second user in Postal for this.


#### Testing

There are tests to check if the api works correctly. They are found in `/test`.  Have an api instance running (url set in `.env`) and run `npm test`

```
TEST_API_KEY=[test server api key]
TEST_API_URL=http://localhost:3001
```

***

## API setup

#### Auth
Firstly, you'll need an api key from your postal server. In Postal, go to credentials and create one with type `API`

Include this key in the header `Authorization` with the value `Bearer $APIKEY` with all requests to the api

It will automatically scope all requests to the org & server in Postal that the api key was created for.


#### Repo
1. Clone this repo
      `git clone https://github.com/anonacy/api`
2. `cd api/`
3. `npm install`
4. `npm start` to run locally
5. `npm run build` to build `/dist`

#### Deployment with Heroku:
The api is currently preconfigured to deploy to heroku. You need a buildpack for puppeteer to work correctly, install this [puppet buildpack](https://elements.heroku.com/buildpacks/jontewks/puppeteer-heroku-buildpack) in your heroku project.

```
heroku create --buildpack https://github.com/jontewks/puppeteer-heroku-buildpack.git
```

Follow standard heroku setup for a node app, and run `npm run deploy` to push to your heroku git branch.

#### Future deployment with docker
The api will soon be containerized with docker to deploy alongside your postal instance and @anonacy/app on the same server. This will also remove the need to expose your `mariadb` port and run an extra service.

#### Other

You can deploy this anywhere a node app can be run.

***

Built by hew🪶