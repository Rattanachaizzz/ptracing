const { json } = require('express');
const { dateNow } = require('../funtions/index');
const { connectMongoDB, authentication, publishCmd} = require('../funtions/index');
const { Parser } = require("json2csv");

exports.UpdateConfig = async function (req, res) {
    try {
        console.log(`${dateNow()} : [Info] : API(UpdateConfig) >> ${JSON.stringify(req.body)}`);
        const auth = await authentication(req);
        if(!auth){
           return res.status(401).send("Unauthorized");
        }
        const cars = req.body.truck;
        const lambda = req.body.la_less_than;
        const duration = req.body.duration;
        const { client, db } = await connectMongoDB();
        const collection = await db.collection("configurations");
        const filterData = { $or: cars.map(car => ({ car }))};
        const updateData = { $set: { lambda : lambda, duration: duration } };
        await collection.updateMany( filterData,updateData);
        await client.close();
        res.status(200).send("Update Configurations Success!");
    } catch (err) {
        console.log(`${dateNow()} : [Error] : ${err}`);
        res.status(500).send(err);
    }
}

exports.CalibateGforce = async function (req, res) {
    try {
        console.log(`${dateNow()} : [Info] : API(UpdateConfig) >> ${JSON.stringify(req.body)}`);
        const auth = await authentication(req);
        if(!auth){
           return res.status(401).send("Unauthorized");
        }
        const cars = req.body.truck;
        const { client, db } = await connectMongoDB();
        const collection = await db.collection("calibates");
        const filterData = { $or: cars.map(car => ({ car }))};
        await collection.deleteMany(filterData);
        await client.close();
        res.status(200).send(`Calibate Gforce of truck ${cars} Success!`);
    } catch (err) {
        console.log(`${dateNow()} : [Error] : ${err}`);
        res.status(500).send(err);
    }
}

exports.ResetLambdaCount = async function (req, res) {
    try {
        console.log(`${dateNow()} : [Info] : API(ResetLambdaCount) >> ${JSON.stringify(req.body)}`);
        const auth = await authentication(req);
        if(!auth){
           return res.status(401).send("Unauthorized");
        }
        const cars = req.body.truck;
        const { client, db } = await connectMongoDB();
        const collection = await db.collection("realtime");
        const filterData = { $or: cars.map(car => ({ car }))};
        const updateData = { $set: { record : 0, count: 0, warning:0, time_start : "", time_end: "", status: "false" } };
        await collection.updateMany( filterData,updateData);
        await client.close();
        res.status(200).send("Reset Lambda Count Success!");
    } catch (err) {
        console.log(`${dateNow()} : [Error] : ${err}`);
        res.status(500).send(err);
    }
}

exports.Reports = async function (req, res) {
    try {
        console.log(`${dateNow()} : [Info] : API(Reports) >> ${JSON.stringify(req.body)}`);
        const auth = await authentication(req);
        if(!auth){
           return res.status(401).send("Unauthorized");
        }

        const cars = req.body.car;
        const start_datetime = req.body.start_datetime;
        const end_datetime = req.body.end_datetime;
        const { client, db } = await connectMongoDB();
        const collection = await db.collection("logs");
        const filterData = { 
            car : cars , 
            timeStamp: {
                $gte: new Date(start_datetime),
                $lte: new Date(end_datetime)
            }
        };
        const _data =  await collection.find(filterData).toArray();
        await client.close();

        const fields = ["timeStamp", "car", "date", "time", "lat", "lon", "speed", "x", "y", "z", "lambda", "map", "mac"];
        const opts = { fields };
        const parser = new Parser(opts);
        const csv = parser.parse(_data);

        res.header("Content-Type", "text/csv");
        res.header("Content-Disposition", "attachment; filename=logs.csv");
        res.status(200).send(csv);
    } catch (err) {
        console.log(`${dateNow()} : [Error] : ${err}`);
        res.status(500).send(err);
    }
}

exports.SetDetail = async function (req, res) {
    try {
        console.log(`${dateNow()} : [Info] : API(SetDetail) >> ${JSON.stringify(req.body)}`);
        const auth = await authentication(req);
        if(!auth){
           return res.status(401).send("Unauthorized");
        }
        const cars = req.body.cars;
        const name = req.body.name;
        const description = req.body.description;
        const cmd = req.body.cmd;

        const { client, db } = await connectMongoDB();
        const collection = await db.collection("configurations");
        const filterData = { car : cars };
        const updateData = { $set: { name : name, description: description} };
        await collection.updateOne( filterData,updateData);
        await client.close();
        publishCmd(req)
        res.status(200).send("SetDetail Success!");
    } catch (err) {
        console.log(`${dateNow()} : [Error] : ${err}`);
        res.status(500).send(err);
    }
}

exports.GetAllCar = async function (req, res) {
    try {
        console.log(`${dateNow()} : [Info] : API(GetAllCar) >> >> ${JSON.stringify(req.body)}`);
        const auth = await authentication(req);
        if(!auth){
           return res.status(401).send("Unauthorized");
        }
        
        const { client, db } = await connectMongoDB();
        const collection = await db.collection("configurations");
        const _data =  await collection.find({}).toArray();;
        await client.close();
        res.status(200).send(_data);
    } catch (err) {
        console.log(`${dateNow()} : [Error] : ${err}`);
        res.status(500).send(err);
    }
}


