import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const api = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '@anonacy/api [v2]',
      version,
      description: `<b>- About</b><br/><br/>Anonacy's v2 api enables control over a smtp mail server. It is designed for email aliasing, by managing the 'Routing' system within [Postal](https://postalserver.io), which handles the smtp forwarding.
      <br/><br/>
      This system is used to power the [anonacy](https://anonacy.com) and [hiddenlogin](https://hiddenlogin.com) platforms.
      <br/><br/>
      It is mounted as the [v2] api at [api2.anonacy.com](https://api2.anonacy.com/docs/). Currently, the [v1](https://api.anonacy.com/v1/docs) api has been updated with logic to use the v2 api for the relevant alias management to preserve functionality of the current platform.
      <br/><hr/>
      <b>- Authorization</b>
      <br/><br/>
      All requests require the header: '<b>Authorization: Bearer APIKEY</b>'
      <br/><br/>
      This api uses an api key with [Bearer](https://swagger.io/docs/specification/authentication/bearer-authentication/) authorization. The api key will be provided to you or it can be generated using the credentials system in the Postal server. The api key will automatically scope all requests to the organization & server that it is assigned for.
      <br/><br/>
      The api key needs to be attached to ALL requests using the '<b>Authorization</b>' header, with the value set as '<b>Bearer APIKEY</b>'. Always use https when making requests to the api.
      <br/><br/><hr/>
      <b>- General Usage</b>
      <br/><br/>
      The most basic use case is - add and setup a domain name, then add an alias:
      <ul><li>[POST] /domain - add a domain</li><li>[GET] /domain - domain dns setup info</li><li>[POST] /alias - create alias</li></ul>
      <br/>
      Full api functionality is found below, along with request and response data.
      <br/><br/><hr/>
      `,
      contact: {
        name: "[support@anonacy.com]",
        email: "support@anonacy.com"
      },
    },
    servers: [
      {
        url: 'http://api2.anonacy.com',
        description: 'Anonacy v2 - Postal API'
      },
      {
        url: 'http://localhost:3001',
        description: 'Developer Self-Hosted API'
      }
    ],
    components: {
      securitySchemes: {
        Authorization: {
          type: 'http',
          scheme: 'bearer',
        },
      },
    },
    externalDocs: {
      description: 'View Source Code',
      url: 'https://github.com/anonacy/api'
    },
  },
  apis: [
    './src/docs/api/domain.yaml', 
    './src/docs/api/endpoint.yaml', 
    './src/docs/api/alias.yaml',
    './src/docs/api/message.yaml'
  ],
};

const options = {
  explorer: true,
  customSiteTitle: '@anonacy/postalapi API Docs',
  customCss: '.swagger-ui { max-width: 768px; margin: auto } .topbar { display: none } .opblock-description { font-weight: bold }',
  docExpansion: 'full',
  tryItOutEnabled: false,
  defaultModelExpandDepth: 3
}

const spec = swaggerJsdoc(api);
export { spec, swaggerUi, options }