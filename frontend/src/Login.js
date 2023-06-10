import React, { useState } from 'react';
import './styles.css';
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // your fetch logic here
        fetch('/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Invalid email or password');
            }
            return response.json();
        })
        .then((data) => {
            // save the user data and the JWT for later
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            // redirect the user to their account page
            window.location.href = 'user';
        })
        .catch((error) => {
            setErrorMessage(error.message);
        });
    };

    return (
        <div className="container">
            <h2>Login</h2>
            <form id="login-form" onSubmit={handleSubmit}>
                <div className="form-control">
                    <label htmlFor="login-email">Email</label>
                    <input type="email" id="login-email" name="login-email" required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="form-control">
                    <label htmlFor="login-password">Password</label>
                    <input type="password" id="login-password" name="login-password" required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            <p id="login-error">{errorMessage}</p>
        </div>
    );
};

export default Login;
