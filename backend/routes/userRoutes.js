const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const UserController = require('../controllers/UserController');


router.get('/', UserController.get_users);
router.post('/', UserController.create_user);
router.post('/login', UserController.user_login);
router.get('/:id', UserController.get_user);
router.patch('/:id', UserController.update_user);
router.delete('/:id', UserController.delete_user);
router.post('/:id/transactions', UserController.add_transaction);

router.post('/:id/process-transaction-text', async (req, res) => {
    const userId = req.params.id;
    try {
        const { text } = req.body;
        const gptResponse = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `Translate the following English text into four categories of structured transaction data in the following format: \nAmount: "A Number", Category: "A String", Description: "A String", and Date: "A Date"  in one line, separated by ",":\n${text}\n\n`,
            temperature: 0,
            max_tokens: 256,
            top_p: 0,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
        const transactionData = gptResponse.data.choices[0].text.trim();
        console.log("transactionData:", transactionData); // Log the GPT-3 output
        const transactionObject = processTransactionData(transactionData);
        console.log("transactionObject:", transactionObject); // Log the processed transaction data
        const user = await User.findById(userId);
        if (user) {
            user.spendingHistory.push(transactionObject);
            await user.save();
            res.status(201).json(transactionObject); // Respond with the new transactionObject
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error(error); // Log the error
        res.status(500).send({ error: error.toString() });
    }
});






const processTransactionData = (transactionData) => {
    let transactionObject = {};
    const splitData = transactionData.split(',');
    splitData.forEach((data) => {
        let [key, value] = data.split(': ');
        switch (key.trim()) {
            case 'Amount':
                transactionObject['amount'] = parseFloat(value.trim());
                break;
            case 'Category':
                transactionObject['category'] = value.trim();
                break;
            case 'Description':
                transactionObject['description'] = value.trim();
                break;
            case 'Date':
                transactionObject['date'] = new Date(value.trim());
                break;
            default:
                break;
        }
    });
    return transactionObject;
};


module.exports = router;
