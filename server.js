require('dotenv').config();
const express = require('express');
const Redis = require('redis');
const { verifyIdToken } = require("./authorization/auth.js")
const redisConsumer = require("./consumer/redisToElastic");
const { indexDataWithParentChild } = require('./consumer/indexParentChild.js');
const { startConsumer } = require('./consumer/rabbitMQConsumer.js');

const app = express();

const port = process.env.PORT || 3000;

const client = Redis.createClient(process.env.REDIS_PORT);

// const redisConsumerCallback = (data) => {
//     console.log("call to redis consumer ", data)
//     const parsedData = JSON.parse(data);
//     if (parsedData != undefined) indexDataWithParentChild(parsedData);
// };


(async () => {
    await client.connect();
    console.log("Connecting to the Redis");
})();


client.on('ready', () => {
    console.error('Redis Connected');
});

// Start the Redis consumer
// client.on('ready', () => {
//     console.log('Consumer code');
//     redisConsumer.startConsumer(client, redisConsumerCallback);
// });

client.on('error', (err) => {
    console.error('Redis Error:', err);
});

(async () => {
    await startConsumer();
    console.log('RabbitMQ Consumer started');
  })();

// redisConsumer.startConsumer(client);

app.use(express.json());

const planRouter = require("./routes/plan")(client)

app.use("/v1/plan", verifyIdToken, planRouter);

// redisConsumer.startConsumer(client, redisConsumerCallback);

// const startRedisConsumer = async () => {
//     const queueKey = 'plan'; // Replace with your actual Redis queue key
  
//     const pollQueue = async () => {
//         console.log("inside consumer");
//         try {
//             const reply = await client.brPop(queueKey, 0);
//             const message = reply[1];
//             redisConsumerCallback(message);
//             await pollQueue(); // Continue polling for new messages
//         } catch (err) {
//             console.error('Error polling Redis queue:', err);
//         }
//     };
  
//     await pollQueue();
//   };
  
//   startRedisConsumer();

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});