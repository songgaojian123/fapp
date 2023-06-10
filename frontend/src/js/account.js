// get the user details from local storage
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

// display the username
document.getElementById('user-name').textContent = user.name;

// handle the transaction form submission
document.getElementById('transaction-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;

    const transaction = {
        amount: amount,
        category: category,
        description: description,
        date: date
    };

    fetch(`http://localhost:5000/users/${user._id}/transactions`, {
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
        // update the spending history on the page
        displaySpendingHistory(data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

// get the latest user details from the server
fetch(`http://localhost:5000/users/${user._id}`, {
    headers: {
        'Authorization': 'Bearer ' + token
    },
})
    .then(response => response.json())
    .then(data => {
        // update the user details in local storage and on the page
        localStorage.setItem('user', JSON.stringify(data));
        // display the spending history
        displaySpendingHistory(data.spendingHistory);
    })
    .catch(error => console.error('Error:', error));

function displaySpendingHistory(spendingHistory) {
    const historyContainer = document.getElementById('spending-history');
    historyContainer.innerHTML = '';  // clear the container
    spendingHistory.forEach(transaction => {
        const transactionElement = document.createElement('p');
        transactionElement.textContent = `Amount: ${transaction.amount}, Category: ${transaction.category}, Description: ${transaction.description}, Date: ${transaction.date}`;
        historyContainer.appendChild(transactionElement);
    });
}
