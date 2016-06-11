'use strict';

const mqtt = require('mqtt');
const request = require('superagent');

// Obtain username, password, and data_topic by registering to iothub.id
// And ifttt_key also event from ifttt.com

const config = {
    host: 'iothub.id',
    port: 1883,
    username: '',
    password: '',
    ifttt_key: '',
    event: '',
    data_topic: '',
};
const connectionString = `mqtt://${config.host}:${config.port}`;

const client = mqtt.connect(connectionString, {
    username: config.username,
    password: config.password,
});

client.on('connect', () => {
    client.subscribe(config.data_topic);
});

client.on('message', (topic, data) => {
    const payload = JSON.parse(data.toString());
    let lastSendMessage;

    console.log('Got: ', payload);
    // change roomTemp with your data property
    if (payload.roomTemp >= 30) {
        const now = Date.now();

        if ((now - lastSendMessage) >= 10000 || !lastSendMessage) {
            request
                .post('https://maker.ifttt.com/trigger/${config.event}/with/key/${config.key}')
                .send({ value1: payload.roomTemp })
                .end((err, response) => {
                    if (err) {
                        console.error('Error occured: ', err.message);
                    }

                    lastSendMessage = Date.now();
                    console.log(response.text);
                });
        }
    }
});