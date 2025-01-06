const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));


const PORT = 3000;

let clients = [];
let facts = [];

app.get("/status", (req, res) => res.json({clients: clients.length}))

app.get("/events", (req, res, next) => {
  const headers = {
    'Content-Type' : 'text/event-stream',
    'Connection' : 'keep-alive',
    'Cache-Control' : 'no-cache'
  };
  res.writeHead(200, headers);
  const data = `data: ${JSON.stringify(facts)}\n\n`;
  res.write(data);
  
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  }
  clients.push(newClient);
  
  res.write(`NEW CLIENT : ${newClient.id}`)
  console.log("LIST CLIENTS: ", clients.map(client => client.id))
  
  req.on("close", () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter(client => client.id !== clientId);
    console.log("LIST CLIENTS: ", clients.map(client => client.id))
  })
})

app.post("/fact", (req, res, next) => {
  const newFact = req.body;
  facts.push(newFact);
  res.json(newFact)
  return clients.forEach(client => client.res.write(`data : ${JSON.stringify(newFact)}\n\n`))
});

app.listen(PORT, () => {
  console.log("Facts Events service listening on port", PORT)
})




