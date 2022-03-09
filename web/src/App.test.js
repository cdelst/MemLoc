import { render, screen, fireEvent, user, click } from '@testing-library/react';
import { Button, Card, Form } from "react-bootstrap";
import App from './App';


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

