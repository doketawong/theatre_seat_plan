const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const { Pool } = require("pg");
const csvtojson = require('csvtojson');
const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// parse application/json
app.use(express.json());

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
      const result = await client.query(
        "INSERT INTO private_cinema () VALUES ($1)",
        [row.data]
      );
    }
    res.json({ message: "Data stored successfully" });
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

//add importAttendance
app.get("/importAttendance", async (req, res) => {
  //join attendance and private_cinema
  try {
    const client = await pool.connect();
    for (let row of req.body) {
      const result = await client.query(
        "INSERT INTO attendance () VALUES ($1)",
        [row.data]
      );
    }
    res.json({ message: "Data stored successfully" });
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

//get Cinemas
app.get("/getCinemas", cors(), async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM cinema");
    const results = { results: result ? result.rows : null };
    res.json(results);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

//get Houses
app.get("/getHouse/:houseId", cors(), async (req, res) => {
  try {
    const { houseId } = req.params;
    const client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM house WHERE house_id = $1",
      [houseId]
    );
    const results = { results: result ? result.rows : null };
    res.json(results);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

// upload new Event
const upload = multer({ dest: "uploads/" });
app.post("/uploadEvent", upload.single("file"), async (req, res) => {
  try {
    const { eventName, eventDate, houseId } = req.body;
    const file = req.file;
    let fileContent = "";

    if (file) {
      fileContent = await csvtojson().fromFile(file.path);
      fs.unlinkSync(file.path); // delete the file after reading its content
    }
    const client = await pool.connect();

    const insertEventQuery = `
      INSERT INTO event (event_name, event_date, house_id, guest_data)
      VALUES ($1, $2, $3, $4)`;

    const values = [eventName, eventDate, houseId, JSON.stringify(fileContent)];

    const result = await client.query(insertEventQuery, values);

    client.release();
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// get Event
app.get("/getEvent/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const client = await pool.connect();

    const getEventQuery = `
      SELECT * FROM event
      WHERE event_id = $1;
    `;

    const values = [eventId];

    const result = await client.query(getEventQuery, values);

    client.release();
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

//get house by event id
app.get("/getSeatByEventId/:eventId", cors(), async (req, res) => {
  try {
    const { eventId } = req.params;
    const client = await pool.connect();
    const result = await client.query(
      "select * from house h left join event e on h.house_id = e.house_id where e.event_id = $1",
      [eventId]
    );
    const results = { results: result ? result.rows : null };
    res.json(results);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

// update event seating plan
app.post("/updateEventSeatingPlan/:eventId", cors(), async (req, res) => {
  try {
    const { eventId } = req.params;
    const seatingPlan  = JSON.stringify(req.body);
    const client = await pool.connect();
    const result = await client.query(
      "UPDATE event SET seating_plan = $1 WHERE event_id = $2",
      [seatingPlan, eventId]
    );
    res.json({ status: 'success', message: 'Seating plan updated successfully' });
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
