// const redis = require('redis');
// const producerClient = redis.createClient();

const addToQueue = async (data, client) => {
  console.log("came to producer client");
  // console.log("client in producer: ", await client.connected());
  return new Promise((resolve, reject) => {
    console.log("Producer client promise")
    client.rPush(`plan`, JSON.stringify(data), (err, result) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        console.log(`Data added to the queue. Queue length: ${result}`);
        resolve('Operation successful');
      }
    });
  });
};


module.exports = { addToQueue };