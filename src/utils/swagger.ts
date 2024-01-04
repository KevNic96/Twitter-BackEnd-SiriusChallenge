import { app } from '@server';
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "Example - Twitter Express API w/Swagger",
            version: "0.1.0",
            description: "Twitter Documentation"
        },
        servers: [
            {
                url: 'http://localhost:8080'
            }
        ]
    },
    apis: [
        './src/router/index.ts',
        './src/domains/user/controller/*.ts',
        './src/domains/auth/controller/*.ts',
        './src/domains/post/controller/*.ts',
        './src/domains/heath/controller/*.ts',
        './src/domains/follower/controller/*.ts',
        './src/domains/reaction/controller/*.ts',
        './src/domains/comment/controller/*.ts',
    ]
}

const specs = swaggerJSDoc(options)

app.use('/docs',swaggerUi.serve, swaggerUi.setup(specs))
