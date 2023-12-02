const amqp = require('amqplib');
const { indexDataWithParentChild } = require('./indexParentChild');
const { patchAndUpdateElasticsearch } = require('./updateParentChild')
const flatted = require('flatted');
const rabbitMQUrl = 'amqp://localhost'; 
const queueName = 'plan'; 

// async function startConsumer() {
//   try {
//     const connection = await amqp.connect(rabbitMQUrl);
//     const channel = await connection.createChannel();

//     await channel.assertQueue(queueName);

//     console.log('Waiting for messages. To exit press CTRL+C');

//     channel.consume(queueName, async (msg) => {
//       if (msg !== null) {
//         const data = JSON.parse(msg.content.toString());
//         await indexDataWithParentChild(data);

//         console.log(`Processed message: ${msg.content.toString()}`);
//         channel.ack(msg);
//       }
//     });
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// }

// startConsumer();

async function startConsumer() {
    try {
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();

        await channel.assertQueue(queueName);

        console.log('Waiting for messages. To exit press CTRL+C');

        //   channel.consume(queueName, async (msg) => {
        //     if (msg !== null) {
        //       const data = JSON.parse(msg.content.toString());
        //       console.log("Data in consumer: ", data)
        //       await indexDataWithParentChild(data);

        //       console.log(`Processed message: ${msg.content.toString()}`);
        //       channel.ack(msg);
        //     }
        //   });

        channel.consume(queueName, async (msg) => {
            if (msg !== null) {
                const data = JSON.parse(msg.content.toString());
                // const data = flatted.parse(msg.content.toString());
                
                console.log("Data in consumer: ", data)

                switch (data.type) {
                    case 'update':
                        await patchAndUpdateElasticsearch(data);
                        break;
                    default:
                        await indexDataWithParentChild(data);
                        break;
                }

                console.log(`Processed message: ${msg.content.toString()}`);
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

module.exports = {
    startConsumer,
};
