import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const api = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '@anonacy/postal-api',
      version,
      description: `<b>- About</b><br/><br/>Anonacy's postal api enables control over a [Postal](https://postalserver.io) mail server. It is designed for email aliasing, by managing the 'Routing' system within Postal, while Postal handles the smtp forwarding.
      <br/><br/>
      The API can be used in many ways, and will continually be enhanced. It works by utilizing direct mySQL queries in Postal's database, as well as using [puppeteer](https://pptr.dev) for more complex interactions.
      <br/><br/>
      This system is used to power the [anonacy](anonacy.com) and [hiddenlogin](https://hiddenlogin.com) platforms.
      <br/><br/>
      It is mounted as the [v2] api at [api.anonacy.com/v2](https://api.anonacy.com/v2/docs). Currently, the [v1](https://api.anonacy.com/v1/docs) api has been updated with logic to use the v2 api for the relevant alias management to preserve functionality of the current platform.
      <br/><hr/>
      <b>- Authorization</b>
      <br/><br/>
      All requests require the header: '<b>Authorization: Bearer APIKEY</b>'
      <br/><br/>
      This api uses an api key with [Bearer](https://swagger.io/docs/specification/authentication/bearer-authentication/) authorization. The api key will be provided to you or it can be generated using the credentials system in the Postal server. The api key will automatically scope all requests to the Postal organization & server that it is assigned for.
      <br/><br/>
      The api key needs to be attached to ALL requests using the '<b>Authorization</b>' header, with the value set as '<b>Bearer APIKEY</b>'. Always use https when making requests to the api.
      <br/><br/><hr/>
      <b>- General Usage</b>
      <br/><br/>
      To get started, you should first add and setup a domain name, then you can add aliases.
      <ul><li>[POST] /domain - add a domain</li><li>[GET] /domain?domain=[domain_name] - domain dns setup info</li><li>[POST] /alias - Create alias</li><li>[PUT] /alias - toggle alias forwarding</li></ul>
      <br/>
      Full api functionality is found below, along with request and response data. The api endpoints are mounted at /v2. For example, [/domains] in these docs maps to [api.anonacy.com/v2/domains].
      <br/><br/><hr/>
      Once licensing is in place, the source code will be made public.
      `,
      contact: {
        name: "[support@anonacy.com]",
        email: "support@anonacy.com"
      },
    },
    servers: [
      {
        url: 'http://api.anonacy.com/v2',
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
    // externalDocs: {
    //   description: 'View Source Code',
    //   url: 'https://github.com/hewham/anonacy-puppet'
    // },
  },
  apis: [
    './src/docs/api/domain.yaml', 
    './src/docs/api/endpoint.yaml', 
    './src/docs/api/alias.yaml'
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