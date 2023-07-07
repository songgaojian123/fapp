const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { Configuration, OpenAIApi } = require("openai");
const multer = require('multer');
const readline = require('readline');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const UserController = require('../controllers/UserController');
const upload = multer({ dest: 'uploads/' });

//----------------------------------------------------
//router.use((req, res, next) => {
    //console.log('Incoming request:', req.method, req.path);
    //next();
//});
//-----------------------------------------------
router.get('/', UserController.get_users);
router.post('/', UserController.create_user);
router.post('/login', UserController.user_login);
router.get('/me', authenticateToken, UserController.get_me);
router.get('/:id', UserController.get_user);
router.patch('/:id', UserController.update_user);
router.delete('/:id', UserController.delete_user);
router.post('/:id/transactions', UserController.add_transaction);



// New routes for deleting and editing transactions
router.delete('/:id/transactions/:transactionId', UserController.delete_transaction);
router.patch('/:id/transactions/:transactionId', UserController.edit_transaction);


router.post('/:id/process-transaction-text', async (req, res) => {
    const userId = req.params.id;
    try {
        const { text } = req.body;
        const gptResponse = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `Translate the following English text (if its not english, translate it to English) into five categories of structured transaction data in one line, separated by \",\", and the value of those categories are by the following format: \nAmount: amont of the money, \"Number\" only\nCategory: merchandise's or transaction's category, like \"Food\", \"Sport\", \"Electronics\", \"Entertainment\", \"Transaction from bank\", etc. \"String\" only.\nDescription: the detail of the merchandise, \"String\" only.\nDate: \"Date\" in mm/dd/yyyy format \nType: \"String\" which can only be \"unspecified\", \"income\" or \"expense\" \n\n${text}\n\n`,
            temperature: 1,
            max_tokens: 256,
            top_p: 0.5,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
        const transactionData = gptResponse.data.choices[0].text.trim();
        
        const transactionObject = processTransactionData(transactionData);
        
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





function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.sendStatus(401);
  
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        console.error("Token verification error: ", err);
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  }
  


  
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
            case 'Type':
                transactionObject['type'] = value.trim().toLowerCase();
            default:
                break;
        }
    });
    return transactionObject;
};


router.post('/:id/upload-transaction-csv', upload.single('file'), async (req, res) => {
    let user;
    try {
        user = await User.findById(req.params.id);
        if (user == null) {
            return res.status(404).json({ message: "Cannot find user" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    let foundHeader = false;
    let columns = [];
    const rl = readline.createInterface({
        input: fs.createReadStream(req.file.path),
        output: process.stdout,
        terminal: false,
    });

    let processPromises = [];
    rl.on('line', (line) => {
        if (line.startsWith("---")) {
            foundHeader = true;
        } else if (foundHeader) {
            if (columns.length === 0) {
                columns = line.split(',');
            } else {
                const values = line.split(',');
                let row = {};
                columns.forEach((column, index) => {
                    row[column] = values[index];
                });
                // Push each promise to the array
                processPromises.push(new Promise(async (resolve, reject) => {
                    try {
                        
                        await translateAndProcessRow(row, user);
                        console.log('Processed row:', row);
                        resolve();
                    } catch (error) {
                        console.log('Error processing row:', error);
                        reject(error);
                    }
                }));
            }
        }
    });
    
    rl.on('close', async () => {
        try {
            // Wait for all promises to complete
            await Promise.all(processPromises);
            await user.save();  // Save the user after all rows are processed.
            console.log('User saved successfully');
            res.status(201).json(user.spendingHistory);
    
            // Delete the file
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error('Error while deleting the file:', err);
                } else {
                    console.log('Successfully deleted the file.');
                }
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
    

    const translateAndProcessRow = async (row, user) => {
        try {
            const prompt = `Translate the following Chinese text to English: ${row['交易类型']}, ${row['商品']}`;
            const gptResponse = await openai.createCompletion({
                model: "text-davinci-003",
                prompt,
                max_tokens: 60,
            });
            const translation = gptResponse.data.choices[0].text.trim();
            const [category, description] = translation.split(', ');
            const typeMapping = {
                '收入': 'income',
                '支出': 'expense',
            };
            const type = typeMapping[row['收/支']] || 'unspecified';
            const transaction = {
                type,
                description,
                amount: parseFloat(row['金额(元)'].replace('¥', '')),
                date: new Date(row['交易时间']),
                category,
            };
            user.spendingHistory.push(transaction);
        } catch (error) {
            
            throw error;
        }
    };
});

module.exports = router;



