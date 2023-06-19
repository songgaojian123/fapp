import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Grid, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Pagination from '@mui/material/Pagination';

const UserDashboard = () => {
    const itemsPerPage = 10;
    const [page, setPage] = useState(1);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [transactionText, setTransactionText] = useState("");
    const [amount, setAmount] = useState(0);
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [spendingHistory, setSpendingHistory] = useState([]);
    const [sortConfig, setSortConfig] = useState(null);

    // Sorting function
    const onSort = (columnName) => {
        let direction = 'ascending';

        if (sortConfig && sortConfig.key === columnName && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }

        setSortConfig({ key: columnName, direction });
    };

    useEffect(() => {
        if (user._id && token) {
            fetch(process.env.REACT_APP_BACKEND_URL + `/users/${user._id}`, {
                headers: {
                    'Authorization': 'Bearer ' + token
                },
            })
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('user', JSON.stringify(data));
                setUser(data);
                let sortedData = [...data.spendingHistory];
                if (sortConfig !== null) {
                    sortedData.sort((a, b) => {
                        if (a[sortConfig.key] < b[sortConfig.key]) {
                            return sortConfig.direction === 'ascending' ? -1 : 1;
                        }
                        if (a[sortConfig.key] > b[sortConfig.key]) {
                            return sortConfig.direction === 'ascending' ? 1 : -1;
                        }
                        return 0;
                    });
                }
                setSpendingHistory(sortedData);
            })
            .catch(error => console.error('Error:', error));
        }
    }, [user._id, token, sortConfig]);

    const processTransactionText = async () => {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + `/users/${user._id}/process-transaction-text`, {
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
    
    const deleteTransaction = async (transactionId) => {
        await fetch(process.env.REACT_APP_BACKEND_URL + `/users/${user._id}/transactions/${transactionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            },
        });
        setSpendingHistory(spendingHistory.filter(transaction => transaction._id !== transactionId));
    };

    const editTransaction = (transaction) => {
        setAmount(transaction.amount);
        setCategory(transaction.category);
        setDescription(transaction.description);
        setDate(transaction.date);
        setEditingTransaction(transaction._id);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const transaction = {
            amount,
            category,
            description,
            date
        };

        const url = editingTransaction 
            ? `${process.env.REACT_APP_BACKEND_URL}/users/${user._id}/transactions/${editingTransaction}`
            : `${process.env.REACT_APP_BACKEND_URL}/users/${user._id}/transactions`;
        const method = editingTransaction ? 'PATCH' : 'POST';

        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(transaction),
        })
        .then(response => response.json())
        .then(data => {
            if (editingTransaction) {
                setSpendingHistory(spendingHistory.map(transaction => transaction._id === data._id ? data : transaction));
                setEditingTransaction(null);
            } else {
                setSpendingHistory(prev => [...prev, data]);
            }
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
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Category"
                                variant="outlined"
                                fullWidth
                                required
                                value={category} 
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
                                value={description} 
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
                                value={date} 
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Button type="submit" variant="contained" fullWidth>{editingTransaction ? 'Update' : 'Submit'}</Button>
                        </Grid>
                    </Grid>
                </form>
            </Box>

            <Typography variant="h5" gutterBottom>Your Spending History</Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                        <TableCell onClick={() => onSort('amount')} sx={{cursor: 'pointer'}}>Amount</TableCell>
                        <TableCell onClick={() => onSort('category')} sx={{cursor: 'pointer'}}>Category</TableCell>
                        <TableCell onClick={() => onSort('description')} sx={{cursor: 'pointer'}}>Description</TableCell>
                        <TableCell onClick={() => onSort('date')} sx={{cursor: 'pointer'}}>Date</TableCell>
                        <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {spendingHistory.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((transaction, index) => (
                            <TableRow key={index}>
                                <TableCell>{transaction.amount}</TableCell>
                                <TableCell>{transaction.category}</TableCell>
                                <TableCell>{transaction.description}</TableCell>
                                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Button onClick={() => deleteTransaction(transaction._id)}>Delete</Button>
                                    <Button onClick={() => editTransaction(transaction)}>Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Pagination count={Math.ceil(spendingHistory.length / itemsPerPage)} page={page} onChange={handleChange} />
        </Container>
    );
};

export default UserDashboard;
