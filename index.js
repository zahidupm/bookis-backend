const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

app.get('/bookings', async (req, res) => {
    try {
        const email = req.query.email;
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

app.get('/', async (req, res) => {
    res.send(`Server is running`)
});

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
})
