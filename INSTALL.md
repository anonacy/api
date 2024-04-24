# Installation Guide

The anonacy api is an interface for an open source Postal mail server. A pre-requisite is setting up your own Postal instance.

**You need to have a working installation of Postal before setting up the anonacy api.**

Follow the guide at [postalserver.io](https://docs.postalserver.io/getting-started)

***

# @anonacy/api

## Docker

This api is provided as a docker container to run on the same machine as your Postal server.

`docker pull anonacy/api`

To run use the command below. There are some required environment variables to set:

```
docker run -d \
    --name anonacy-api \
    -p 127.0.0.1:3001:3001 \
    --restart always \
    -e POSTAL_URL=your_domain.com \
    -e POSTAL_USER=your_postal_login_email \
    -e POSTAL_PASS=your_postal_password \
    -e MARIADB_PASS=your_mariadb_password \
    -m 2g \
    anonacy/api
```
There are a few defaults you can change by adding more `-e` options to the above command.
Set available memory to desired amount with `-m`

 ```
API_DOMAIN=127.0.0.1
API_PORT=3001
POSTAL_SUBDOMAIN=postal
MARIADB_HOST=127.0.0.1
MARIADB_PORT=3306
MARIADB_USER=root
MARIADB_NAME=postal
 ```

If you are running on a seperate machine than Postal, you can change these variables.

## Auth

You need an api key from your postal server. In Postal, go to credentials and create one with type `API`

Include this key in the header `Authorization` with the value `Bearer $APIKEY` with all requests to the api

It will automatically scope all requests to the org & server in Postal that the api key was created for.


***

# @anonacy/app
## Docker

The app is also provided as a docker image to run alongside Postal. A pre-requisite is to also have an instance of [@anonacy/api](https://github.com/anonacy/api) running with Postal.

`docker pull anonacy/app`

To run:

```
docker run -d \
    --name anonacy-app \
    -p 127.0.0.1:8080:8080 \
    --restart always \
    anonacy/app
```

This is setup assumes an @anonacy/api instance running locally on port 3001. Optional `-e` options:

 ```
VITE_API_URL='127.0.0.1'
VITE_API_PORT='3001'
 ```

***

## Caddy

To make the app and api accessable from your domain, you should follow the same process as with Postal using `caddy`

Edit your caddyfile to map to the correct ports:

```
# already here
postal.your_domain.com {
  reverse_proxy 127.0.0.1:5000
}

# add below
api.your_domain.com {
  reverse_proxy 127.0.0.1:3001
}

app.your_domain.com {
  reverse_proxy 127.0.0.1:8080
}
```

Then restart caddy
`docker restart postal-caddy`

And configure your dns

***

## Update Policy

Generally, any update or patch will be pushed with the `latest` tag on docker hub.

## API Documentation

Full api documentation is provided at the `/docs` endpoint of your api instance.

Hosted docs can also be found [here](https://api2.anonacy.com/docs/)

***

Built by hew🪶