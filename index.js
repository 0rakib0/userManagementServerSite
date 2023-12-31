const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000


// DBU: userManagement
// DBP: 0z0Ihd13OVhFyyza


app.use(express.json())
app.use(cors())




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://userManagement:0z0Ihd13OVhFyyza@cluster0.zoyeiku.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        const userCollection = client.db('usersDB').collection('users')


        app.get('/users', async (req, res) => {
            const { search, select } = req.query;
            console.log(select)
            let usersData = await userCollection.find().toArray();
            if (search) {
                const query = {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                        { phone: { $regex: search, $options: 'i' } }
                    ]
                };
                usersData = await userCollection.find(query).toArray();
            } else if (select === 'acs') {
                usersData = usersData.sort((a, b) => a.name.localeCompare(b.name));
            } else if (select === 'dcs') {
                usersData = usersData.sort((a, b) => b.name.localeCompare(a.name));
            }
            // const usersData = await userCollection.find().toArray();
            res.send(usersData);

        });


        app.get('/user/:id', async (req, res) => {
            const userId = req.params.id
            const query = { _id: new ObjectId(userId) }
            const result = await userCollection.findOne(query)
            res.send(result)
        })

        app.put('/update-user/:id', async (req, res) => {
            const userId = req.params.id
            const UpdateData = req.body
            const option = { upsert: true }
            const query = { _id: new ObjectId(userId) }
            const Update = {
                $set: {
                    name: UpdateData.name,
                    email: UpdateData.email,
                    phone: UpdateData.phone,
                    updateAt: UpdateData.updateAt
                }
            }
            const result = await userCollection.updateOne(query, Update, option)
            res.send(result)
        })



        app.delete('/delete-user/:id', async (req, res) => {
            const userId = req.params.id
            const query = { _id: new ObjectId(userId) }
            const result = await userCollection.deleteOne(query)
            res.send(result)
        })



        app.post('/user', async (req, res) => {
            const userData = req.body
            const result = await userCollection.insertOne(userData)
            res.send(result)
        })




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send("Hello Bangladesh")
})

app.listen(port, () => {
    console.log(`My server running on ${port}`)
})