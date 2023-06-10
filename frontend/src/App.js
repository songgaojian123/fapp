import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUp from './SignUp'; 
import Login from './Login'; 
import UserPage from './UserDashboard';

const AuthPage = () => (
  <div>
    <SignUp />
    <Login />
  </div>
);

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/user" element={<UserPage />} />
    </Routes>
  </Router>
);

export default App;
