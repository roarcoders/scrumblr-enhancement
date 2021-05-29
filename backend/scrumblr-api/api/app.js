const express = require('express');
const app = express();
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'ap-southeast-2',
    endpoint:'http://docker.for.mac.localhost:4566' 
});

const table = "DevCop";                         // replace with board name coming from the frontend

app.get("/", async(req, res) => {

    let params = {
        TableName: table,
    };
    
    const data = await docClient.scan(params).promise();
    res.send(JSON.stringify(data));
});


app.post("/", async(req, res) => {
 
    //et textForNotes = ['zero', 'one', 'two', 'three'];

    // prepare notes for insertion in dynamodb
    //for (let i = 0; i < textForNotes.length; i++){
        
        let params = {
            RequestItems:{
                "DevCop": [
                    {
                        "PutRequest": {
                            "Item": {
                                "board_id": {
                                    "S": uuidv4().toString
                                },
                                "note_id": {
                                    "S": uuidv4().toString
                                }
                            }
                        }
                     },
                     {
                        "PutRequest": {
                            "Item": {
                                "board_id": {
                                    "S": uuidv4().toString
                                },
                                "note_id": {
                                    "S": uuidv4().toString
                                }
                            }
                        }
                    }
                ]
            }
    };
        
        // TableName: table,
        // Item : {
        //     BoardId : uuidv4(),
        //     NoteId: uuidv4(),
        //     DateTime: '12/12/12', // replace with date and time object
        //     NoteText : textForNotes[i]  // replace with note(text) coming from the frontend
        // }
    
        await docClient.batchWrite(params, function (err, data){
            console.log(data)
        if (err) {
            res.status(500).send('An error occurred -> ' + err);
        } else {
            res.status(201).send('Inserted successfully ' +  data);
        }
    
    }).promise();
    
});


app.listen(3000);
  
module.exports = app;