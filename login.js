import React, { useState } from 'react';
import './login.css';
import { Link, useNavigate } from 'react-router-dom';


function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();    //initializes navigate hook

    const handleLogin = async(e) => {
        e.preventDefault();
        const loginData = {email, password};  //passing values to verify not to insert

        try {
            const response = await fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify(loginData), 
            });
            const result = await response.json();
            console.log("HERE: ", result)
            if (response.ok) {
                console.log("ITS OK")
                
                const uid = result.value[1];  // Assuming backend sends userId
                const uname = result.value[2];
                const urole = result.value[0];

                localStorage.setItem('uid', uid); // Storing the userId in localStorage

                // Redirect to the user's dashboard
                console.log("Login pg: response: ", uid, uname, urole);
                navigate(`/usrdashboard/${urole}/${uid}/${uname}`);      //use backtick to carry the userid

            } 
            else {
                const errorResult = result;
                setError(errorResult.message || 'Invalid email or password');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('An error occurred. Please try again later.');
        } 
    };

    return (
        <div> 
            <h1>VocaFlow</h1><br/>        
            <div className='container1'>
                <div className='form-container'>   
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <form className='form' onSubmit={handleLogin}>
                <h2>Login</h2>
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required
                    />
                    <button type="submit">Login</button><br/>
                    <p style={{textAlign: 'right', marginTop:'2px', fontSize:14}}><Link to='#'>Forgot password?</Link></p>
                    <p>Not yet registered? <Link to='/register'>Sign up</Link></p>
                </form>
            </div>
        </div>
    </div>
    );
}

export default Login;