const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define schema for each transaction
const TransactionSchema = new Schema({
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    date: {
        type: Date,
    }
});

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    spendingHistory: [TransactionSchema]  // This is an array of TransactionSchema subdocuments
});

module.exports = mongoose.model('User', UserSchema);
