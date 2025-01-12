const { dateNow } = require('../funtions/index');
const { SocketSend } = require('./socket.js');
const { connectMongoDB } = require('../funtions/index');

exports.Ready = async function (client) {
    console.log(`${dateNow()} : [Info] : MQTT Broker is running on port 1883`);
}

exports.Connected = async function (client) {
    console.log(`${dateNow()} : [Info] : MQTT client connected`, client.id);
}

exports.Disconnected = async function (client ) {
    console.log(`${dateNow()} : [Info] : MQTT client Disconnected`);
}

exports.Published = async function (packet, client) {
    try{
        const JsonString = packet.payload.toString().replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, '');
        const JsonObj = JSON.parse(JsonString);
        console.log(`${dateNow()} : [Info] : MQTT Published >> ${JsonString}`);

        const { client, db } = await connectMongoDB();
        const collection = await db.collection("logs");
        await collection.insertOne(JsonObj);
        await client.close();

        SocketSend(`/car${JsonObj.car}`, JsonObj)

    } catch (err) {
        console.log(`${dateNow()} : [Error] : MQTT ${err}`);
    }
}

