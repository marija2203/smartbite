import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SmartBite API",
      version: "1.0.0",
      description: "API dokumentacija za SmartBite aplikaciju",
    },
  },
  apis: ["./src/app/api/**/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);