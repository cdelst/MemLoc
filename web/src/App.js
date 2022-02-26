import React, {useEffect} from "react";
import "./App.css";
import { Button, Card, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

var locationrn = ".";
var currLocation = [];
var currlocaation = [];
var coordOfLocation = [];
function Todo({ todo, index, markTodo, removeTodo }) {
  
 
  var displayLocationDue = true
  if (todo.coordinates) {
    const distanceFromCurrLocation = GetDistanceBetweenCoordinates(todo.coordinates)

    if (distanceFromCurrLocation < 1000) {
      displayLocationDue = true
    }
  } 
  
  var locationAndCoor = todo.location_text.split(',');
 // for (var a )
 var locationName = locationAndCoor.splice(0,locationAndCoor.length -2);
  console.log("loca: " + locationAndCoor[locationAndCoor.length-1]); //variable of cooridante value
  console.log("loca: " + locationAndCoor[locationAndCoor.length-2]); //variable of cooridante value
  console.log("loca: " + locationName);
  console.log("loca: " + todo.location_text[0]);

  
  return (
    <div
      className="todo"
      style={{backgroundColor: displayLocationDue ? "gold": ""}}
    >
      <span style={{ textDecoration: todo.isDone ? "line-through" : "" }}>{todo.text}</span>
      <span >{locationName}</span>
      <span >{todo.date_text}</span>
      <span >{todo.time_text}</span>
      <div>
        <Button variant="outline-success" onClick={() => markTodo(index)}>✓</Button>{' '}
        <Button variant="outline-danger" onClick={() => removeTodo(index)}>✕</Button>
      </div>
    </div>
  );
}

function GetDistanceBetweenCoordinates(todoLocation) {

  //currlocaation = [37.040998861397526, -122.07123581353396];

  const lat1 = (currLocation[0] * Math.PI) / 180.0;
  const lat2 = (todoLocation[0] * Math.PI) / 180.0;
  const long1 = (currLocation[1] * Math.PI) / 180.0;
  const long2 = (todoLocation[1] * Math.PI) / 180.0;

  const distanceInMiles = 3963 * Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(long2 - long1));

  console.log("The distance in miles" + distanceInMiles);
  return distanceInMiles;

}

function Popup({ todoLocation }) {
  if (currLocation[0] == todoLocation[0] && currLocation[1] == todoLocation[1]) {
    alert("Current location is same as location in to do list");
  }
}

function FormTodo({ addTodo }) {
  const [value, setValue] = React.useState("");
  const [location_value, setLocation] = React.useState("");
  const [location_value_coords, setLocationCoords] = React.useState("");
  const [location_value_in, setLocation_in] = React.useState("");
  const [date_value, setDate] = React.useState("");

  console.log("set location" + setLocation);
  // console.log("forming of todo:");
  // console.log(location_value);
  // console.log(value);
  // console.log("compair: " + locationrn + " and: " + location_value);
  if (locationrn != location_value_in) {
    callingwebsite(location_value_in);
    locationrn = location_value_in;
  }

  const myArray = currLocation;
  const options = myArray.map((item) => {

    return (
      <option key={item} value={[item[0],item[1]]}>
          {item[0]}
      </option>
    )
  })

  const [time_value, setTime] = React.useState("");

  const handleSubmit = e => {
    e.preventDefault();

    addTodo(value, location_value ? location_value : "", date_value ? date_value : "", time_value ? time_value : "");
    setValue("");
    setLocation("");
    setLocation_in("");
    setLocationCoords("");
    setDate("");
    setTime("");
  };
  return (

    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label><b>Add Todo</b></Form.Label>
        <p></p>
        <b>ToDo:</b>
        <Form.Control type="text" className="input" value={value} onChange={e => setValue(e.target.value)} placeholder="Add new todo task" required />
        <b>Where: </b>
        <Form.Control type="text" className="input" value={location_value_in} onChange={e => setLocation_in(e.target.value)} placeholder="Look up where" />
        <Form.Control
          as="select"

          value={value}
          onChange={e => setLocation(e.target.value)}
        
        >
          {options}
        </Form.Control>

        <b>Date: </b>
        <Form.Control type="date" className="input" value={date_value} onChange={e => setDate(e.target.value)} placeholder="Add Date" />
        <b>Time: </b>
        <Form.Control type="time" className="input" value={time_value} onChange={e => setTime(e.target.value)} placeholder="Add Time" />

      </Form.Group>
      <Button variant="primary mb-3" type="submit">
        Submit
      </Button>
    </Form>

  );
}


function App() {
  const [todos, setTodos] = React.useState([
    {
      text: "Pick up dog",
      location_text: "Goomer",
      date_text: "1-1-11",
      time_text: "1:00",
      isDone: false
    }
  ]);

  const [backendLocation, setBackendLocation] = React.useState(undefined)

  useEffect(() => {
    fetch('/get-location')
        .then((res) => res.json())
        .then((json) => {
          setBackendLocation(json)
        })
    console.log('backend location: ' + backendLocation)
  }, [])

  const addTodo = (text, location_text, date_text, time_text) => {
    const newTodos = [...todos, { text, location_text, date_text, time_text }];
    setTodos(newTodos);
  };

  const markTodo = index => {
    const newTodos = [...todos];
    newTodos[index].isDone = true;
    setTodos(newTodos);
  };

  const removeTodo = index => {
    const newTodos = [...todos];
    newTodos.splice(index, 1);
    setTodos(newTodos);
  };

  const checkDateandTime = () => {
    var now = new Date();
    // formatting date to be same format as input date
    var today = now.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replaceAll('. ', '-').replace('.', '');
    var curr_time = now.toLocaleTimeString('en',
      { timeStyle: 'short', hour12: false });
    for (let i = 0; i < todos.length; i++) {
      if (todos[i].date_text !== "") {
        if (todos[i].date_text == today && todos[i].time_text == "" && curr_time == "9:00") { // default notif at 9 AM if time not specified
          alert(todos[i].text + " is due today!");
        } else if (todos[i].date_text == today && todos[i].time_text == curr_time) {
          alert("time to do: " + todos[i].text);
        }
      }
    }

  }
  setInterval(checkDateandTime, 60 * 1000); // checkDateandTime is called every minute



  //the spacing is temporary I want to figuer it out difinitavly after all of the sections are filled
  return (
    <div className="app">
      <div className="container">
        <h1 className="text-center mb-4">Todo List</h1>
        <FormTodo addTodo={addTodo} />
        <div>
          <p> &emsp;Task  &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; Where &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; Date &emsp;&emsp;&emsp; Time</p>
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
    </div>
  );
}
async function callingwebsite(addressSoFar) {
  if (addressSoFar != undefined) {
    console.log("original: " + addressSoFar);

    var adressable = addressSoFar.replace(/ /g, "%20");
    console.log("adjusted: " + adressable);
  } else {
    console.log("the value is still undef");
  }
  var cap = "";
  var cap1 = "";
  var cap2 = "";
  var cap3 = "";
  var cap4 = "";
  var coord11 = -1;
  var coord12 = -1;
  var coord21 = -1;
  var coord22 = -1;
  var coord31 = -1;
  var coord32 = -1;
  var coord41 = -1;
  var coord42 = -1;
  var coord51 = -1;
  var coord52 = -1;
  
//console.log("the address" +addressSoFar);


  //let response = 
  await fetch('https://app.geocodeapi.io/api/v1/autocomplete?text=' + adressable + '&size=5&apikey=acd95820-8868-11ec-a0d2-f33e4cc02cff')
    .then(response => response.json())

    .then( json => { console.log(json);
    //   json => {
      console.log("coodrs: " + json.features[0].geometry.coordinates[0]);
      console.log("num 2: " +json.features[0].geometry.coordinates[1]);

      cap = json.features[0].properties.label;
      cap1 = json.features[1].properties.label;
      cap2 = json.features[2].properties.label;
      cap3 = json.features[3].properties.label;
      cap4 = json.features[4].properties.label;

      coord11 = json.features[0].geometry.coordinates[0];
      coord12 = json.features[0].geometry.coordinates[1];
      coord21 = json.features[1].geometry.coordinates[0];
      coord22 = json.features[1].geometry.coordinates[1];
      coord31 = json.features[2].geometry.coordinates[0];
      coord32 = json.features[2].geometry.coordinates[1];
      coord41 = json.features[3].geometry.coordinates[0];
      coord42 = json.features[3].geometry.coordinates[1];
      coord51 = json.features[4].geometry.coordinates[0];
      coord52 = json.features[4].geometry.coordinates[1];
  

    console.log(cap );
    console.log(cap1 );
    console.log(cap2);
    console.log(cap3 );
    console.log(cap4 );

    }//cap.map(function(capi) {

      // }); console.log(data); console.log("cap: " + cap); })
    )
    .catch(err => console.error(err));

     console.log(cap + "    " +cap1 + "    " + cap2 + "    " + cap3 + "    " + cap4 + "    ");
     currLocation = [[cap,[coord11, coord12]],[cap1,[coord21,coord22]],[cap2,[coord31,coord32]], [cap3,[coord41,coord42]], [cap4,[coord51,coord52]]]; //[cap, cap1, cap2, cap3, cap4 ];
     //coordOfLocation = [[cap,[coord11, coord12]],[cap1,[coord21,coord22]],[cap2,[coord31,coord32]], [cap3,[coord41,coord42]], [cap4,[coord51,coord52]]];
     console.log(currLocation);
     console.log(coordOfLocation);
   //  return (captuer);

  //console.log("will this work" + response.json());
}

export default App;
