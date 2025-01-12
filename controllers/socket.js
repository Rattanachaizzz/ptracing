const { dateNow } = require('../funtions/index');
const { connectMongoDB } = require('../funtions/index');

exports.SocketSend = async function (path, message) {
    try {
        const { clients } = require('../server.js');
        var _car = parseInt(message.car);
        var _latitude = lat(message.lat);
        var _longitude = lon(message.lon);
        var _speed = speed(message.speed);
        var _x = x(message.x);
        var _y = y(message.y);
        var _z = z(message.z);
        var _lambda = lambda(message.lambda);
        var _map = map(message.map);
        var _la_less_than = await la_less_than(parseInt(message.car));
        var _duration = await duration(parseInt(message.car));
        var _name = message.name;
        var _description = message.description;
            // await record(parseInt(message.car)),
            // await count(parseInt(message.car)),
            // await warning(parseInt(message.car)),

        //check car stop?    
        if(_speed === 0) {
            //update calibates collection
            const { client, db } = await connectMongoDB();
            const collection = await db.collection("calibates");
            const filterData = { car : _car };
            const updateData = { $set: { x : x(message.x), y :  y(message.y), z: y(message.z), timeStamp : dateNow() } };
            await collection.updateMany( filterData,updateData);
            await client.close();
        } 

        //caribate x, y, z
        const { client, db } = await connectMongoDB();
        const collection = await db.collection("calibates");
        const caribate_data =  await collection.find({}).toArray();;
        await client.close();
        _x = _x - caribate_data[0].x
        _y = _y - caribate_data[0].y
        _z = _z - caribate_data[0].z

        
        //check _lambda
        // if(_lambda < _la_less_than) {

        // } else {
        //     //update realtime collection
        //     const { client, db } = await connectMongoDB();
        //     const collection = await db.collection("realtime");
        //     const filterData = { car : carId };
        //     const updateData = { $set: { lambda : _lambda, count :  0, record: 0, status : false, time_start : "", time_end : ""} };
        //     await collection.updateMany( filterData,updateData);
        //     await client.close();
        // } 


        // message = [
        //     _car,
        //     _latitude,
        //     _longitude,
        //     _speed,
        //     _x,
        //     _y,
        //     _z,
        //     _lambda,
        //     _map,
        //     _la_less_than,
        //     _duration,
        //     await record(parseInt(message.car)),
        //     await count(parseInt(message.car)),
        //     await warning(parseInt(message.car)),
        //     _name,
        //     _description
        // ]

        // if (clients.has(path)) {
        //     clients.get(path).forEach((client) => {
        //         if (client.readyState === client.OPEN) {
        //             client.send(message.toString());
        //         }
        //     });
        // }

        message = {
            "_car" : _car,
            "_latitude" : _latitude,
            "_longitude" :_longitude,
            "_speed" : _speed,
            "_x" : _x,
            "_y" : _y,
            "_z" : _z,
            "_lambda" : _lambda,
            "_map" : _map,
            "_la_less_than":_la_less_than,
            "_duration" : _duration,
            "_record" : record(parseInt(message.car)),
            "count" : count(parseInt(message.car)),
            "warning" : warning(parseInt(message.car)),
            "_name" :_name,
            "_description" : _description
        }

        if (clients.has(path)) {
            clients.get(path).forEach((client) => {
                if (client.readyState === client.OPEN) {
                    client.send(JSON.stringify(message));
                }
            });
        }

    } catch (error) {
        console.log(`${dateNow()} : [Error] : MQTT ${error}`);
    }
}

function roundToTwo(num) {
    return +(Math.round(num + "e+2") + "e-2");
}

function roundToOne(num) {
    return +(Math.round(num + "e+1") + "e-1");
}

function lat(value) {
    try {
        if (value == "") {
            return 0;
        } else if (value == null) {
            return 0;
        } else if (value == undefined) {
            return 0;
        } else {
            return parseFloat(value)
        }
    } catch (error) {
        console.log(`${dateNow()} : [Error] : MQTT ${error}`);
    }
}

function lon(value) {
    try {
        if (value == "") {
            return 0;
        } else if (value== null) {
            return 0;
        } else if (value == undefined) {
            return 0;
        } else {
            return parseFloat(value)
        }
    } catch (error) {
        console.log(`${dateNow()} : [Error] : MQTT ${error}`);
    }
}

function speed(value) {
    try {
        if (value == "") {
            return 0;
        } else if (value == null) {
            return 0;
        } else if (value == undefined) {
            return 0;
        } else {
            let speed = roundToTwo(parseFloat(value) * 1.852);
            if (speed <= 5.5) {
                return 0;
            } else {
                return speed;
            }
        }
    } catch (error) {
        console.log(`${dateNow()} : [Error] : MQTT ${error}`);
    }
}

function x(value) {
    try {
        let x = value / 1000.0;
        return x;
    } catch (error) {
        console.log(`${dateNow()} : [Error] : MQTT ${error}`);
    }
}

function y(value) {
    try {
        let y = value / 1000.0
        return y;
    } catch (error) {
        console.log(`${dateNow()} : [Error] : MQTT ${error}`);
    }
}

function z(value) {
    try {
        let z = (value / 1000.0) + 0.98;
        return z;
    } catch (error) {
        console.log(`${dateNow()} : [Error] : MQTT ${error}`);
    }
}

function lambda(value) {
    let lambda = roundToTwo(value);
    return lambda;
}

function map(value) {
    let map = roundToOne(parseFloat(value))
    return map;
}

async function la_less_than(car_id){
    try {
        const { client, db } = await connectMongoDB();
        const collection = await db.collection("configurations");
        const filterData = { 
            car : car_id , 
        };
        const data =  await collection.find(filterData).toArray();
        await client.close();
        return data[0].lambda
    } catch (error) {
        console.log(`${dateNow()} : [Error] : MQTT ${error}`);
    }
}

async function duration(car_id){
    try {
        const { client, db } = await connectMongoDB();
        const collection = await db.collection("configurations");
        const filterData = { 
            car : car_id , 
        };
        const data =  await collection.find(filterData).toArray();;
        await client.close();
        return data[0].duration
    } catch (error) {
        console.log(`${dateNow()} : [Error] : MQTT ${error}`);
    }
}

async function record(car_id){
    try {
        const { client, db } = await connectMongoDB();
        const collection = await db.collection("realtime");
        const filterData = { 
            car : car_id , 
        };
        const data =  await collection.find(filterData).toArray();;
        await client.close();
        return data[0].record
    } catch (error) {
        console.log(`${dateNow()} : [Error] : MQTT ${error}`);
    }
}

async function count(car_id){
    try {
        const { client, db } = await connectMongoDB();
        const collection = await db.collection("realtime");
        const filterData = { 
            car : car_id , 
        };
        const data =  await collection.find(filterData).toArray();;
        await client.close();
        return data[0].count
    } catch (error) {
        console.log(`${dateNow()} : [Error] : MQTT ${error}`);
    }
}

async function warning(car_id){
    try {
        const { client, db } = await connectMongoDB();
        const collection = await db.collection("realtime");
        const filterData = { 
            car : car_id , 
        };
        const data =  await collection.find(filterData).toArray();;
        await client.close();
        return data[0].warning
    } catch (error) {
        console.log(`${dateNow()} : [Error] : MQTT ${error}`);
    }
}


// try {
        
// } catch (error) {
//     console.log(`${dateNow()} : [Error] : MQTT ${error}`);
// }