const express = require('express')

const app = express()
const port = 3000

var lastKnownLocationObject

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/put-location', (req, res) => {
  if (req.header("Content-Type") !== "application/json") {
    res.send("Bad request")
    return
  }

  if (Object.keys(req.body).length === 0) {
    res.send("Empty body")
    return
  }

  // We assume we have a valid location entry here
  // documentation on req body is here https://overland.p3k.app/
  let locationEntries = req.body.locations

  // {
  //   type: 'Feature',
  //   geometry: {
  //        type: 'Point',
  //        coordinates: [ -122.05361586868501, 36.97086197075715 ]
  // },
  //   properties: {
  //     speed: 1,
  //         battery_state: 'unplugged',
  //         motion: [ 'walking' ],
  //         timestamp: '2021-11-13T06:01:09Z',
  //         battery_level: 1,
  //         vertical_accuracy: 3,
  //         pauses: false,
  //         horizontal_accuracy: 5,
  //         wifi: '',
  //         deferred: 100,
  //         significant_change: 1,
  //         locations_in_payload: 1,
  //         activity: 'other',
  //         device_id: 'CDXS',
  //         altitude: 75,
  //         desired_accuracy: -1
  //   }
  // }
  // Format of this object ^^
  lastKnownLocationObject = locationEntries[locationEntries.length - 1]

  // This response is necessary to flush the app's cache of locations from the batch it just sent
  res.send({ result: "ok" })
})

//for our front end to call it will get an array of double with two entries in the array for coordiinates
app.get('/get-location', (req, res) => {
  if (!lastKnownLocationObject) {
    res.status(404)
    res.send({status: 'not found'})
    return
  }

  res.send(lastKnownLocationObject.geometry.coordinates)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const setCoordinates = (coords) => {
  lastKnownLocationObject = coords
}

module.exports = app
module.exports.setCoordinates = setCoordinates
