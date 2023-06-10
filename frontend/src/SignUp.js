import React, { useState } from 'react';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // your fetch logic here
        fetch('/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name : name,
                email : email,
                password : password
            })
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
    };

    return (
        <div className="container">
            <h2>Sign Up</h2>
            <form id="signup-form" onSubmit={handleSubmit}>
                <div className="form-control">
                    <label htmlFor="signup-email">Email</label>
                    <input type="email" id="signup-email" name="signup-email" required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="form-control">
                    <label htmlFor="signup-username">Username</label>
                    <input type="username" id="signup-username" name="signup-username" required 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="form-control">
                    <label htmlFor="signup-password">Password</label>
                    <input type="password" id="signup-password" name="signup-password" required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default SignUp;
