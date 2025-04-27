const mqtt = require('mqtt');
const config = require('../config')
const moment = require('moment-timezone');
const { MongoClient } = require('mongodb');

module.exports.dateNow = () => {
    try {
        return moment().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss.SSS');
    } catch (error) {
        console.log(`${module.exports.dateNow()} : [Error] : ${err}`);
    }
}

module.exports.connectMongoDB = async () => {
    try {
        const client = new MongoClient(config.dbSettings.host, {
            auth: {
                username: config.dbSettings.username,
                password: config.dbSettings.password,
            },
            authSource: config.dbSettings.database,
        });

        await client.connect();
        const db = client.db(config.dbSettings.database);
        return { client, db };
    }
    catch (err) {
        console.log(`${module.exports.dateNow()} : [Error] : ${err}`);
        await client.close();
    }
}

module.exports.authentication = async (req) => {
    try {
        const authorization = req.headers['authorization'];
        const base64Credentials = authorization.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const user_req = credentials.split(':')[0];
        const pass_req = credentials.split(':')[1];

        const { client, db } = await module.exports.connectMongoDB();
        const collection = await db.collection("users");
        const data = await collection.find({ "user": user_req }).toArray();
        const user_db = data[0].user;
        const pass_db = data[0].password;
        await client.close();

        if (user_req == user_db && pass_req == pass_db) {
            return true;
        }
        return false;
    }
    catch (err) {
        console.log(`${module.exports.dateNow()} : [Error] : ${err}`);
        return false;
    }
}

module.exports.publishCmd = async (req) => {
    try {
        const carID = req.body.car;
        const topic = `/car${carID}`
        const message = JSON.stringify(req.body);
        const authorization = req.headers['authorization'];
        const base64Credentials = authorization.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const user_req = credentials.split(':')[0];


        const { db } = await module.exports.connectMongoDB();
        const collection = await db.collection("users");
        const data = await collection.find({ "user": user_req }).toArray();
        const user_db = data[0].user;
        const pass_db = data[0].password;

        const client = mqtt.connect(`mqtt://localhost:${config.serverSettings.mqttPort}`, {
            username: user_db,
            password: pass_db,
        })
        client.on('connect', () => {
            client.publish(topic, message)
            client.end();
        })
    } catch (err) {
        console.log(`${module.exports.dateNow()} : [Error] : ${err}`);
    }
}

async function connectMongoDB() {
    try {
        const client = new MongoClient(config.dbSettings.host, {
            auth: {
                username: config.dbSettings.username,
                password: config.dbSettings.password,
            },
            authSource: config.dbSettings.database,
        });

        await client.connect();
        global.db = client.db(config.dbSettings.database);
    } catch (error) {
        console.log(`${module.exports.dateNow()} : [Error] : ${err}`);
    }
}

connectMongoDB();