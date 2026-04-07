import path from 'node:path';
import swaggerJSDoc from 'swagger-jsdoc';

export const generateOpenApiSpec = () => {
  const isDist = __dirname.includes(`${path.sep}dist${path.sep}`);
  const apisPath = isDist
    ? path.resolve(__dirname, '../controllers/*.js')
    : path.resolve(__dirname, '../controllers/*.ts');

  return swaggerJSDoc({
    definition: {
      openapi: '3.0.3',
      info: {
        title: 'LARC PDF API',
        version: '1.0.0',
        description: 'Node.js TypeScript migration of ASP.NET PDF endpoints'
      },
      servers: [{ url: '/' }]
    },
    apis: [apisPath]
  });
};
