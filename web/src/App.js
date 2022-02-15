import React from "react";
import "./App.css";
import { Button, Card, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
//import require from "node.js";
//import initMap from "./initMap.js";

var locationrn = ".";
var currlocaation = [];
function Todo({ todo, index, markTodo, removeTodo }) {
  console.log("train");


  console.log(todo);
  return (
    <div
      className="todo"
    >
      <span style={{ textDecoration: todo.isDone ? "line-through" : "" }}>{todo.text}</span>
      <span >{todo.location_text}</span>
      <span >{todo.date_text}</span>
      <span >{todo.time_text}</span>
      <div>
        <Button variant="outline-success" onClick={() => markTodo(index)}>✓</Button>{' '}
        <Button variant="outline-danger" onClick={() => removeTodo(index)}>✕</Button>
      </div>
    </div>
  );
}

function GetDistanceBetweenCoordinates({ todoLocation, setDistance }) {
  const lat1 = (currlocaation[0] * Math.PI) / 180.0;
  const lat2 = (todoLocation[0] * Math.PI) / 180.0;
  const long1 = (currlocaation[1] * Math.PI) / 180.0;
  const long2 = (todoLocation[1] * Math.PI) / 180.0;


  const distanceInMiles = 3963 * Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(long2 - long1))
  if (setDistance < distanceInMiles) {
    return true;

  }
  else {
    return false;
  }

}

function Popup({todoLocation}) {
  if(currlocaation[0] == todoLocation[0]  && currlocaation[1] == todoLocation[1]) {
	  alert(“Current location is same as location in to do list”);
  }  
}

function FormTodo({ addTodo }) {
  const [value, setValue] = React.useState("");
  const [location_value, setLocation] = React.useState("");
  const [location_value_in, setLocation_in] = React.useState("");
  const [date_value, setDate] = React.useState("");
  // console.log("forming of todo:");
  // console.log(location_value);
  // console.log(value);
  // console.log("compair: " + locationrn + " and: " + location_value);
  if (locationrn != location_value_in) {
    callingwebsite(location_value_in);
    console.log(currlocaation);
    //console.log( "hate: " +callingwebsite(location_value_in));
    locationrn = location_value_in;
    console.log(location_value_in);
  }
  const arrayNew = [];
  //var red = "red!!";

  const myArray = currlocaation;
  const options = myArray.map((item) => {

    return (
      <option key={item} value={item}>

        {item}

      </option>
    )
  })

  const [time_value, setTime] = React.useState("");


  const handleSubmit = e => {
    console.log("forming of todo: crate");
    console.log(location_value);
    console.log(value);
    e.preventDefault();

    var today = new Date().toISOString().slice(0, 10);


    ///this makes it so that it will only let you submit when a date is choseen if it is in the futuer
    if (date_value !== "" && date_value < today) {
      return;
    }


    addTodo(value, location_value ? location_value : "", date_value ? date_value : "", time_value ? time_value : "");
    setValue("");
    setLocation("");
    setLocation_in("");
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


  const addTodo = (text, location_text, date_text, time_text) => {
    const newTodos = [...todos, { text, location_text, date_text, time_text }];

    console.log("here: ");
    console.log(newTodos);

    //newTodos.location = "grow";
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
  console.log("the address" + addressSoFar);

  //let response = 
  await fetch('https://app.geocodeapi.io/api/v1/autocomplete?text=' + adressable + '&size=5&apikey=acd95820-8868-11ec-a0d2-f33e4cc02cff')
    .then(response => response.json())
    .then(json => {
      console.log(json);
      //   json => {
      cap = json.features[0].properties.label;
      cap1 = json.features[1].properties.label;
      cap2 = json.features[2].properties.label;
      cap3 = json.features[3].properties.label;
      cap4 = json.features[4].properties.label;
      console.log(cap);
      console.log(cap1);
      console.log(cap2);
      console.log(cap3);
      console.log(cap4);

    }//cap.map(function(capi) {

      // }); console.log(data); console.log("cap: " + cap); })
    )
    .catch(err => console.error(err));
  console.log(cap + "    " + cap1 + "    " + cap2 + "    " + cap3 + "    " + cap4 + "    ");
  currlocaation = [cap, cap1, cap2, cap3, cap4];
  console.log(currlocaation);
  //  return (captuer);
  //console.log("will this work" + response.json());
}
export default App;
