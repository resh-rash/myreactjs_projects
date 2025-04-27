import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; 


const Dashboard = () => {
    const udata = useParams();    //the variable should match with the url variable given in the project.js(uid)
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    let [userdata, setData]=useState()
    const navigate = useNavigate();
    const [isrole, setRole] = useState(true)
    const [showPopup, setShowPopup] = useState(false);
    const [taskShowPopup, settaskShowPopup] = useState(false)
    const [tasktext, settaskText]=useState('');


    useEffect(() => {
        if (udata.urole==='A'){
            setRole(false)
        }
        const fetchUserDataClient = async(e) => {
            e.preventDefault(); 
    
            try {
                const response = await fetch('http://localhost:3001/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify(udata), 
                });
            
                if (response.ok) {
                    const result = await response.json();
                    setData(result);  
                    localStorage.setItem('userdata', JSON.stringify(result));  // Store data in localStorage
                    navigate('/profile');
                } 
                else {
                    const errorResult = await response.json();
                    setError(errorResult.message || 'Could not fetch data');
                }
            } catch (err) {
                console.error('Error:', err);
                setError('An error occurred. Please try again later.');
            }            
        };
    }, []);

    const pathNavigator=() => {
        navigate(`/usrdashboard/${udata.urole}/${udata.uid}/${udata.uname}`);
    };

    const AttendancePopup= ({ onClose }) => {
        const [isRecording, setisRecording] = useState(false);
        const [text, setText]=useState('');
        const mediaRecorderRef=useRef(null);
        const audioChunksRef = useRef([]);
        const [recordingTime, setRecordingTime]=useState(0);  
        const [audioURL, setAudioURL] =useState(null);  
        const timerRef = useRef(null);

        const startRecording = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];

                mediaRecorderRef.current.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                    }
                };
                mediaRecorderRef.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                    const formData = new FormData();

                    //generate an audiourl for playback
                    const url=URL.createObjectURL(audioBlob);
                    setAudioURL(url)

                    formData.append("audio", audioBlob, "attendance.webm");
                    formData.append('userid', udata.uid)
                    formData.append('username', udata.uname)
            
                    const response = await fetch("http://localhost:3001/process-audio", {
                    method: "POST",
                    body: formData,
                    });
                    const data = await response.json();
                    setText(data.transcript);
                };
                mediaRecorderRef.current.start();   
                setisRecording(true);

                setRecordingTime(0); 
                timerRef.current = setInterval(() => {
                    setRecordingTime(prev => prev + 1);
                }, 1000);

            } catch (error) {
                console.error("Error starting recording:", error);
            }
        };

        const stopRecording = () => {
            if (mediaRecorderRef.current) {
              mediaRecorderRef.current.stop();
              setisRecording(false);
              clearInterval(timerRef.current);  
            }
        };

        return (
            <div className="popup">
              <div className="popup-content">
                <p>say your ID aloud! (eg: if userid=123, say, one two three)</p>
                <button onClick={startRecording} disabled={isRecording}>Start Recording</button>
                <button onClick={stopRecording} disabled={!isRecording}>Stop Recording</button>
                {isRecording && <p>Recording Time: {recordingTime}s</p>}
                {audioURL && (
                    <div>
                        <p>recorded audio:</p>
                        <audio controls src={audioURL}></audio>
                    </div>
                )}    {/*for the user to play the recorded audion b4 sending */}
                {text && <p>Recognized Text: {text}</p>}
                <button onClick={onClose}>Close</button>
              </div>
            </div>
        );
    };

    const handleSubmit= async(e) => {
        e.preventDefault();
        const data = {
            userid: udata.uid,
            description: tasktext
        };      

        try {
            // Send POST request to the backend API 
            const response = await fetch('http://localhost:3001/tasks', { 
                method: "POST",
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (response.ok) {
                
                setSuccessMessage('New Task Added!', result);
                settaskText('');
            } 
            else {
                const errorResult = await response.json();
                setError(errorResult.message || 'Something went wrong, please try again.');
            }
        } catch (err) {
            console.error('Error during creating task:', err);
            setError('An error occurred. Please try again later.');
        }
    };

    const TaskPopup= ({ onClose }) => {
        const [isRecording, setisRecording] = useState(false);
        const [showOption, setshowOption] = useState(false);
        const mediaRecorderRef=useRef(null);
        const audioChunksRef = useRef([]);
        const [recordingTime, setRecordingTime]=useState(0); 
        const [audioURL, setAudioURL] =useState(null);  
        const timerRef = useRef(null);
        

        const startRecording = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];
    
                mediaRecorderRef.current.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorderRef.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                    const url=URL.createObjectURL(audioBlob);
                    setAudioURL(url)
                    const formData = new FormData();
                    formData.append("audio", audioBlob, "task.webm");
                    formData.append('userid', udata.uid)
            
                    const response = await fetch("http://localhost:3001/process-audio", {
                        method: "POST",
                        body: formData,
                    });
                    const data = await response.json();
                    settaskText(data.transcript);
                    
                };
                mediaRecorderRef.current.start();   
                setisRecording(true);
    
                setRecordingTime(0);  
                timerRef.current = setInterval(() => {
                    setRecordingTime(prev => prev + 1);
                }, 1000);
    
            } catch (error) {
                console.error("Error starting recording:", error);
            }
        };
    
        const stopRecording = () => {
            if (mediaRecorderRef.current) {
              mediaRecorderRef.current.stop();
              setisRecording(false);
              clearInterval(timerRef.current); 
            }
        };
    
        return (
            <div className="popup" >
              <div className="popup-content">
                <button onClick={() => setshowOption(true)} disabled={showOption}>I'll describe</button> {/*soln for 'too many rerenders': don't directly put setshowoption as true in the jsx form or outside the event handler.*/}
                <button onClick={() => setshowOption(false)} disabled={!showOption}>I'll text</button>
                <button className='m-2' onClick={onClose}>Close</button>                
                {showOption===true? <>
                    <div>
                        <p>Describe the task you want to create!</p>
                        <button onClick={startRecording} disabled={isRecording}>Start Recording</button>
                        <button onClick={stopRecording} disabled={!isRecording}>Stop Recording</button>
                        {isRecording && <p>Recording Time: {recordingTime}s</p>}
                        {audioURL && (
                            <div>
                                <p>recorded audio:</p>
                                <audio controls src={audioURL}></audio>
                            </div>
                        )}    
                    </div>
                </>
                :<>
                    <div style={{display:'flex', flexDirection:'column'}}>
                        <label>Task: </label>
                        <input 
                            type='text'
                            name='description' 
                            value={tasktext}
                            placeholder='Enter your task'
                            onChange={(e) => settaskText(e.target.value)}
                            autoFocus
                        />
                    </div>
                </>}
                <br/><Button variant='dark' size='sm' style={{color:'white' }} type="submit" onClick={handleSubmit}>Create</Button>
                {error && <p style={{ color: 'red' }}>{error}</p>}  
                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>} 
              </div>
            </div>
        );
    };

    const Menu = () =>{
        return(
            <Navbar bg="dark" data-bs-theme="dark">
                    <Navbar.Brand href="/usrdashboard">VocaFlow</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href="#home" onClick={pathNavigator}>Home</Nav.Link>
                        <Nav.Link href="/profile">My Profile</Nav.Link>
                    </Nav>
                    <Nav>
                        <Nav.Link href="#">Notifications</Nav.Link>
                        <Nav.Link href="/">Logout</Nav.Link>
                    </Nav>
            </Navbar>
        );
    };

    return (
            <div style={{width:'1500px', height:'700px' }}>

                <Menu/>
                <h4 style={{textAlign:'center'}}>Welcome home, {udata.uname}!</h4>
                {isrole?<>
                    <Container>
                    <div className="d-grid gap-2">
                        <Button variant="dark" size="lg" onClick={() => setShowPopup(true)}>
                            Mark Attendance
                        </Button>
                        {showPopup && <AttendancePopup onClose={() => setShowPopup(false)} />}
                        <Button variant="dark" size="lg" onClick={() => settaskShowPopup(true)}>
                            Add Task
                        </Button>
                        {taskShowPopup && <TaskPopup onClose={() => settaskShowPopup(false)} />}
                        <Button variant="dark" size="lg" onClick={()=>{navigate(`/attendance/${udata.uid}`)}}>
                            My Attendences
                        </Button>
                        <Button variant="dark" size="lg" onClick={()=>{navigate(`/task/${udata.uid}`)}}>
                            My Tasks
                        </Button>
                    </div>
                </Container>      
                </>:<>
                <Container>
                    <div className="d-grid gap-2">
                        <Button variant="dark" size="lg" onClick={()=>{navigate(`/attendances`)}}>
                            View Attendences
                        </Button>
                        <Button variant="dark" size="lg" onClick={()=>{navigate(`/alltasks`)}}>
                            View Tasks
                        </Button>
                        <Button variant="dark" size="lg">
                            Performance Reports
                        </Button>
                    </div>
                </Container>      
                </>}
                     
            </div>
    );
};


export default Dashboard;