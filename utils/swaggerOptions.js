const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Alphacrunch API",
            version:"1.0.0",
            description: "documentation of the Alphacrunch api"
        },
    },
    apis: ["../routes/*.js"]
}

module.exports = options