const {MongoClient} = require('mongodb');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url); 
const databaseName = 'Constitution_App';

async function dbConnection4(){
    let result = await client.connect();
    const db = result.db(databaseName);
    return  db.collection('messages');
}

module.exports = dbConnection4;