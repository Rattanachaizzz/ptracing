let { default: start } = require('mqtt/bin/pub');
let { dateNow } = require('../funtions/index');
let { connectMongoDB } = require('../funtions/index');
const { name } = require('../config/index.js');

exports.SocketSend = async function (path, message) {
    try {
        let { clients } = require('../server.js');
        var _car = parseInt(message.car);
        var _latitude = lat(message.lat);
        var _longitude = lon(message.lon);
        var _speed = speed(message.speed);
        var _x = x(message.x);
        var _y = y(message.y);
        var _z = z(message.z);
        var _lambda = await lambda(message.lambda);
        var _map = await map(message.map);
        var _la_less_than = await la_less_than(_car);
        var _duration = await duration(_car);
        var _name = '"' + message.name + '"';
        var _description = '"' + message.description + '"';
    
        //check car stop?    
        if (_speed === 0) {
            //update calibates collection
            let collection = await db.collection("calibates");
            let filterData = { car: _car };
            let updateData = { $set: { x: x(message.x), y: y(message.y), z: y(message.z), timeStamp: dateNow() } };
            res = await collection.updateMany(filterData, updateData);
            if (res.modifiedCount === 0) {
                collection = await db.collection("calibates");
                let insertData = { car: _car, x: x(message.x), y: y(message.y), z: y(message.z), timeStamp: dateNow() };
                await collection.insertOne(insertData);
            }
        }

        //caribate x, y, z
        collection = await db.collection("calibates");
        let caribate_data = await collection.find({}).toArray();;
        _x = _x - caribate_data[0].x
        _y = _y - caribate_data[0].y
        _z = _z - caribate_data[0].z

        //check _lambda
        if (_lambda < _la_less_than) {
            let collection = await db.collection("realtime");
            let filterData = { car: _car };
            let _data = await collection.find(filterData).toArray();
            if (_data[0].status === true) {
                //update realtime collection
                let collection = await db.collection("realtime");
                let filterData = { car: _car };
                let updateData = { $set: { lambda: _lambda, time_end: dateNow(), status: true , name : _name, description : _description } };
                await collection.updateMany(filterData, updateData);

                //check record
                let _record = await record(_car);
                if (_record === _duration) {
                    //update realtime collection
                    let collection = await db.collection("realtime");
                    let filterData = { car: _car };
                    let updateData = { $set: { lambda: _lambda, record : 0, time_start: dateNow(), name : _name, description : _description} };
                    await collection.updateMany(filterData, updateData);
                }

                // //check count
                let _count = await count(_car);
                if (_count === 3) {
                    //update realtime collection
                    let collection = await db.collection("realtime");
                    let filterData = { car: _car };
                    let updateData = { $set: { count: 0 , name : _name, description : _description} };
                    await collection.updateMany(filterData, updateData);
                }

                // //check time diff
                updateData = null;
                // updateData = { $set: { record: 0, count: 0, warning: 0, time_start: "", time_end: "", status: false } };
                let timeDiff = await time_diff(_car)
                if (timeDiff < 1 ) {
                    updateData = { $set: { record: 0, name : _name, description : _description} };
                } else if ((timeDiff >= 1) && (timeDiff < 2)) {
                    updateData = { $set: { record: 1, name : _name, description : _description } };
                } else if ((timeDiff >= 2) && (timeDiff < 3)) {
                    updateData = { $set: { record: 2, name : _name, description : _description } };
                } else if ((timeDiff >= 3) && (timeDiff < 4)) {
                    updateData = { $set: { record: 3, name : _name, description : _description } };
                } else {
                    updateData = { $set: { record: 0, count: 0, time_start: "", time_end: "", status: false, name : _name, description : _description } };
                }

                //record++
                collection = await db.collection("realtime");
                filterData = { car: _car };
                await collection.updateMany(filterData, updateData);

                //count++
                _record = await record(_car);
                if (_record >= _duration) {
                    //update realtime collection
                    let collection = await db.collection("realtime");
                    let filterData = { car: _car };
                    let updateData = { $set: { lambda: _lambda, name : _name, description : _description}, $inc: { count: 1 } };
                    await collection.updateMany(filterData, updateData);
                }

                //warning++
                _count = await count(_car);
                if (_count === 3) {
                    //update realtime collection
                    let collection = await db.collection("realtime");
                    let filterData = { car: _car };
                    let updateData = { $set: { lambda: _lambda, name : _name, description : _description}, $inc: { warning: 1 } };
                    await collection.updateMany(filterData, updateData);
                }

            } else {
                //update realtime collection
                let collection = await db.collection("realtime");
                let filterData = { car: _car };
                let updateData = { $set: { lambda: _lambda, time_start: dateNow(), time_end: "", status: true, name : _name, description : _description } };
                await collection.updateMany(filterData, updateData);
            }
        } else {
            //update realtime collection
            let collection = await db.collection("realtime");
            let filterData = { car: _car };
            let updateData = { $set: { lambda: _lambda, time_start: "", time_end: "", status: false, record: 0, count: 0, name : _name, description : _description} };
            await collection.updateMany(filterData, updateData);
        }

        //Create message
        message = [
            _car,
            _latitude,
            _longitude,
            _speed,
            _x,
            _y,
            _z,
            _lambda,
            _map,
            _la_less_than,
            _duration,
            await record(_car),
            await count(_car),
            await warning(_car),
            _name,
            _description
        ]

        //Published To WebSocket Client
        message = msgFormat(message)
        if (clients.has(path)) {
            clients.get(path).forEach((client) => {
                if (client.readyState === client.OPEN) {
                    client.send(message);
                }
            });
        }
    } catch (error) {
        console.log(`${dateNow()} : [Error] : SOCKET ${error}`);
    }
}

function msgFormat(message) {
    try {
        message = `[${message[0]},${message[1]},${message[2]},${message[3]},${message[4]},${message[5]},${message[6]},${message[7]},${message[8]},${message[9]},${message[10]},${message[11]},${message[12]},${message[13]},${message[14]},${message[15]}]`
        console.log(`${dateNow()} : [sent] : Publice to WebSocket topic /car${message[1]} ${message}`)
        return message
    } catch (error) {
        console.log(`${dateNow()} : [Error] : SOCKET ${error}`);
    }
}

function roundToTwo(num) {
    try {
        return +(Math.round(num + "e+2") + "e-2");
    } catch (error) {
        console.log(`${dateNow()} : [Error] : SOCKET ${error}`);
    }
}

function roundToOne(num) {
    try {
        return +(Math.round(num + "e+1") + "e-1");
    } catch (error) {
        console.log(`${dateNow()} : [Error] : SOCKET ${error}`);
    }
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
        console.log(`${dateNow()} : [Error] : SOCKET ${error}`);
    }
}

function lon(value) {
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
        console.log(`${dateNow()} : [Error] : SOCKET ${error}`);
    }
}

function x(value) {
    try {
        let x = value / 1000.0;
        return x;
    } catch (error) {
        console.log(`${dateNow()} : [Error] : SOCKET ${error}`);
    }
}

function y(value) {
    try {
        let y = value / 1000.0
        return y;
    } catch (error) {
        console.log(`${dateNow()} : [Error] : SOCKET ${error}`);
    }
}

function z(value) {
    try {
        let z = (value / 1000.0) + 0.98;
        return z;
    } catch (error) {
        console.log(`${dateNow()} : [Error] : SOCKET ${error}`);
    }
}

function lambda(value) {
    try {
        if (value > 0) {
            let lambda = roundToTwo(value);
            return lambda;
        }
        else {
            return 0;
        }
    } catch (error) {
        console.log(`${dateNow()} : [Error] : SOCKET ${error}`);
    }
}

function map(value) {
    try {
        let map = roundToOne(parseFloat(value))
        return map;
    } catch (error) {
        console.log(`${dateNow()} : [Error] : SOCKET ${error}`);
    }
}

async function la_less_than(car_id) {
    try {
        let collection = await db.collection("configurations");
        let filterData = {
            car: car_id,
        };
        let data = await collection.find(filterData).toArray();
        return data[0].lambda
    } catch (error) {
        console.log(`${dateNow()} : [Error] : SOCKET ${error}`);
    }
}

async function duration(car_id) {
    try {
        let collection = await db.collection("configurations");
        let filterData = {
            car: car_id,
        };
        let data = await collection.find(filterData).toArray();;
        return data[0].duration
    } catch (error) {
        console.log(`${dateNow()} : [Error] : SOCKET ${error}`);
    }
}

async function record(car_id) {
    try {
        let collection = await db.collection("realtime");
        let filterData = {
            car: car_id,
        };
        let data = await collection.find(filterData).toArray();;
        return data[0].record
    } catch (error) {
        console.log(`${dateNow()} : [Error] : SOCKET ${error}`);
    }
}

async function count(car_id) {
    try {
        let collection = await db.collection("realtime");
        let filterData = {
            car: car_id,
        };
        let data = await collection.find(filterData).toArray();;
        return data[0].count
    } catch (error) {
        console.log(`${dateNow()} : [Error] : SOCKET ${error}`);
    }
}

async function warning(car_id) {
    try {
        let collection = await db.collection("realtime");
        let filterData = {
            car: car_id,
        };
        let data = await collection.find(filterData).toArray();;
        return data[0].warning
    } catch (error) {
        console.log(`${dateNow()} : [Error] : SOCKET ${error}`);
    }
}

async function time_diff(car_id) {
    try {
        let collection = await db.collection("realtime");
        let filterData = { car: car_id };
        let data = await collection.find(filterData).toArray();
        let time_start = new Date(data[0].time_start);
        let time_end = new Date(data[0].time_end);
        let time_diff_sec = (time_end.getTime() - time_start.getTime()) / 1000;
        return time_diff_sec
    } catch (error) {
        console.log(`${dateNow()} : [Error] : SOCKET ${error}`);
    }
}