const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const LorenIpsum = require('lorem-Ipsum').loremIpsum
const port = 3000
const { uuid } = require('uuidv4')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: true}))

let devcop = []

//Create a board with 3 sample notes
router.get("/", function(req, res){
    let board = {
        board_id: uuid(),
        notes: [
            {
                "text": new LorenIpsum(),
                "location":uuid(),
                "createdAt": Date.now()
            },
            {
                "text":new LorenIpsum(),
                "location":uuid(),
                "createdAt": Date.now()
            },
            {
                "text":new LorenIpsum(),
                "location":uuid(),
                "createdAt": Date.now()
            }
        ]
    }
    devcop.push(board);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(devcop));
})

//List all boards in the memory
router.get("/board", async(req, res) => {
res.send(JSON.stringify(devcop))
})