import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const api = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '@anonacy/postal-api',
      version,
      description: "Anonacy's postal api allows simplified control over a [Postal](https://postalserver.io) open-source mail server. It is designed for email aliasing, by intelligently managing the 'Routes' system within Postal, while Postal handles the mail forwarding between smtp servers. It also provides a simple way to manage domains and email endpoints, needed for aliases. <br><br> The API can be used in broader ways, and will continually be enhanced. It works by utilizing direct mySQL queries in Postal's database, as well as using [puppeteer](https://pptr.dev) for more complex interactions. <br><br> This system is currently used to power the [anonacy](anonacy.com) and [hiddenlogin](https://hiddenlogin.com) platforms. <br><br> It is nested as the [v2] api at [api.anonacy.com/v2](https://api.anonacy.com/v2/docs)",
      contact: {
        name: "[hew@anonacy.com]",
        email: "hew@anonacy.com"
      },
    },
    servers: [
      {
        url: 'http://api.postal.anonacy.com',
        description: 'Postal API'
      },
      {
        url: 'http://localhost:3001',
        description: 'Dev API'
      }
    ],
    externalDocs: {
      description: 'Source Code on Github',
      url: 'https://github.com/hewham/anonacy-puppet'
    },
    // externalDocs: {
    //   description: 'Source Code on Github',
    //   url: 'https://github.com/anonacy/postal-api'
    // },
  },
  apis: [
    './src/docs/api/domain.yaml', 
    './src/docs/api/endpoint.yaml', 
    './src/docs/api/alias.yaml'
  ],
  // apis: ['./src/docs/api/*.yaml'],
};

const options = {
  explorer: true,
  customSiteTitle: '@anonacy/postalapi API Docs',
  customCss: '.swagger-ui { max-width: 768px; margin: auto } .topbar { display: none } .opblock-description { font-weight: bold } ',
  docExpansion: 'full',
  tryItOutEnabled: false,
  defaultModelExpandDepth: 3
}

const spec = swaggerJsdoc(api);
export { spec, swaggerUi, options }