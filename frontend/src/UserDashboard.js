import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Grid, TextField, Typography } from '@mui/material';
import Pagination from '@mui/material/Pagination';

const UserDashboard = () => {
    const itemsPerPage = 10;
    const [page, setPage] = useState(1);

    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [transactionText, setTransactionText] = useState("");
    const [amount, setAmount] = useState(0);
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [spendingHistory, setSpendingHistory] = useState([]);

    useEffect(() => {
        if (user._id && token) {
            fetch(`/users/${user._id}`, {
                headers: {
                    'Authorization': 'Bearer ' + token
                },
            })
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('user', JSON.stringify(data));
                setUser(data);
                setSpendingHistory(data.spendingHistory);
            })
            .catch(error => console.error('Error:', error));
        }
    }, [user._id, token]);

    const processTransactionText = async () => {
        const response = await fetch(`/users/${user._id}/process-transaction-text`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ text: transactionText }),
        });
        const transactionData = await response.json();
        // set the Amount, Category, Description, Date from transactionData
        if(transactionData) {
            setAmount(transactionData.amount);
            setCategory(transactionData.category);
            setDescription(transactionData.description);
            setDate(transactionData.date);
        }
    };
    
    
    
    

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

    const handleChange = (event, value) => {
        setPage(value);
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Welcome, {user.name}</Typography>

            <Box sx={{ my: 3 }}>
                <Typography variant="h5" gutterBottom>Add New Transaction</Typography>
                <form id="transaction-form" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField 
                                label="Transaction Text" 
                                variant="outlined"
                                fullWidth
                                onChange={(e) => setTransactionText(e.target.value)}
                            />
                            <Button variant="contained" onClick={processTransactionText}>Process Text</Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Amount" 
                                variant="outlined"
                                fullWidth
                                required
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Category"
                                variant="outlined"
                                fullWidth
                                required
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                label="Description"
                                variant="outlined"
                                multiline
                                rows={4}
                                fullWidth
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Date"
                                variant="outlined"
                                type="date"
                                fullWidth
                                required
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Button type="submit" variant="contained" fullWidth>Submit</Button>
                        </Grid>
                    </Grid>
                </form>
            </Box>

            <Typography variant="h5" gutterBottom>Your Spending History</Typography>
            {spendingHistory.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((transaction, index) => (
                <Box key={index} sx={{ my: 2 }}>
                    <Typography>Amount: {transaction.amount}, Category: {transaction.category}, Description: {transaction.description}, Date: {transaction.date}</Typography>
                </Box>
            ))}

            <Pagination count={Math.ceil(spendingHistory.length / itemsPerPage)} page={page} onChange={handleChange} />
        </Container>
    );
};

export default UserDashboard;