//test.js

const server = require('../app');
const supertest = require('supertest');
const {setCoordinates} = require("../app");
const requestWithSupertest = supertest(server);


const dummyLocationExample = {
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [
            -122.030581, 37.331800
        ]
    },
    "properties": {
        "timestamp": "2015-10-01T08:00:00-0700",
        "altitude": 0,
        "speed": 4,
        "horizontal_accuracy": 30,
        "vertical_accuracy": -1,
        "motion": ["driving","stationary"],
        "pauses": false,
        "activity": "other_navigation",
        "desired_accuracy": 100,
        "deferred": 1000,
        "significant_change": "disabled",
        "locations_in_payload": 1,
        "device_id": "",
        "wifi": "launchpad",
        "battery_state": "charging",
        "battery_level": 0.89
    }
}

describe('Location Endpoint', () => {
    it('PUT location should store location', async () => {
        const res = await requestWithSupertest.post('/put-location', {body: dummyLocationExample});
        expect(res.status).toEqual(200);
    });

    it('GET location should send location', async () => {
        setCoordinates(dummyLocationExample)
        const res = await requestWithSupertest.get('/get-location');
        expect(res.status).toEqual(200);

        console.log(res.body)
        const arr = [-122.030581, 37.331800]
        expect(res.body).toEqual(arr)
    });
});