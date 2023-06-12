import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUp from './SignUp'; 
import SignIn from './SignIn';
import UserPage from './UserDashboard';



const SignInPage = () => (
  <div>
    <SignIn />
  </div>

);

const SignUpPage = () => (
  <div>
    <SignUp/>
  </div>
);

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage/>}/>
      <Route path="/user" element={<UserPage />} />
    </Routes>
  </Router>
);

export default App;
