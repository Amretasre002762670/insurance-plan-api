const amqp = require('amqplib');
const flatted = require('flatted');

const rabbitMQUrl = 'amqp://localhost'; // Replace with your RabbitMQ server URL
const queueName = 'plan'; // Replace with your queue name

async function pushToQueue(data) {
  try {
    console.log("pushToQueue: ", JSON.stringify(data));
    console.log("pushToQueue with flatted: ", flatted.stringify(data));
    const connection = await amqp.connect(rabbitMQUrl);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName);
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));

    console.log('Message sent to RabbitMQ queue');

    await new Promise(resolve => setTimeout(resolve, 500));
    
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

module.exports = {
    pushToQueue
};
