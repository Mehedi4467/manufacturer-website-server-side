const express = require("express");
const cors = require("cors");
const app = express();
const ObjectId = require('mongodb').ObjectId;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());



// database connecte



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9x7m2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const productsCollection = client.db("Auto_care").collection("Products");
        const ordersCollection = client.db("Auto_care").collection("Orders");


        // product api
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

        // post order api
        app.post('/order', async (req, res) => {
            const newOrder = req.body;

            const result = await ordersCollection.insertOne(newOrder);
            console.log('adding new user', result.insertedId);
            res.send(result);
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