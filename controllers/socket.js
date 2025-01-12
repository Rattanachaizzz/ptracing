const { dateNow } = require('../funtions/index');
const { connectMongoDB } = require('../funtions/index');

exports.SocketSend = async function (path, message) {
    try {
        const { clients } = require('../server.js');
        message = [
            parseInt(message.car),
            lat(message.lat),
            lon(message.lon),
            speed(message.speed),
            x(message.x),
            y(message.y),
            z(message.z),
            lambda(message.lambda),
            map(message.map),
            await la_less_than(parseInt(message.car)),
            await duration(parseInt(message.car)),
            await record(parseInt(message.car)),
            await count(parseInt(message.car)),
            await warning(parseInt(message.car)),
            message.name,
            message.description
        ]

        if (clients.has(path)) {
            clients.get(path).forEach((client) => {
                if (client.readyState === client.OPEN) {
                    client.send(message.toString());
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
        let z = value / 1000.0;
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