require('dotenv').config({path:__dirname+'/.env'})
const express = require("express");
const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(express.json());

const { Client } = require("pg");

app.get("/", (req, res) => {
  res.status(200).render('title');
});

app.get("/:randomkey", async (req, res) => {
  let randomKey = req.params.randomkey;

  const client = new Client({ 
    connectionString: process.env.DB_CONNECTIONSTRING,
    user: process.env.USER,
    password: process.env.PASSWORD
  });

  await client.connect();

  let result = await client.query(`SELECT requests.headers, requests.body, requests.date_created FROM requests JOIN identifier ON requests.random_key_id = identifier.id WHERE identifier.random_key = '${randomKey}'`);

  await client.end();

  res.status(200).render('table', {requests:result.rows, url: `http://${process.env.HOST}/r/${randomKey}`});
});


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
  
  await client.query(`INSERT INTO requests (headers, random_key_id, body) VALUES ('${headers}', ${randomKeyId.rows[0].id}, '${JSON.stringify(req.body)}')`);
  await client.end();

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

app.listen(process.env.PORT, () => {
  console.log(`Example app listening at port:${process.env.PORT}`);
});