const express = require("express");
const cors = require("cors");
const app = express();
const ObjectId = require('mongodb').ObjectId;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());

const verifyJwt = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized Access' });

    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded;
        next();
    });
}

// database connecte



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9x7m2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const productsCollection = client.db("Auto_care").collection("Products");
        const ordersCollection = client.db("Auto_care").collection("Orders");
        const usersCollection = client.db("Auto_care").collection("Users");
        const reviewsCollection = client.db("Auto_care").collection("Reviews");


        // product api

        // post order api
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            res.send(result);
        });


        // get all product api
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        // get products by id 

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.send(result);
        });


        //delete order by id api 
        app.delete('/product/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        });

        // post order api
        app.post('/order', async (req, res) => {
            const newOrder = req.body;
            const result = await ordersCollection.insertOne(newOrder);
            res.send(result);
        });


        // user information api


        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email }
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '30d' });
            res.send({ result, token });
        });

        //update user profile informatrion
        app.put('/user/update/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email }
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);

            res.send(result);
        });


        // get user information api

        app.get('/user/:email', verifyJwt, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const allUser = await usersCollection.findOne({ email: requester });
            res.send(allUser);
        });

        // get all order api
        app.get('/order/:email', verifyJwt, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            console.log(email)
            const allOrder = await ordersCollection.find({ email: requester }).toArray();
            res.send(allOrder);
        });

        //delete order by id api 
        app.delete('/order/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.send(result);
        });

        // post review api
        app.post('/review', async (req, res) => {
            const newReview = req.body;
            const result = await reviewsCollection.insertOne(newReview);
            res.send(result);
        });



        // get admin api

        app.get('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email: email });
            const isAdmin = user?.role === "admin";
            res.send({ admin: isAdmin });
        });

        // get all user 
        app.get('/user/allUser/:email', verifyJwt, async (req, res) => {
            // const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAcount = await usersCollection.findOne({ email: requester });
            if (requesterAcount.role === 'admin') {
                const user = await usersCollection.find({}).toArray();

                res.send(user);
            }
            else {
                res.status(403).send({ message: "Forbidden" });
            }

        });

        // make admin
        app.put('/user/admin/:email', verifyJwt, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAcount = await usersCollection.findOne({ email: requester });
            console.log(requesterAcount)
            if (requesterAcount.role === 'admin') {
                const filter = { email: email };
                const updateDoc = {
                    $set: { role: 'admin' },
                };
                const result = await usersCollection.updateOne(filter, updateDoc);
                res.send(result);

            }
            else {
                res.status(403).send({ message: "Forbidden" });
            }

        });






    }
    finally {
        // client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send("Auto Care Server is running");
});
app.listen(port, () => {
    console.log("server is running", port);
})