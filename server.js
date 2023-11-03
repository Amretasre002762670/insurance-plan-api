require('dotenv').config();
const express = require('express');
const Redis = require('redis');
const  { verifyIdToken } = require("./authorization/auth.js")


const app = express();

const port = process.env.PORT || 3000;

const client = Redis.createClient(process.env.REDIS_PORT);

(async () => {
    await client.connect();
    console.log("Connecting to the Redis");
})();


client.on('ready', () => {
    console.error('Redis Connected');
});

client.on('error', (err) => {
    console.error('Redis Error:', err);
});

app.use(express.json());

const planRouter = require("./routes/plan")(client)

app.use("/v1/plan",verifyIdToken, planRouter)

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});