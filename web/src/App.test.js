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

test("input task is displayed", () => {

  const { getByLabelText, getByText, getByPlaceholderText} = render(<App />);
  const phNoValue = "129-098-0864";
  const inputValue = "Anna";

  const button = getByText(/Lets get started/i);

  fireEvent.change(getByLabelText(/name/i), { target: { value: inputValue } });
  fireEvent.change(getByLabelText(/phone/i), { target: { value: phNoValue } });
  fireEvent.click(button);

  const gr9 = screen.getByPlaceholderText("Add new todo task");
  fireEvent.change(gr9, {target: {value: "Finish Lab Report"}});

  expect(screen.getByDisplayValue("Finish Lab Report")).toBeInTheDocument();
});