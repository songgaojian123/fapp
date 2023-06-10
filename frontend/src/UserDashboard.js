import React, { useState, useEffect } from 'react';

const UserDashboard = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [spendingHistory, setSpendingHistory] = useState([]);

  useEffect(() => {
    // Fetch user details from server
    fetch(`/users/${user._id}`, {
      headers: {
        'Authorization': 'Bearer ' + token
      },
    })
      .then(response => response.json())
      .then(data => {
        localStorage.setItem('user', JSON.stringify(data));
        setSpendingHistory(data.spendingHistory);
      })
      .catch(error => console.error('Error:', error));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const transaction = {
      amount,
      category,
      description,
      date
    };
    
    fetch(`/users/${user._id}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(transaction),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        setSpendingHistory(prev => [...prev, data]);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  return (
    <div className="container">
      <h2>Welcome, {user.name}</h2>
      <h3>Add New Transaction</h3>
      <form id="transaction-form" onSubmit={handleSubmit}>
        <label htmlFor="amount">Amount:</label><br/>
        <input type="number" id="amount" name="amount" required onChange={(e) => setAmount(e.target.value)}/><br/>
        <label htmlFor="category">Category:</label><br/>
        <input type="text" id="category" name="category" required onChange={(e) => setCategory(e.target.value)}/><br/>
        <label htmlFor="description">Description:</label><br/>
        <textarea id="description" name="description" rows="4" cols="50" onChange={(e) => setDescription(e.target.value)}></textarea><br/>
        <label htmlFor="date">Date:</label><br/>
        <input type="date" id="date" name="date" required onChange={(e) => setDate(e.target.value)}/><br/>
        <input type="submit" value="Submit"/>
      </form>
      <h3>Your Spending History</h3>
      <div id="spending-history">
        {spendingHistory.map((transaction, index) => (
          <p key={index}>Amount: {transaction.amount}, Category: {transaction.category}, Description: {transaction.description}, Date: {transaction.date}</p>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
