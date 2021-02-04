const express = require('express');
const app = express();
const AWS = require('aws-sdk');

AWS.config.update({
    endpoint:'http://docker.for.mac.localhost:4566',
});

app.get("/", async(req, res) => {

    const docClient = new AWS.DynamoDB.DocumentClient({ 
        endpoint:'http://docker.for.mac.localhost:4566' 
    });

    const table = "Boards";

    var params = {
        TableName: table,
    };
    
    const data = await docClient.scan(params).promise()
    res.send(JSON.stringify(data))
});

app.listen(3000);
  
module.exports = app;
