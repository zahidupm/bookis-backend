const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const { reset } = require('colors');
require('dotenv').config();
require('colors');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vggwpnk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function dbConnect() {
    try {
        // await client.connect();
        console.log('Database connected'.yellow.italic);
    } catch(error) {
        console.log(error.name.red, error.message.bold);
    }
}

dbConnect();

const Category = client.db('bookisWorldBook').collection('categories');
const CategoryName = client.db('bookisWorldBook').collection('categoryName');
const Booking = client.db('bookisWorldBook').collection('bookings');
const User = client.db('bookisWorldBook').collection('users');

function verifyJWT (req, res, next) {
    const authHeader = req.headers.authorization;
    if(!authHeader) {
        return res.status(401).send('unauthorized access')
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if(err) {
            return res.status(403).send({message: 'forbidden access'})
        }
        req.decoded = decoded;
        next();
    })
}

app.get('/categoryName', async (req, res) => {
    try {
        const query = {};
        const result = await CategoryName.find(query).toArray();
        res.send(result);

    } catch (error) {
        console.log(error.name.red, error.message.bold);
        res.send({
            success: false,
            message: error.message
        })
    }
})

app.get('/category', async (req, res) => {
    try {
        const id = req.params.id;
        const query = {category_id: id};
        const result = await Category.find(query).toArray();
        res.send(result);

    }   catch (error) {
        console.log(error.name.red, error.message.bold);
        res.send({
            success: false,
            message: error.message
        })
    }
})

// all category
app.get('/categories', async (req, res) => {
    try {
        const query = {};
        const result = await Category.find(query).toArray();
        res.send(result);

    } catch (error) {
        console.log(error.name.red, error.message.bold);
        res.send({
            success: false,
            message: error.message
        })
    }
})

app.get('/bookings', verifyJWT, async (req, res) => {
    try {
        const email = req.query.email;
        // console.log('token', req.headers.authorization);
        const decodedEmail = req.decoded.email;
        if (email !== decodedEmail) {
            return res.status(403).send({message: 'forbidden access'})
        }
        const query = { email: email };
        const bookings = await Booking.find(query).toArray();
        res.send(bookings);

    } catch (error) {
        console.log(error.name.red, error.message.bold);
        res.send({
            success: false,
            message: error.message
        })
    }
})

// booking
app.post('/bookings', async (req, res) => {
    try {
        const booking = req.body;
        // console.log(booking);
        const result = await Booking.insertOne(booking);
        res.send(result);

    }  catch (error) {
        console.log(error.name.red, error.message.bold);
        res.send({
            success: false,
            message: error.message
        })
    }
})

// jwt 
app.get('/jwt', async (req, res) => {
    try {
        const email = req.query.email;
        const query = {email: email};
        const user = await User.findOne(query);
        if(user) {
            const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '7d' });
            return res.send({ accessToken: token})
        }
        res.status(403).send({accessToken: ''})

    }  catch (error) {
        console.log(error.name.red, error.message.bold);
        res.send({
            success: false,
            message: error.message
        })
    }
})

// user
app.post('/users', async (req, res) => {
    try {
        const user = req.body;
        const result = await User.insertOne(user);
        res.send(result);

    } catch (error) {
        console.log(error.name.red, error.message.bold);
        res.send({
            success: false,
            message: error.message
        })
    }
});

app.get('/users', async (req, res) => {
    try {
        const query = {};
        const users = await User.find(query).toArray();
        res.send(users);

    } catch (error) {
        console.log(error.name.red, error.message.bold);
        res.send({
            success: false,
            message: error.message
        })
    }
})

// admin or seller or user
app.put('/users/admin/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const options = {}
        const updatedDoc = {
            $set: {
                role: 'admin'
            }
        }
        const result = await User.updateOne(filter, updatedDoc, options);
        res.send(result);

    } catch (error) {
        console.log(error.name.red, error.message.bold);
        res.send({
            success: false,
            message: error.message
        })
    }
})

// user
app.put('/users/user', async (req, res) => {
    try {
        const email = req.query.email;
        const filter = { email: email };
        const options = {}
        const updatedDoc = {
            $set: {
                role: 'user'
            }
        }
        const result = await User.updateOne(filter, updatedDoc, options);
        res.send(result);

    } catch (error) {
        console.log(error.name.red, error.message.bold);
        res.send({
            success: false,
            message: error.message
        })
    }
})

// seller
app.put('/users/seller', async (req, res) => {
    try {
        const email = req.query.email;
        const filter = { email: email };
        const options = {}
        const updatedDoc = {
            $set: {
                role: 'seller'
            }
        }
        const result = await User.updateOne(filter, updatedDoc, options);
        res.send(result);

    } catch (error) {
        console.log(error.name.red, error.message.bold);
        res.send({
            success: false,
            message: error.message
        })
    }
})


app.get('/', async (req, res) => {
    res.send(`Server is running`)
});

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
})
