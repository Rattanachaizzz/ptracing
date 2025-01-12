const api = require('../controllers/api.js');
const mqtt = require('../controllers/mqtt.js');

module.exports = (apiServer, mqttBroker, wss) => {
    //API Routes
    apiServer.post('/UpdateConfig', api.UpdateConfig);
    apiServer.delete('/CalibateGforce', api.CalibateGforce);
    apiServer.post('/ResetLambdaCount', api.ResetLambdaCount);
    apiServer.post('/Reports', api.Reports);
    apiServer.post('/SetDetail', api.SetDetail);
    apiServer.post('/GetAllCar', api.GetAllCar);

    //MQTT Routes
    mqttBroker.on('ready', mqtt.Ready);
    mqttBroker.on('clientConnected', mqtt.Connected);
    mqttBroker.on('clientDisconnected', mqtt.Disconnected);
    mqttBroker.on('published', mqtt.Published);
};