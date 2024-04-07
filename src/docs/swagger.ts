import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const api = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '@anonacy/postal-api',
      version,
      description: `<b>- About</b><br/><br/>Anonacy's postal api allows simplified control over a [Postal](https://postalserver.io) open-source mail server. It is designed for email aliasing, by intelligently managing the 'Routes' system within Postal, while Postal handles the mail forwarding between smtp servers. It also provides a simple way to manage domains and email endpoints, needed for aliases.
      <br/><br/>
      The API can be used in broader ways, and will continually be enhanced. It works by utilizing direct mySQL queries in Postal's database, as well as using [puppeteer](https://pptr.dev) for more complex interactions.
      <br/><br/>
      This system is now currently used to power the [anonacy](anonacy.com) and [hiddenlogin](https://hiddenlogin.com) platforms.
      <br/><br/>
      It is proxied as the [v2] api at [api.anonacy.com/v2](https://api.anonacy.com/v2/docs). The open-source version of the Anonacy platform will be coming soon, using the v2 postal api as the backend. Currently, the [v1](https://api.anonacy.com/v1/docs) api has been updated with logic to use the v2 api for the relevant alias management to preserve functionality of the current platform.
      <br/><hr/>
      <b>- Authorization</b>
      <br/><br/>
      This api uses [ApiKey](https://swagger.io/docs/specification/authentication/api-keys/) authorization. The ApiKey will be provided to you or it can be generated using the credentials system in the Postal server. The Api Key will automatically scope all requests to the Postal organization & server that it is assigned for. It needs to be attached to ALL requests using the '<b>x-api-key</b>' header.
      <br/><br/><hr/>
      <b>- General Usage</b>
      <ul><li>[POST] /domain - add a domain</li><li>[GET] /domain?domain=[domain_name] - domain dns setup info</li><li>[POST] /alias - Create alias</li><li>[PUT] /alias - toggle alias enabled</li></ul>
      <br/>
      Detailed usage of api endpoints found below. The endpoints are mounted at /v2. For example, [/domains] in these docs maps to [api.anonacy.com/v2/domains].
      <br/><br/><hr/>
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
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
      },
    },
    externalDocs: {
      description: 'View Source Code',
      url: 'https://github.com/hewham/anonacy-puppet'
    },
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