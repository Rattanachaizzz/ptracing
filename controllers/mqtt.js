const { dateNow } = require('../funtions/index');
const { SocketSend } = require('./socket.js');

exports.Connected = async function (client) {
    console.log(`${dateNow()} : [Info] : MQTT client ${client.id} connected.`);
}

exports.Disconnected = async function (client) {
    console.log(`${dateNow()} : [Info] : MQTT client ${client.id} disconnected.`);
}

exports.Published = async function (packet, client) {
    if (client) {
        try {
            let JsonString = packet.payload.toString().replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, '');
            let JsonObj = JSON.parse(JsonString);
            console.log(`${dateNow()} : [recieve] : MQTT Published >> ${JsonString}`);
            JsonObj.lat = JsonObj.lat === "" ? "0" : JsonObj.lat;
            JsonObj.lon = JsonObj.lon === "" ? "0" : JsonObj.lon;
            JsonObj.name = JsonObj.name === "" ? "****" : JsonObj.name;
            JsonObj.description = JsonObj.description === "" ? "****" : JsonObj.description;
            const collection = await db.collection("logs");
            SocketSend(`/car${JsonObj.car}`, JsonObj)
            JsonObj.timeStamp = dateNow();
            JsonObj.time = JsonObj.time === "" ? timeFormat() : JsonObj.time;
            JsonObj.date = JsonObj.date === "" ? dateFormat() : JsonObj.date;
            await collection.insertOne(JsonObj);
        } catch (err) {
            console.log(`${dateNow()} : [Error] : MQTT ${err}`);
        }
    }
};

function dateFormat() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const yearShort = String(now.getFullYear()).slice(-2);
}

function timeFormat() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}