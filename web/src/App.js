import React, { useEffect } from "react";
import "./App.css";
import { Button, Card, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

var locationrn = ".";
var currLocation = [];

function Todo({ todo, index, markTodo, removeTodo }) {
  var displayLocationDue = false;
  if (todo.coordinates) {
    const distanceFromCurrLocation = GetDistanceBetweenCoordinates(
      todo.coordinates
    );

    if (distanceFromCurrLocation < 1000) {
      displayLocationDue = true;
    }
  }

  var locationAndCoor = todo.location_text.split(",");
  // for (var a )
  var locationName = locationAndCoor.splice(0, locationAndCoor.length - 2);

  return (
    <div
      className="todo"
      style={{ backgroundColor: displayLocationDue ? "black" : "" }}
    >
      <span style={{ textDecoration: todo.isDone ? "line-through" : "" }}>
        {todo.text}
      </span>
      <span>{locationName}</span>
      <span>{todo.date_text}</span>
      <span>{todo.time_text}</span>
      <div>
        <Button variant="outline-success" onClick={() => markTodo(index)}>
          ✓
        </Button>{" "}
        <Button variant="outline-danger" onClick={() => removeTodo(index)}>
          ✕
        </Button>
      </div>
    </div>
  );
}

function GetDistanceBetweenCoordinates(todoLocation) {
  currLocation = [37.040998861397526, -122.07123581353396];

  const lat1 = (currLocation[0] * Math.PI) / 180.0;
  const lat2 = (todoLocation[0] * Math.PI) / 180.0;
  const long1 = (currLocation[1] * Math.PI) / 180.0;
  const long2 = (todoLocation[1] * Math.PI) / 180.0;

  const distanceInMiles =
    3963 *
    Math.acos(
      Math.sin(lat1) * Math.sin(lat2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.cos(long2 - long1)
    );

  console.log("The distance in miles" + distanceInMiles);
  return distanceInMiles;
}

function Popup({ todoLocation, todoItem }) {
  if (GetDistanceBetweenCoordinates(todoLocation) < 10) {
    const obj = { location: todoLocation, task: todoItem };
    sendNotificationToUser(obj);
    alert("Current location is same as location in to do list");
  }
}
function sendNotificationToUser(obj) {
  fetch("/sendText", {
    // Enter your IP address here
    headers: new Headers({ "content-type": "application/json" }),
    method: "POST",
    mode: "cors",
    body: JSON.stringify(obj),
  });
}
function FormTodo({ addTodo }) {
  const [value, setValue] = React.useState("");
  const [location_value, setLocation] = React.useState("");
  //const [location_value_coords, setLocationCoords] = React.useState("");
  const [location_value_in, setLocation_in] = React.useState("");
  const [date_value, setDate] = React.useState("");

  // TODO This function makes a call every single time a letter is typed.  Because the locationrn variable is global,
  //  we can't use a hook to debounce this. This probably needs to be fixed but tbh going through the effort of making
  //  everything non-global is effort. Just an FYI for anyone wondering why we're getting 429's
  if (locationrn != location_value_in) {
    callingwebsite(location_value_in);
    locationrn = location_value_in;
  }

  const myArray = currLocation;

  const options = myArray.map((item) => {
    if (item != ",-1,-1" && item != ",") {
      return (
        <option key={item} value={[item[0], item[1]]}>
          {item[0]}
        </option>
      );
    }
  });

  const [time_value, setTime] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Gets the Coordinates
    console.log("Location object: " + location_value.split(",").slice(-2));
    let coordinates = location_value.split(",").slice(-2);

    addTodo(
      value,
      location_value ? location_value : "",
      date_value ? date_value : "",
      time_value ? time_value : "",
      coordinates ? coordinates : []
    );
    setValue("");
    setLocation("");
    setLocation_in("");
    setDate("");
    setTime("");
  };
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label>
          <b>Add Todo</b>
        </Form.Label>
        <p></p>
        <b>ToDo:</b>
        <Form.Control
          type="text"
          className="input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add new todo task"
          required
        />
        <b>Location: </b>
        <Form.Control
          type="text"
          className="input"
          value={location_value_in}
          onChange={(e) => setLocation_in(e.target.value)}
          placeholder="ex. 1234 Main st., CA"
        />
        <Form.Control
          as="select"
          value={location_value}
          colorproperty="red"
          onChange={(e) => setLocation(e.target.value)}
        >
          {options}
        </Form.Control>

        <b>Date: </b>
        <Form.Control
          type="date"
          className="input"
          value={date_value}
          onChange={(e) => setDate(e.target.value)}
          placeholder="Add Date"
        />
        <b>Time: </b>
        <Form.Control
          type="time"
          className="input"
          value={time_value}
          onChange={(e) => setTime(e.target.value)}
          placeholder="Add Time"
        />
      </Form.Group>
      <p></p>
      <Button variant="primary mb-3" type="submit">
        Submit
      </Button>
      <Button
        variant="primary mb-3"
        type="dummy"
        onClick={sendNotificationToUser}
      >
        Dummy Button
      </Button>
    </Form>
  );
}

function App() {
  const [todos, setTodos] = React.useState([
    {
      text: "Pick up dog",
      location_text: "Groomer",
      date_text: "1-1-11",
      time_text: "1:00",
      isDone: false,
      phNo: "",
    },
  ]);

  const [backendLocation, setBackendLocation] = React.useState(undefined);

  useEffect(() => {
    fetch("/get-location")
      .then((res) => res.json())
      .then((json) => {
        setBackendLocation(json);
      });
    console.log("backend location: " + backendLocation);
  }, []);

  const addTodo = (text, location_text, date_text, time_text, coordinates) => {
    const newTodos = [
      ...todos,
      { text, location_text, date_text, time_text, coordinates },
    ];

    console.log("Coordinates: " + coordinates);

    setTodos(newTodos);
  };

  const markTodo = (index) => {
    const newTodos = [...todos];
    newTodos[index].isDone = true;
    setTodos(newTodos);
  };

  const removeTodo = (index) => {
    const newTodos = [...todos];
    newTodos.splice(index, 1);
    setTodos(newTodos);
  };

  const checkDateandTime = () => {
    var now = new Date();
    // formatting date to be same format as input date
    var today = now
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replaceAll(". ", "-")
      .replace(".", "");
    var curr_time = now.toLocaleTimeString("en", {
      timeStyle: "short",
      hour12: false,
    });
    for (let i = 0; i < todos.length; i++) {
      if (todos[i].date_text !== "") {
        if (
          todos[i].date_text == today &&
          todos[i].time_text == "" &&
          curr_time == "9:00"
        ) {
          // default notif at 9 AM if time not specified
          alert(todos[i].text + " is due today!");
        } else if (
          todos[i].date_text == today &&
          todos[i].time_text == curr_time
        ) {
          alert("time to do: " + todos[i].text);
        }
      }
    }
  };
  setInterval(checkDateandTime, 60 * 1000); // checkDateandTime is called every minute

  // Initial page set up
  const [phNo, setPhone] = React.useState("");
  const [showpage, setShowpage] = React.useState(false);

  return (
    <div className="app">
      <div className="container">
        <h1 className="text-center mb-4">Todo List</h1>
        {!showpage && (
          <div>
            <form
              onSubmit={() => {
                let phone = document.getElementById("phone").value;
                setPhone(phone);
                setShowpage(true);
              }}
            >
              <label>Enter your phone number (Format: xxx-xxx-xxxx): </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Ex: 123-456-7891"
                required
                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
              ></input>
              <br></br>
              <button type="submit">let's get started!</button>
            </form>
          </div>
        )}
        {showpage && (
          <div>
            <FormTodo addTodo={addTodo} />
            <div>
              <div id="mozdiv1">
                &emsp;Task
                &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
                Where
                &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
                Date &emsp;&emsp;&emsp; Time
              </div>

              {todos.map((todo, index) => (
                <Card>
                  <Card.Body>
                    <Todo
                      key={index}
                      index={index}
                      todo={todo}
                      markTodo={markTodo}
                      removeTodo={removeTodo}
                    />
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// &emsp;Task
// &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
// Where
// &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
// Date &emsp;&emsp;&emsp; Time
async function callingwebsite(addressSoFar) {
  //var adressable = "";
  if (addressSoFar != undefined) {
    var adressable = addressSoFar.replace(/ /g, "%20");
  }

  var cap = "";
  var cap1 = "";
  var cap2 = "";
  var cap3 = "";
  var cap4 = "";
  var coord1 = [];
  var coord2 = [];
  var coord3 = [];
  var coord4 = [];
  var coord5 = [];
  //doesnt work: (this restrict what could be searched but are throughing errors so I am usign a focusing point on santa cruz)
  //https://app.geocodeapi.io/api/v1/autocomplete?text=106&size=5&boundary.country=ISO-3166&boundary.circle.lon=36.9741&boundary.circle.lat=-122.0308&boundary.circle.radius=35&apikey=acd95820-8868-11ec-a0d2-f33e4cc02cff
  //https://app.geocodeapi.io/api/v1/autocomplete?text=106&size=5&boundary.rect.min_lat=30.0000&boundary.rect.min_lon=-124.387058&boundary.rect.max_lat=38.0000&boundary.rect.max_lon=-116.568638&apikey=acd95820-8868-11ec-a0d2-f33e4cc02cff

  await fetch(
    "https://app.geocodeapi.io/api/v1/autocomplete?text=" +
      adressable +
      "&size=5&focus.point.lat=36.9741&focus.point.lon=-122.0308&apikey=acd95820-8868-11ec-a0d2-f33e4cc02cff"
  ) //focus.point.lon=36.9741&focus.point.lat=-122.0308
    .then((response) => response.json())

    .then((json) => {
      cap = json.features[0].properties.label;
      cap1 = json.features[1].properties.label;
      cap2 = json.features[2].properties.label;
      cap3 = json.features[3].properties.label;
      cap4 = json.features[4].properties.label;

      coord1 = json.features[0].geometry.coordinates;
      coord2 = json.features[1].geometry.coordinates;
      coord3 = json.features[2].geometry.coordinates;
      coord4 = json.features[3].geometry.coordinates;
      coord5 = json.features[4].geometry.coordinates;
    })
    .catch((err) => console.error(err));

  currLocation = [
    [cap, coord1],
    [cap1, coord2],
    [cap2, coord3],
    [cap3, coord4],
    [cap4, coord5],
  ];
}

export default App;
