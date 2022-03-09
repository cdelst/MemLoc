//test.js

const server = require("../app");
const supertest = require("supertest");
const { setCoordinates } = require("../app");
const requestWithSupertest = supertest(server);

const dummyLocationExample = {
  type: "Feature",
  geometry: {
    type: "Point",
    coordinates: [-122.030581, 37.3318],
  },
  properties: {
    timestamp: "2015-10-01T08:00:00-0700",
    altitude: 0,
    speed: 4,
    horizontal_accuracy: 30,
    vertical_accuracy: -1,
    motion: ["driving", "stationary"],
    pauses: false,
    activity: "other_navigation",
    desired_accuracy: 100,
    deferred: 1000,
    significant_change: "disabled",
    locations_in_payload: 1,
    device_id: "",
    wifi: "launchpad",
    battery_state: "charging",
    battery_level: 0.89,
  },
};

describe("Location Endpoint", () => {
  it("GET location should return a 404 when no location is stored", async () => {
    const res = await requestWithSupertest.get("/get-location");
    expect(res.status).toEqual(404);
  });

  it("PUT location should store location", async () => {
    const res = await requestWithSupertest.post("/put-location", {
      body: dummyLocationExample,
    });
    expect(res.status).toEqual(200);
  });

  it("GET location should send location", async () => {
    setCoordinates(dummyLocationExample);
    const res = await requestWithSupertest.get("/get-location");
    expect(res.status).toEqual(200);

    console.log(res.body);
    const arr = [-122.030581, 37.3318];
    expect(res.body).toEqual(arr);
  });

  it("Should result in error when you send a non json object when putting location", async () => {
    var randomXml = makeXmlFromOb(dummyLocationExample, XmlService.createElement('root'));
    const res = await requestWithSupertest.post("/put-location", {
      body: randomXml
    })
    expect(res.status).toEqual(400);
  });
});

describe("Testing text messages", () => {
  it("Text message should return 201 when text is sent", async () => {
    const res = await requestWithSupertest.post("/sendText", {
      body: dummyLocationExample
    });
    expect(res.status).toEqual(201);
  });
  it("Should result in error when you send a non json object when sending a text", async () => {
    var randomXml = makeXmlFromOb(dummyLocationExample, XmlService.createElement('root'));
    const res = await requestWithSupertest.post("/sendText", {
      body: randomXml
    })
    expect(res.status).toEqual(400);
  });


});


function makeXmlFromOb(ob, parent) {
  // this is recursive to deal with multi level JSON objects
  Object.keys(ob).forEach(function (d) {

    // if the key is numeric, xml will fail, so rename array indices to value
    var child = XmlService.createElement(isNaN(new Number(d)) ? d : 'element');

    // add new created element to the parent
    parent.addContent(child);

    // need to recurse if this is an object/array
    if (typeof ob[d] === 'object') {

      // the new parent is the newly created node
      return makeXmlFromOb(ob[d], child);
    }
    else {

      // regular node, set the text to the value
      child.setText(ob[d]);
    }

  });

  return parent;
}

