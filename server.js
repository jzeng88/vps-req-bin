require('dotenv').config({path:__dirname+'/.env'})
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const ejs = require('ejs');

let userBins = {};

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.json());
app.use('/scripts', express.static(__dirname + '/node_modules/socket.io/client-dist/'));

const { Client } = require("pg");

app.get("/", (req, res) => {
  res.status(200).render('home');
});

app.get("/:randomkey", async (req, res) => {
  let randomKey = req.params.randomkey;

  userBins[`/${randomKey}`] = randomKey;

  const client = new Client({ 
    connectionString: process.env.DB_CONNECTIONSTRING,
    user: process.env.USER,
    password: process.env.PASSWORD
  });

  await client.connect();

  let result = await client.query(`SELECT requests.headers, requests.body, requests.date_created FROM requests JOIN identifier ON requests.random_key_id = identifier.id WHERE identifier.random_key = '${randomKey}' ORDER BY requests.date_created DESC`);

  await client.end();

  res.status(200).render('table', {requests:result.rows, url: `http://${process.env.HOST}/r/${randomKey}`});
});

io.on('connection', (socket) => {
  console.log('connected');
  let binKey;
  socket.on('binUrl', (url) => {
    let room = userBins[url];
    binKey = url;

    socket.join(room);
  })

  socket.on('disconnect', () => {
    console.log('disconnected');
    delete userBins[binKey]
  })
})


app.post("/r/:randomkey", async (req, res) => {
  let headers = JSON.stringify(req.headers);
  let randomKey = req.params.randomkey;
  
  const client = new Client({ 
    connectionString: process.env.DB_CONNECTIONSTRING,
    user: process.env.USER,
    password: process.env.PASSWORD
  });

  await client.connect();
  let randomKeyId = await client.query(`SELECT id FROM identifier WHERE random_key = '${randomKey}'`);
  
  let newReqId = (await client.query(`INSERT INTO requests (headers, random_key_id, body) VALUES ('${headers}', ${randomKeyId.rows[0].id}, '${JSON.stringify(req.body)}') RETURNING id`)).rows[0].id;

  let result = await client.query(`SELECT headers, body, date_created FROM requests WHERE id = ${newReqId}`);

  await client.end();
  
  let room = userBins[`/${randomKey}`]
  let file = __dirname + '/views/table-partial.ejs';

  ejs.renderFile(file, {request: result.rows[0]}, function(err, str){
    io.in(room).emit("message", str);
  });
  
  io.in(room).emit("animatebin");
  res.status(200).send('ASDF');
});

app.post("/create", async (req, res) => {
  let randomKey = new Date().getTime().toString(16);

  const client = new Client({ 
    connectionString: process.env.DB_CONNECTIONSTRING,
    user: process.env.USER,
    password: process.env.PASSWORD
  });

  await client.connect();
  await client.query(`INSERT INTO identifier (random_key) VALUES ('${randomKey}')`);
  await client.end();

  res.status(200).send(randomKey);
})

http.listen(process.env.PORT, () => {
  console.log(`Example app listening at port:${process.env.PORT}`);
});