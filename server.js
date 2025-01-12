const mosca = require('mosca');
const express = require('express');
const expressWs = require('express-ws');
const bodyParser = require('body-parser');
const config = require('./config/index.js')
const { dateNow, connectMongoDB } = require('./funtions/index');

//api
const apiServer = express();
apiServer.use(bodyParser.json());
apiServer.use(express.urlencoded({ extended: true }));

//mqtt
const moscaSettings = { port: config.serverSettings.mqttPort };
const mqttBroker = new mosca.Server(moscaSettings);
mqttBroker.authenticate = async (client, username, password, callback) => {
  try {
    const { db } = await connectMongoDB();
    const collection = await db.collection("users");
    const data = await collection.find({ "user": username }).toArray();
    const user_db = data[0].user;
    const pass_db = data[0].password;
    const authorized = (username === user_db && password.toString() === pass_db);
    if (authorized) {
      client.user = username;
    }
    callback(null, authorized);
  } catch (error) {
    callback(null, false);
  }
};

//web-sockt
expressWs(apiServer);
const clients = new Map();
apiServer.ws('/:carId', (ws, req) => {
    const { carId } = req.params;
    const path = `/${carId}`;
    console.log(`${dateNow()} : [Info] : WebSocket ${carId} is connected.`)

    if (!clients.has(path)) {
        clients.set(path, []);
    }
    clients.get(path).push(ws);

    ws.on('message', (message) => {
        console.log(`${dateNow()} : [Info] : WebSocket ${path} Received: ${message}`);
    });

    ws.on('close', () => {
        console.log(`${dateNow()} : [Info] : WebSocket ${carId} disconnected.`);
        if (clients.has(path)) {
            clients.set(
                path,
                clients.get(path).filter((client) => client !== ws)
            );
        }
    });
});

console.log(`${dateNow()} : [Info] : S63 Server running ...`);
apiServer.listen(config.serverSettings.apiPort, () => {
  console.log(`${dateNow()} : [Info] : HTTP API is running on port ${config.serverSettings.apiPort}`);
  console.log(`${dateNow()} : [Info] : WebSocket is running on port ${config.serverSettings.socketPort}`);
});

require('./routes/index.js')(apiServer, mqttBroker)
exports.clients = clients;