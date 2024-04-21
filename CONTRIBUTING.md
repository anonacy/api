
# Contributing

If you would like to contribute, please email me at support@anonacy.com.

***


## Technologies

- [Postal](https://postalserver.io)
- [Express](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Puppeteer](https://pptr.dev/)
- [Docker](https://www.docker.com/) - (deployment)
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - (docs)

## Development
1. Clone this repo
      `git clone https://github.com/anonacy/api`
2. `cd api/`
3. `npm install`
4. `npm start` to run locally
5. `npm run build` to build `/dist`


## Auth
Firstly, you'll need an api key from your postal server. In Postal, go to credentials and create one with type `API`

Include this key in the header `Authorization` with the value `Bearer $APIKEY` with all requests to the api

It will automatically scope all requests to the org & server in Postal that the api key was created for.

   
## Environment Variables

The following config is needed in a `.env` file at the root of the project.

### Server Config

```
NODE_ENV='development' or `production`
API_DOMAIN=`http://localhost` or `https://your-api-domain`
PORT=3001
```

### Postal Connection
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


## Testing

There are tests to check if the api works correctly. They are found in `/test`.

Serve the api locally and run `npm test`

`.env` variables for tests:
```
TEST_API_KEY=[test server api key]
TEST_API_URL=http://localhost:3001
```

***

Built by hew🪶