import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const api = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '@anonacy/postal-api',
      version,
      description:
        'This is the @anonacy/postal-api API documentation.',
      contact: {
        name: "Anonacy",
        url: "http://anonacy.com",
        email: "support@anonacy.com"
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Dev API'
      },
      {
        url: 'http://api.postal.anonacy.com',
        description: 'Postal API'
      }
    ],
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
}

const spec = swaggerJsdoc(api);
export { spec, swaggerUi, options }