
module.exports = {
    name: 'PTRACING',
    version: '1.0.0',
    env: 'production',
    serverSettings: {
        mqttPort: 1883,
        apiPort: 4000,
        socketPort: 4000
    },
    dbSettings: {
        username : "s63",
        password : "063063",
        host: 'mongodb://username:password@localhost:27017',
        database: 'PTRACINGDB',
        port: 27017,
    },
}