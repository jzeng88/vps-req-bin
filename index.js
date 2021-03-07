const express = require("express");
const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');

const { Client } = require("pg");

app.get("/", async (req, res) => {
  let requests = [];

  const client = new Client({ 
    connectionString: 'postgres://justin:justin@localhost:5432/requestbindb',
    user: "justin",
    password: "justin"
  });

  await client.connect();
  
  const result = await client.query('SELECT * FROM requests;');

  result.rows.forEach(request => {
    requests.push(request);
  });

  await client.end();

  res.status(200).render('requests', {requests});
});

app.post("/", async (req, res) => {
  let headers = JSON.stringify(req.rawHeaders);

  const client = new Client({ 
    connectionString: 'postgres://justin:justin@localhost:5432/requestbindb',
    user: "justin",
    password: "justin"
  });

  await client.connect();
  await client.query(`INSERT INTO requests (headers) VALUES ('${headers}')`);
  await client.end();

  res.status(200);
});


app.listen(3000, () => {
  console.log(`Example app listening at port:3000`);
});