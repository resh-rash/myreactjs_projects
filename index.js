const express = require('express');
const cors = require('cors');
require("dotenv").config();
const { SpeechClient } = require("@google-cloud/speech");
const multer = require('multer');  //handle file uploads
const path=require("path");
const {Pool} = require('pg');
// const pool = require("./user_model")   // importing pool object from user_model.js
const fs = require('fs');
const app = express();
const port = 3001

app.use(cors());
process.env.GOOGLE_APPLICATION_CREDENTIALS='./wise-program-455005-a3-56f43ab0259b.json'
const pool = new Pool({
  user: 'root',
  host: 'localhost',
  database: 'vocaflow',
  password: 'root',
  port: 5432,
});
const speechClient = new SpeechClient();



                    //skeleton
// app.get('/', (req, res) => {
//   res.status(200).send('Hello World!');
// })
// app.listen(port, () => {
//   console.log(`App running on port ${port}.`)
// })

const user_model = require('./user_model')
app.use(express.json())

      // Multer storage for attendance audio uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

      // Multer storage for audio uploads
const vstorage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    const userid = req.body.id;
    cb(null, userid+Date.now()+path.extname(file.originalname))}   //cb is the callback fn, cb(error, value), value=>filename or file destination
});
const vupload = multer({ vstorage });


                    //the below lets our Express app allow requests to this app from React
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');   //from frontend
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
  next();
});

// Handle GET requests to the root URL (/) otherwise the browser will show "Cannot GET /"
app.get('/', (req, res) => {
  res.send('Welcome to the backend API!');
});

app.post('/users', vupload.single("voice"), async(req, res) => {
  console.log('Enterd to register user', req.file, req.body, req.body['name'])
 

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const voicepath=req.file ? req.file : null;
    try{
      console.log("Enterd try: ", voicepath)
      const result= await pool.query(
        "INSERT INTO users (name, id, gender, dob, email, pswrd, voice) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [req.body['name'], req.body['id'], req.body['gender'], req.body['dob'], req.body['email'], req.body['pswrd'], voicepath]);

      console.log("The result: ", result.rows)
      if (result){
        console.log("result present: ", result)
        res.status(200).json({
          message: 'A new user has been added.', user: result.rows[0]
      });
      }
    }catch(error){
      res.status(500).json({Error: "No results found"});
    }
  });


app.post('/login', (req, res) => {
    user_model.verifyUser(req.body)
    .then(response => {
      console.log("Response received from db", response)
      res.status(200).send(response);
    })
    .catch(error => {
      console.log("Error occured", error)
      res.status(500).send(error);
    })
})

app.post('/profile', (req, res) => {
    user_model.fetchUserData(req.body)
    .then(response => {
      console.log("Response received from db", response)
      res.status(200).send(response['value']);
    })
    .catch(error => {
      console.log("Error occured", error)
      res.status(500).send(error);
    })
})

app.post("/process-audio", upload.single("audio"), async (req, res) => {    //request in formData format, so need 'upload'
    console.log("started processing audio")
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const audioBytes = req.file.buffer.toString("base64");  
      const request = {
        audio: { content: audioBytes },
        config: {
          encoding: "WEBM_OPUS",
          sampleRateHertz: 48000,
          languageCode: "en-US",
        },
      }; 
      const [response] = await speechClient.recognize(request);
      const transcript = response.results.map((result) => result.alternatives[0].transcript).join(" ");

      console.log('req in attendance: ', Object.entries(req.body).length, req.body)
      const hasKey = Object.keys(req.body).some(key => key.includes('username'));
      // if (Object.entries(req.body).length<=3){
      if(hasKey===true){
        // Save transcript to PostgreSQL
        const query = "INSERT INTO attendance (userid, name, voice) VALUES ($1, $2, $3) RETURNING *";
        const values = [req.body.userid, req.body.username, transcript]; // Replace with actual user name if needed
        await pool.query(query, values);
      }   
      res.json({ transcript });         // Send transcription result
    } catch (error) {
      console.error("Error processing audio:", error);
      res.status(500).json({ error: "Speech-to-Text processing failed" });
    }
});


app.post('/tasks', (req, res) => {     //req in json format
  console.log("In tasks: ", req.body)
    user_model.createTask(req.body)
    .then(response => {
      console.log("Response received from db for task", response)
      res.status(200).send(response);
    })
    .catch(error => {
      console.log("Error occured", error)
      res.status(500).send(error);
    })
});

app.get('/attendance', (req, res) => {
  console.log("The GET request for attendance: ", req.query)
  const {uid} = req.query;     //'query' contains the uid passed in the url
  pool.query(
    "select date, status from attendance where userid=$1", [uid],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).send(error);
      }
      if (results.rowCount>=1) {
        console.log('fetched details: ', results.rows);
        res.status(200).send(results.rows);         
      } else {
        console.log("NO attendance recorded for the user");
        res.status(200).send('NO attendance recorded for the user');
        // reject({
        //   message: 'Could not fetch attendance data of the user!',
        // });
      }
    }
  );
});

app.get('/attendances', (req, res) => {
  console.log("The GET request for all attendance: ", req.query)
  pool.query(
    "select * from attendance",
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).send(error);
      }
      if (results.rowCount>=1) {
        console.log('fetched details: ', results.rows);
        res.status(200).send(results.rows);         
      } else {
        console.log("NO attendance recorded for any users");
        res.status(200).send('NO attendance recorded so far');
        // reject({
        //   message: 'Could not fetch attendance data of the user!',
        // });
      }
    }
  );
});

app.get('/task', (req, res) => {
  console.log("The GET request for task: ", req.query)
  const {uid} = req.query;     //'query' contains the uid passed in the url
  pool.query(
    "select * from task where userid=$1", [uid],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).send(error);
      }
      if (results.rowCount>=1) {
        console.log('fetched details: ', results.rows);
        res.status(200).send(results.rows);         
      } else {
        console.log("NO tasks found for the user");
        res.status(200).send('NO tasks found for the user');
      }
    }
  );
});

app.get('/alltasks', (req, res) => {
  console.log("The GET request for all tasks: ", req.query)
  pool.query(
    "select * from task",
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).send(error);
      }
      if (results.rowCount>=1) {
        console.log('fetched details: ', results.rows);
        res.status(200).send(results.rows);         
      } else {
        console.log("NO attendance recorded for any users");
        res.status(200).send('NO attendance recorded so far');
      }
    }
  );
});

app.put('/taskstatus', (req, res) => {
  const { userid, status, taskid } = req.body; //the const keywords should be that in the db
  console.log("The put request for task: ", userid, status, taskid)
  // const {uid} = req.body.userid;     //'query' contains the uid passed in the url
  // const {status} = req.body.status;
  // const {taskid} = req.body.taskid;
  pool.query(
    "update task set status=$1 where userid=$2 and taskid=$3", [status, userid, taskid],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).send(error);
      }
      else if (results) {
        console.log("results are: ", results)
        res.status(200).json({message: 'Task status updated'});         
      } else {
        res.status(404).send('Database Error while updating status');
      }
    }
  );
});
  
app.post('/taskupdate', (req, res) => {     //req in json format
  console.log("In task updation: ", req.body)
    user_model.updateTask(req.body)
    .then(response => {
      console.log("Response received from db for task updation", response)
      res.status(200).send(response);
    })
    .catch(error => {
      console.log("Error occured", error)
      res.status(500).send(error);
    })
});

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})