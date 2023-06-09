const User = require('../models/User');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');


// GET all users
exports.get_users = async function(req, res) {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// POST a new user (sign up)
exports.create_user = async function(req, res) {
    const { name, email, password } = req.body;

    // hash the password
    bcryptjs.hash(password, 10, async (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        
        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword  // store the hashed password
        });

        try {
            const savedUser = await newUser.save();

            // create a token with the user's id as the payload
            const token = jwt.sign(
                {
                    email: savedUser.email,
                    userId: savedUser._id,
                },
                process.env.JWT_SECRET_KEY, // replace with your secret key
                {
                    expiresIn: '1h', // specify the token expiry time
                }
            );

            // return the user and token
            res.status(201).json({
                message: "Auth successful",
                user: savedUser,
                token: token,
            });

        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });
};


// Login user
exports.user_login = function(req, res) {
    const { email, password } = req.body;
    User.findOne({ email: email })
        .then(user => {
            if(!user) {
                return res.status(401).json({ message: "Auth failed! Email not found." });
            }
            //compare the password
            bcryptjs.compare(password, user.password, function(err, result) {
                if(err) {
                    return res.status(401).json({ message: "Auth failed! Error comparing passwords." });
                }
                if(result) {
                    // Generate a JWT token
                    const token = jwt.sign(
                        { email: user.email, userId: user._id },
                        process.env.JWT_SECRET_KEY,  
                        // updated line
                        { expiresIn: "1h" }
                    );
                    
                    // Return user and token
                    return res.status(200).json({ message: "Auth successful!", user, token });
                }
                return res.status(401).json({ message: "Auth failed! Incorrect password." });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};




// GET a user's information
exports.get_user = async function(req, res) {
    let user;
    try {
        user = await User.findById(req.params.id);
        if (user == null) {
            return res.status(404).json({ message: 'Cannot find user' });
        }
    } catch(err) {
        return res.status(500).json({ message: err.message });
    }
    res.json(user);
};

// PATCH a user's information
exports.update_user = async function(req, res) {
    let user;
    try {
        user = await User.findById(req.params.id);
        if (user == null) {
            return res.status(404).json({ message: 'Cannot find user' });
        }
    } catch(err) {
        return res.status(500).json({ message: err.message });
    }

    if (req.body.name != null) {
        user.name = req.body.name;
    }
    if (req.body.email != null) {
        user.email = req.body.email;
    }
    if (req.body.password != null) {
        user.password = req.body.password;
    }
    try {
        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch(err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE a user
exports.delete_user = async function(req, res) {
    let user;
    try {
        user = await User.findById(req.params.id);
        if (user == null) {
            return res.status(404).json({ message: 'Cannot find user' });
        }
    } catch(err) {
        return res.status(500).json({ message: err.message });
    }
    try {
        await user.remove();
        res.json({ message: 'Deleted user' });
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

// Add a new transaction

// Add a transaction to user's spending history
exports.add_transaction = async function(req, res) {
    const userId = req.params.id;
    const transaction = req.body;

    try {
        const user = await User.findById(userId);
        if (user) {
            user.spendingHistory.push(transaction);
            const savedUser = await user.save();
            res.status(201).json(savedUser.spendingHistory);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Get spending history
exports.get_spending_history = async function(req, res) {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json(user.spendingHistory);
};

// Delete a transaction from a user's spending history
exports.delete_transaction = async function(req, res) {
    const userId = req.params.id;
    const transactionId = req.params.transactionId;
// Log the userId and transactionId received
    console.log("User ID: ", userId);
    console.log("Transaction ID: ", transactionId);

    try {
        const user = await User.updateOne(
            { _id: userId },
            { $pull: { spendingHistory: { _id: transactionId } } }
        );
        if (user.nModified === 0) {
            return res.status(404).json({ message: "Transaction not found" });
        }
        res.status(200).json({ message: "Transaction deleted successfully." });
    } catch (err) {
        console.log("Error: ", err);
        res.status(500).json({ message: err.message });
    }
    
};


// Edit a transaction in a user's spending history
exports.edit_transaction = async function(req, res) {
    const userId = req.params.id;
    const transactionId = req.params.transactionId;
    const updatedTransaction = req.body;

    try {
        const user = await User.findById(userId);
        if (user) {
            const transaction = user.spendingHistory.id(transactionId);
            if (!transaction) {
                return res.status(404).json({ message: "Transaction not found" });
            }

            
            transaction.amount = updatedTransaction.amount;
            transaction.category = updatedTransaction.category;
            transaction.description = updatedTransaction.description;
            transaction.date = updatedTransaction.date;
            transaction.type = updatedTransaction.type;

            const savedUser = await user.save();
            res.status(200).json(savedUser.spendingHistory);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.get_me = (req, res, next) => {
    // extract user ID from the authenticated JWT token
    const userId = req.user.userId;
    
    User.findById(userId)
        .then(user => {
            if (!user) {
                res.status(404).json({ message: "User not found" });
            } else {
                // do not send password and other sensitive info, only send required user info
                const userInfo = {
                    id: user._id,
                    username: user.name,
                    email: user.email,
                    spendingHistory: user.spendingHistory, // add spending history
                    // add other user info you want to send here
                };
                res.json(userInfo);
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err });
        });
};

  