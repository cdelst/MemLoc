import { render, screen, waitFor, fireEvent, getByTestId, getAllByTestId} from '@testing-library/react';
import App from './App.js';
import ReactDOM from "react-dom";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

test("login becomes todo list", async () => {

  const { getByLabelText, getByText} = render(<App />);
  const phNoValue = "129-098-0864";
  const inputValue = "Anna";

  const button = getByText(/Lets get started/i);

  fireEvent.change(getByLabelText(/name/i), { target: { value: inputValue } });
  fireEvent.change(getByLabelText(/phone/i), { target: { value: phNoValue } });
  fireEvent.click(button);

  await expect(button).not.toBeInTheDocument();
});

test("one task is displayed", () => {

  const { getByLabelText, getByText, getByPlaceholderText} = render(<App />);
  const phNoValue = "129-098-0864";
  const inputValue = "Anna";

  const button = getByText(/Lets get started/i);

  fireEvent.change(getByLabelText(/name/i), { target: { value: inputValue } });
  fireEvent.change(getByLabelText(/phone/i), { target: { value: phNoValue } });
  fireEvent.click(button);

  const todo = screen.getByPlaceholderText("Add new todo task");
  fireEvent.change(todo, {target: {value: "Finish Lab Report"}});

  expect(screen.getByDisplayValue("Finish Lab Report")).toBeInTheDocument();
});

test("submit first task", async () => {
  const { getByText} = render(<App />);
  const button = getByText(/Lets get started/i);
  fireEvent.change(screen.getByPlaceholderText('Ex: 123-456-7891',"123-456-7891" )); 
  fireEvent.click(button);
  fireEvent.change(screen.getByPlaceholderText("Add new todo task","cry and fry" ));
  const emptyTodo = getByText(/Nothing to do!/i);
  const button3 = getByText(/Submit/i);
  fireEvent.click(button3);

  await expect(emptyTodo).not.toBeInTheDocument();
 });

test("delete last task", async () => {
  const { getByText} = render(<App />);
  const button = getByText(/Lets get started/i);
 
  fireEvent.change(screen.getByPlaceholderText('Ex: 123-456-7891',"123-456-7891" )); 
  fireEvent.click(button);
  fireEvent.change(screen.getByPlaceholderText("Add new todo task","cry and fry" ));
 
  const button3 = getByText(/Submit/i);
  fireEvent.click(button3);
  const button4 = getByText(/✕/i);
  fireEvent.click(button4);
  const emptyTodo = getByText(/Nothing to do!/i);
  
  await expect(emptyTodo).toBeInTheDocument();
 });
