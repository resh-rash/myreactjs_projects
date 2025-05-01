const {Pool} = require('pg');
const bcrypt = require('bcrypt');   //pswrd will be hashed in db, so using bcrypt to compare
const pool = new Pool({
  user: 'root',
  host: 'localhost',
  database: 'vocaflow',
  password: 'root',
  port: 5432,
});


//create a new task record in the database
const createTask = (body) => {
    return new Promise(function (resolve, reject) {
      const { userid, description} = body;
      console.log("task creation: ", body)
      
      pool.query(
        "INSERT INTO task (userid, description) VALUES ($1, $2) RETURNING *",
        [userid, description],
        (error, results) => {
          if (error) {
            console.log("YESS")
            reject(error);
          }
          if (results && results.rows) {
            resolve({
              message: 'A new task has been added!',
            }
            );
          } else {
            reject(new Error("No results found"));
          }
        }
      );
    });
  };

  const updateTask = (body) => {
    return new Promise(function (resolve, reject) {
      const { taskname, description, duedate, status, userid, taskid} = body;
      console.log("task updation: ", body)
      
      pool.query(
        "update task set taskname=$1, description=$2, duedate=$3, status=$4 where userid=$5 and taskid=$6",
        [taskname, description, duedate, status, userid, taskid],
        (error, results) => {
          if (error) {
            console.log("YESS")
            reject(error);
          }
          if (results && results.rows) {
            resolve({
              message: 'The task has been updated!',
            }
            );
          } else {
            reject(new Error("Task updation failed"));
          }
        }
      );
    });
  };

  const verifyUser = (body) => {
    return new Promise(function (resolve, reject) {
      const { email, pswrd} = body;
      console.log("THE BODY: ", body, email, pswrd)
      pool.query(
        "select * from users where email=$1", [email],
        (error, results) => {
          if (error) {
            console.log("YESS")
            reject(error);
          }
          if (results && results.rows.length===1) {
            const user = results.rows[0];

            // console.log("HASHED pswrd: ", user.password, body['password'])
            // const match = await bcrypt.compare(body['password'], user.pswrd);
            // if (match) {
            //   // res.status(200).json({ message: 'Login successful', userId: user.id });
            //   resolve({
            //     message: 'User verified!',
            //   });
            // } 

            if (body['password']===user.pswrd) {
              resolve({
                    message: 'User verified!', value: [user.role, user.id, user.name],
                  });
            }
            else{
              reject({
                message: 'Invalid password!',
              });
            }            
          } else {
            console.log("NO results from db", results)
            reject({
              message: 'Invalid email or password!',
            });
          }
        }
      );
    });
  };

  
  const fetchUserData = (body) => {
    return new Promise(function (resolve, reject) {
      const { uid} = body;     //here the whole body is not 'uid'. only the uid part of body is 'uid'
      console.log("THE BODY in profile: ", body, uid)
      pool.query(
        "select * from users where id=$1", [uid],
        (error, results) => {
          if (error) {
            console.log("YESS")
            reject(error);
          }
          if (results && results.rows.length===1) {
            const user = results.rows[0];
            resolve({
                message: 'Fetched user details!', value: user,
            });           
          } else {
            console.log("NO data fetched from db", results)
            reject({
              message: 'Could not fetch user data!',
            });
          }
        }
      );
    });
  };

  // const markAttendance = (body) => {
  //   return new Promise(function (resolve, reject) {
  //     const audioBytes = body.file.buffer.toString("base64");   //buffer is not defined error
  //     const { userid, username } = body;
  //     pool.query(
  //       "INSERT INTO attendance (userid, name, voice) VALUES ($1, $2, $3) RETURNING *",
  //       [userid, username, audioBytes],
  //       (error, results) => {
  //         if (error) {
  //           console.log("YESS", userid, username, file, body)
  //           reject(error);
  //         }
  //         if (results && results.rows) {
  //           resolve({
  //             message: 'Attendance has been marked: ${JSON.stringify(results.rows[0])}',
  //           }
  //           );
  //         } else {
  //           reject(new Error("Attendance couldn't be marked!"));
  //         }
  //       }
  //     );
  //   });
  // };


  module.exports = {
    createTask,
    verifyUser,
    fetchUserData,
    updateTask
  };