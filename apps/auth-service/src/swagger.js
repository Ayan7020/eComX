import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        title: "Auth Service Api",
        description: "Swagger Docs for auth-services",
        version: "1.0.0"
    },
    host: "localhost:6001",
    schemas: ['http'],
};

const outputfile = "./swagger-output.json";
const endpointsFiles = ["./routes/auth.router.ts"]

swaggerAutogen()(outputfile,endpointsFiles,doc)