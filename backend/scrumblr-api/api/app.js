const express = require('express');
const app = express();
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
    endpoint:'http://docker.for.mac.localhost:4566',
});

const docClient = new AWS.DynamoDB.DocumentClient({ 
    endpoint:'http://docker.for.mac.localhost:4566' 
});

const table = "Board";                         // replace with board name coming from the frontend

app.get("/", async(req, res) => {

    var params = {
        TableName: table,
    };
    
    const data = await docClient.scan(params).promise();
    res.send(JSON.stringify(data));
});


app.post("/", async(req, res) => {

    var params = {
        TableName: table,
        Item : {
            uuid : uuidv4(),
            datetime: '26/02/2021',              // replace with date and time object
            board_name: "devcop",                // replace with board name in the url path (coming from the frontend)
            note1 : "This is my test note 6"     // replace with note(text) coming from the frontend
        }
    }
    await docClient.put(params, function (err, data){
    if (err) {
        res.status(201).send('An error occurred -> ' + err);
      } else {
        res.status(201).send('Inserted successfully');
      }
    }).promise();
});


app.listen(3000);
  
module.exports = app;
