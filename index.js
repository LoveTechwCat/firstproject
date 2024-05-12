const express = require('express')
const app = express()
const port = 3000
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
app.use(express.json());

const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/test');
    console.log('Connected to MongoDB');
}

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: String,
    name: String,
});

const User = mongoose.model('User', userSchema);

const SECRET = 'KEYYYYYSECRETTTTT';

app.get('/users', async (req, res) => {
    const users = await User.find();
    res.send(users);
})

app.post('/users/signup', async (req, res) => {
    try {
        // username, password
        if (!req.body.username || !req.body.password) {
            res.status(400).send('Invalid input');
            return;
        }
        const hashedPassword = await bcrypt.hashSync(req.body.password, 10);
        const user = new User({ username: req.body.username, password: hashedPassword });
        await user.save();
        res.send(user);
    } catch (err) {
        res.status(500).send(err);
    }
})

app.post('/users/login', async (req, res) => {
    try {
        // username, password
        if (!req.body.username || !req.body.password) {
            res.status(400).send('Invalid input');
            return;
        }
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            res.status(400).send('User not found');
            return;
        }
        if (!bcrypt.compareSync(req.body.password, user.password)) {
            res.status(400).send('Wrong password');
            return;
        }
        const token = jwt.sign({ username : user.username, _id: user._id }, SECRET);
        res.send({ token });
    } catch (err) {
        res.status(500).send(err);
    }
})

// Update name in User Schema with authentication jwt token
app.put('/users/me', async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        console.log(token);
        const decoded = jwt.verify(token, SECRET);
        const user = await User.findById(decoded._id);
        user.name = req.body.name;
        await user.save();
        res.send(user);
    } catch (err) {
        res.status(500).send(err);
    }
})

/*
- Install MongoDB Local
- Install MongoDB Compass
- Install Lib mongoose
- Connect Mongoose to MongoDB Local -> Create Connection... 
- Create User Schema
*/

app.get('/users/:id', (req, res) => {
    console.log(req.query);
    console.log(req.params);
    res.send('Hello World! Huy')
})

app.post('/', (req, res) => {
    console.log(req.body);
    console.log(req.body);
    res.send('Hello World! HuyPost1')
})

app.put('/', (req, res) => {
    res.send('Hello World! HuyPut')
})

app.listen(port, () => {
    console.log(`Example app listening on port $    {port}`)
})

