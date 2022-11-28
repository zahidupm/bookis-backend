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
    try {
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
    } catch (error) {
        console.log(error.name.red, error.message.bold);
        res.send({
            success: false,
            message: error.message
        })
    }
}

// verify Admin // NOTE: make sure use verifyAdmin after verifyJWT
const verifyAdmin = async (req, res, next) => {
    try {
        // console.log('inside verifyAdmin',req.decoded.email);
        const decodedEmail = req.decoded.email;
        const query = { email: decodedEmail };
        const user = await User.findOne(query);
        if(user?.role !== 'admin') {
            return res.status(403).send({message: 'forbidden access'})
        }
        next();
    } catch (error) {
        console.log(error.name.red, error.message.bold);
        res.send({
            success: false,
            message: error.message
        })
    }
}

// verify seller
// verify seller // NOTE: make sure use verifyAdmin after verifyJWT
const verifySeller = async (req, res, next) => {
    try {
        // console.log('inside verifyAdmin',req.decoded.email);
        const decodedEmail = req.decoded.email;
        const query = { email: decodedEmail };
        const user = await User.findOne(query);
        if(user?.role !== 'seller') {
            return res.status(403).send({message: 'forbidden access'})
        }
        next();
    } catch (error) {
        console.log(error.name.red, error.message.bold);
        res.send({
            success: false,
            message: error.message
        })
    }
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

// categoryName
app.post('/categoryName', async (req, res) => {
    try {
       const filter = req.body;
        const result = await CategoryName.insertOne(filter);
        res.send(result);

    } catch (error) {
        console.log(error.name.red, error.message.bold);
        res.send({
            success: false,
            message: error.message
        })
    }
})

app.get('/category/:id', async (req, res) => {
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

// user delete 
app.delete('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = { _id: ObjectId(id)}
        const result = await User.deleteOne(filter);
        res.send(result);

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

// is admin 
app.get('/users/admin/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const query = { email }
        const user = await User.findOne(query);
        res.send({isAdmin: user?.role === 'admin'});

    } catch (error) {
        console.log(error.name.red, error.message.bold);
        res.send({
            success: false,
            message: error.message
        })
    }
})

// is seller
app.get('/users/seller/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const query = { email }
        const user = await User.findOne(query);
        res.send({isSeller: user?.role === 'seller'});

    } catch (error) {
        console.log(error.name.red, error.message.bold);
        res.send({
            success: false,
            message: error.message
        })
    }
})

// isBuyer 
app.get('/users/buyer/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const query = { email }
        const user = await User.findOne(query);
        res.send({isBuyer: user?.role === 'buyer'});

    } catch (error) {
        console.log(error.name.red, error.message.bold);
        res.send({
            success: false,
            message: error.message
        })
    }
})

// admin or seller or user
app.put('/users/admin/:id', verifyJWT, async (req, res) => {
    try {
        const decodedEmail = req.decoded.email;
        const query = { email: decodedEmail};
        const user = await User.findOne(query);
        if(user?.role !== 'admin') {
            return res.status(403).send({message: 'forbidden access'})
        }

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
app.put('/users/buyer', async (req, res) => {
    try {
        const email = req.query.email;
        const filter = { email: email };
        const options = {}
        const updatedDoc = {
            $set: {
                role: 'buyer'
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

// add product 
app.post('/categories', async (req, res) => {
    try {
        const product = req.body;
        const result = await Category.insertOne(product);
        res.send(result);

    } catch (error) {
        console.log(error.name.red, error.message.bold);
        res.send({
            success: false,
            message: error.message
        })
    }
})

// get the seller product
app.get('/categories/my_products', verifyJWT, async (req, res) => {
    try {
        const email = req.query.email;
        // console.log('token', req.headers.authorization);
        const decodedEmail = req.decoded.email;
        if (email !== decodedEmail) {
            return res.status(403).send({message: 'forbidden access'})
        }
        const query = { email: email };
        const products = await Category.find(query).toArray();
        res.send(products);
    } catch (error) {
        console.log(error.name.red, error.message.bold);
        res.send({
            success: false,
            message: error.message
        })
    }
})

// seller deleted
app.delete('/categories/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = { _id: ObjectId(id)}
        const result = await Category.deleteOne(filter);
        res.send(result);

    }  catch (error) {
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
