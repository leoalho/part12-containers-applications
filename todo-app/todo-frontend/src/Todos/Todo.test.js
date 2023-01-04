import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import Todo from './Todo'

test('renders content', () => {
    const completeTodo =  (todo) => {
        console.log("create")
      }
    
      const deleteTodo = async (todo) => {
        console.log("delete")
      }

    const todo = {
    text: 'This is a todo for testing',
    done: true
  }

  render(<Todo todo={todo} deleteTodo={deleteTodo} completeTodo={completeTodo}/>)

  const element = screen.getByText('This is a todo for testing')

  screen.debug(element)
  expect(element).toBeDefined()

})