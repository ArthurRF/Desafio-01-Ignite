const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checkExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
      return response.status(404).json({ error: "User not found" })
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  const userAlreadyExists = users.find(
    (user) => user.username === username
  );

  users.push(user);

  return userAlreadyExists ? 
    response.status(400).json({ error: "User already exists" }) :  
    response.status(201).json(user);
});

app.get('/todos', checkExistsUserAccount, (request, response) => {
  const { user } = request;
  
  return response.json(user.todos);
});

app.post('/todos', checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todosInsert = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todosInsert);

  return response.status(201).json(todosInsert);
});

app.put('/todos/:id', checkExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = user.todos.find(
    (todo) => todo.id === id
  );

  if(!todo) {
    return response.status(404).json({ error: "Todo don't exists" });
  }
  
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checkExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find(
    (todo) => todo.id === id
  );

  if(!todo) {
    return response.status(404).json({ error: "Todo don't exists" });
  }

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checkExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.todos.findIndex(
    (todo) => todo.id === id
  );

  if(todoIndex === -1) {
    return response.status(404).json({ error: "Todo don't exists" });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).json();
});

module.exports = app;