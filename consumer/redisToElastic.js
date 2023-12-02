const elasticsearch = require('elasticsearch');
const redis = require('redis');
const { indexDataWithParentChild } = require('./indexParentChild');

// const esClient = new elasticsearch.Client({
//   host: 'localhost:9200', // Adjust as needed
//   log: 'trace', // Set the log level based on your needs (trace, debug, info, warning, error)
// });

// const consumerClient = redis.createClient();

const startConsumer = (consumerClient) => {
  console.log("Consumer code has started...");
  // const processQueue = async () => {
  //   console.log("Has come to processQueue");
  //   let plan = await consumerClient.blPop('plan', 0)
  //   console.log("plan inside consumer: ", plan)
  //   if (plan) {
  //     callback(plan);
  //     processQueue();
  //   }
  //   else {
  //     console.log('Queue is empty. Waiting for new data...');
  //     setTimeout(processQueue, 1000);
  //   }
  //   // .then(() => {
  //   //   const [, dataString] = result || [];
  //   //   console.log('Data retrieved from the queue:', dataString);
  //   //   if (dataString) {
  //   //     callback(dataString);
  //   //     console.log('Data processed successfully.');
  //   //     processQueue();
  //   //   } else {
  //   //     console.log('Queue is empty. Waiting for new data...');
  //   //     setTimeout(processQueue, 1000);
  //   //   }
  //   // })
  //   // .catch((err) => {
  //   //   console.log('Error in blPop:', err);
  //   // })
  // };

  const processQueue = async () => {
    console.log("Has come to processQueue");
    let result = await consumerClient.blPop('plan', 0);
    console.log(result);
    if (result) {
      let dataString = result.element;
      console.log("plan inside consumer: ", dataString);
      if (dataString) {
        // callback(dataString);
        // processQueue();
        // Parse the dataString if needed
        const data = JSON.parse(dataString);

        // Call the indexWithParentChild function with the parsed data
        await indexDataWithParentChild(data);

        // Continue processing the queue
        processQueue();
      } else {
        console.log('Queue is empty. Waiting for new data...');
        setTimeout(processQueue, 10);
      }
    } else {
      console.log('Error in blPop. Result:', result);
      setTimeout(processQueue, 1000);
    }
  };

  processQueue();

}

module.exports = {
  startConsumer
}

