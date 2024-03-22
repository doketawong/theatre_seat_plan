const express = require("express");
const { Pool } = require("pg");
const app = express();
const port = process.env.PORT || 5000;

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "moviematic",
  user: "postgres",
  password: "postgres",
});

app.get("/api/hello", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM review");
    const results = { results: result ? result.rows : null };
    res.json(results);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

app.get("/uploadSeatingPlan", async (req, res) => {
  try {
    const client = await pool.connect();
    for (let row of req.body) {
      const result = await client.query('INSERT INTO private_cinema () VALUES ($1)', [row.data]);
    }
    res.json({ message: 'Data stored successfully' });
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
