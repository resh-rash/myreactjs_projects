import React, { useRef, useState} from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Form, Col, Row, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; 


function Registration() {
      // State for form fields and error message
    const [name, setName] = useState('');
    const [id, setId] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setConfirmPassword] = useState('');
    const [voice, setVoice] = useState(null);
    const [error, setError] = useState('');

    const [loading, setLoading] = useState(false); // Loading state for API call
    const [successMessage, setSuccessMessage] = useState('');

    const [showPopup, setShowPopup] = useState(false);
    const [isRecording, setisRecording] = useState(false);
    const mediaRecorderRef=useRef(null);
    const audioChunksRef = useRef([]);
    const [recordingTime, setRecordingTime]=useState(0);  //to show the recording time
    const [audioURL, setAudioURL] =useState(null);  // it stores a url ref to the recorded audio to play it b4 submitting
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
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
                setVoice(audioBlob);

                //generate an audiourl for playback
                const url=URL.createObjectURL(audioBlob);
                setAudioURL(url)
            };
            mediaRecorderRef.current.start();   // start recording
            setisRecording(true);

            setRecordingTime(0);  // start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 60);

        } catch (error) {
            console.error("Error starting recording:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          setisRecording(false);
          clearInterval(timerRef.current);  // to stop recording timer
        }
    };

      // Handle form submission
    const handleSubmit = async(e) => {    
        e.preventDefault(); // Prevent the default form submission
        if (password !== password2) {
            setError('Passwords do not match!');
            return;
          }
        setError('');  // Clear any previous error
        setLoading(true);         // Set loading to true while waiting for API response

        // Prepare the data to send
        const formData = new FormData();
      
        formData.append("name", name);
        formData.append("id", id);
        formData.append("dob", dob);
        formData.append("gender", gender);
        formData.append("email", email);
        formData.append("pswrd", password);
        if (voice) {
            formData.append("voice", voice, "recording.wav");
            for (let pair of formData.entries()){
                console.log('The form data: ', pair[0],pair[1]);
            } 
        }

        try {
                // Send POST request to the backend API 
            const response = await fetch('http://localhost:3001/users', { 
                method: "POST",
                body: formData,
            });
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const textResponse = await response.text();
                console.error("Server response (not JSON):", textResponse);
                throw new Error("Server did not return JSON");
            }
            const result = await response.json();
            if (response.ok) {
                
                setSuccessMessage('Registration successful!', result);
                // If successful, reset form fields
                setName('');
                setId('')
                setDob('')
                setGender(null)
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            } 
            else {
                const errorResult = await response.json();
                setError(errorResult.message || 'Something went wrong, please try again.');
            }
        } catch (err) {
            console.error('Error during form submission:', err);
            setError('An error occurred. Please try again later.');
        } finally {
            setLoading(false); // Stop loading spinner
        }
    };

    const VoicePopupClose =() => {setShowPopup(false)};
    const VoicePopup= () => {
        setShowPopup(true);   //==showModal
    };

    return (
        <Container style={{backgroundcolor: 'yellow'}}>
        <Form onSubmit={handleSubmit}>
            <h2 style={{textAlign: 'center', color: 'navy'}}>Registration</h2>
            <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control placeholder="Name"
                    id='name' 
                    type='text' 
                    value={name} 
                    required 
                    onChange={(e) => setName(e.target.value)} 
                />
            </Form.Group>

            <Row className="mb-3">
                <Form.Group as={Col}>
                    <Form.Label>ID</Form.Label>
                    <Form.Control placeholder='ID'
                        type="text" 
                        value={id} 
                        required
                        onChange={(e) => setId(e.target.value)}
                    />
                </Form.Group>

                <Form.Group as={Col}>
                    <Form.Label>DOB</Form.Label>
                    <Form.Control placeholder='Date' type='date'
                        value={dob}
                        onChange={(e) => setDob(e.target.value)} 
                        required
                    />
                </Form.Group>
            </Row>

            <Row className="mb-3">
                
                <div className='d-flex gap-4'>
                    <Form.Label>Gender: </Form.Label>
                    <Form.Check
                        label="Male"
                        required
                        id='male' 
                        name='gender'
                        value='M'
                        type="radio" 
                        checked={gender === 'M'}
                        onChange={(e) => setGender(e.target.value)}
                    />
                    <Form.Check
                        label="Female"
                        type="radio" 
                        id='female' 
                        name='gender'
                        value='F'
                        checked={gender === 'F'}
                        onChange={(e) => setGender(e.target.value)}
                    />
                    <Form.Check
                        label="Others"
                        type="radio" 
                        id='others' 
                        name='gender'
                        value='O'
                        checked={gender === 'O'}
                        onChange={(e) => setGender(e.target.value)}
                    />

                </div>
            </Row>

            <Form.Group as={Col}>
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" 
                    placeholder="Email" 
                    name='email'
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </Form.Group>
            <Row className="mb-3">
                <Form.Group as={Col} >
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password"
                    placeholder="Password" 
                    id='pswrd'
                    name='pswrd'
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required
                    />
                </Form.Group>

                <Form.Group as={Col}>
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control type="password" 
                    placeholder="Confirm Password" 
                    id='pswrd2'
                    name='pswrd2'
                    value={password2}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                </Form.Group>
            </Row>
            <button variant="outline-dark" type='button' onClick={VoicePopup} >Add voice sample</button><br/> {/* adding type to avoid form submission */}
            {/* {showPopup && VoicePopupClose />}    */}
            {audioURL && (
                        <div>
                            <p>recorded audio:</p>
                            <audio controls src={audioURL} type="audio/wav"></audio>
                        </div>
            )}    
            <br></br>
            <Button variant='success' type="submit" disabled={loading}>Sign up</Button>
                  

            <p style={{textAlign: 'right', marginTop:'2px', fontSize:14}}><Link to='/'>Back</Link></p>
            {loading ? 'Submitting...' : ''}
                            {/*The loading state is used to disable the submit button while the request is 
                                being processed and to show a "Submitting..." message during the API call. */}   
            {error && <p style={{ color: 'red' }}>{error}</p>}  {/* Display error message if passwords don't match */}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>} {/* Display success message */}        
        </Form>

        {/* Modal for Voice Recording */}
        <Modal show={showPopup} onHide={VoicePopupClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Record Your Voice Sample</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <Button variant="primary" onClick={startRecording} disabled={isRecording}>Start Recording</Button>
                    <Button variant="danger" className="ms-2" onClick={stopRecording} disabled={!isRecording}>Stop Recording</Button>
                </Modal.Body>
        </Modal>
        </Container>
    );
}

export default Registration;