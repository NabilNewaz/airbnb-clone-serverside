const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const dayjs = require('dayjs');
require('dotenv').config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zusdhlj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categoriesCollection = client.db('airbnbClone').collection('categories');
        const cardCollection = client.db('airbnbClone').collection('cardData');

        app.get('/get-categories', async (req, res) => {
            const query = {};
            const cursor = categoriesCollection.find(query);
            const categories = await cursor.toArray();
            res.send(categories);
        })

        app.get('/get-all-cards', async (req, res) => {
            const query = {};
            const cursor = cardCollection.find(query);
            const categories = await cursor.toArray();
            res.send(categories);
        })

        app.get('/get-card/:category_id', async (req, res) => {
            const query = { category_id: req.params.category_id };
            const cursor = cardCollection.find(query);
            const cards = await cursor.toArray();
            res.send(cards);
        })

        app.post('/search', async (req, res) => {
            const check_in = new RegExp(dayjs(req.body.check_in).format("MMM D"));
            const address = new RegExp(req.body.address)
            const query = {
                $or: [
                    { address: { $regex: address, $options: 'i' } },
                    { title: { $regex: address, $options: 'i' } },
                    { date_range: { $regex: check_in, $options: 'i' } }
                ]
            };

            const cursor = cardCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/filter', async (req, res) => {
            const query = {
                $or: [
                    { type_of: req.body?.type },
                    { property_type: req.body?.propertyType },
                    { price: { $gte: req.body?.range[0].toString(), $lte: req.body?.range[1].toString() } },
                    { type_of: req.body?.propertyType },
                    { bed_room: `${req.body?.bedroom}` },
                    { beds: `${req.body?.bed}` },
                    { barthroom: `${req.body?.bathroom}` }
                ]
            };
            const cursor = cardCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

    } finally {

    }
}

run().catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Airbnb Clone API Running');
})

app.listen(port, () => {
    console.log(`Airbnb Clone API Running In PORT : ${port}`);
})