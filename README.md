<!-- @format -->

# Repo status?

This library is actively being maintained by the developer. Feature requests, enhancements, and bug reports are all welcome to the issue section.

# inferno-context-api-store

Seemless, lightweight, state management library that supports async actions and state persisting out of the box. Inspired by Redux and Vuex. Built on top of [inferno-create-context](https://github.com/kurdin/create-inferno-context).

# Use case

When you want a state management that's small and supports asynchronous actions out of the box.

# Example

https://aprilmintacpineda.github.io/inferno-context-api-store/#/

# Guide

## Install

```
npm install inferno-context-api-store
yarn add inferno-context-api-store
```

## Usage

Usage is the same as with redux. Except I used React's new Context API in version 16.3.0. I also simplified store creation, action definition, and async action handing. If you've used Redux and Vuex in the past, everything here will be familiar to you.

###### Note

Make sure to read and understand all the notes here after as they convey a very important message.

#### The `Provider`

First, import `inferno-context-api-store` as `Provider`. The Provider is a component that accepts a prop called `store`. You would use this component as your top most component.

```jsx
import { render, Component } from 'inferno';
import { HashRouter, Route, Link, Switch } from 'inferno-router';
import Provider from 'inferno-context-api-store';

import routes from './routes';

import store from './store';

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <HashRouter>
          <div>
            <ul>
              <li>
                <Link to="/todos">Todos</Link>
              </li>
              <li>
                <Link to="/">Home</Link>
              </li>
            </ul>
            <Switch>
              {routes.map((route, i) => (
                <Route key={i} {...route} />
              ))}
            </Switch>
          </div>
        </HashRouter>
      </Provider>
    );
  }
}

render(<App />, document.querySelector('#app'));
```

#### The `store`

The store is simply a JS object where your global states would live.

```js
{
  userState: {
    username: defaultUsername
  },
  todos: [...defaultTodos],
  anotherState: valueHere,
  oneMoreState: oneMoreValue
};
```

Then you pass this as the `store` prop to the provider.

###### Note

The provider always assume that the store is an object. No checks were added to minimize the file size. Making sure that you pass an object as the `store` is up to you.

#### Connecting a component to the store

Works the same way as with redux, with a little bit of change. You import `{ connect }` from the `inferno-context-api-store` package. Connect is an HOC that wraps your component with the `Provider.Consumer` and passes all the states and actions to the component as properties.

`connect` accepts two arguments. The first parameter is a `callback function` that will receive the `store's current state`. It should return an object that maps all the states that you want the component to have.

###### Note

`connect` always assume that the first parameter is a function. No checks were added to minimize the file size.

**example code**

```js
function mapStateToProps (state => {
  console.log(state);

  return {
    // .. all the state that I want
    user: state.user,
    todos: state.todos
  }
})
```

The second parameter is an object containing all the functions that will serve as the action. This is typically what you call when the user clicks a button or a particular event occured. The action will receive the original parameters given to it, except it will receive an object as the first parameter, this object is provided by the `dispatcher`. The object contains two things, **(1)** the getStoreState function **(2)** a function called `updateStore`. The `updateStore` function is what you call when you want to update the state, you need to give it an object of the states that you want to update, the rest that you did not touch will remain unchanged and intact.

###### Note

- `connect` always assume that the second parameter is an object. No checks were added to minimize the file size.
- `dispatcher` always assume that all actions are functions. No checks were added to minimize the file size.
- `store.updateStore` always assume that you'll give it an object as the first parameter. No checks were added to minimize the file size.

**example code**

```jsx
// somewhere in your component
<input
  type="checkbox"
  checked={todo.isDone}
  onChange={e => this.props.updateTodoDone(e.target.checked, todo.value, i)}
/>;

// the second parameter
const actions = {
  updateTodoDone(store, isDone, targetValue, targetIndex) {
    store.updateStore({
      todos: store.getStoreState().todos.map((todo, todoIndex) => {
        if (todo.value != targetValue || todoIndex != targetIndex) return todo;

        return {
          ...todo,
          isDone
        };
      })
    });
  }
};
```

Over all, you'll have something like this:

```jsx
import { Component } from 'inferno';
import PropTypes from 'prop-types';
import { connect } from 'inferno-context-api-store';

/**
 * in this example, all the action handlers are in the
 * ../store/index.js but it does matter where you store them,
 * they are just functions that when executed gains access to the
 * store.
 */
import { updateTodoDone, deleteTodo, addTodo } from '../store';

class Todos extends Component {
  state = {
    newTodoValue: ''
  };

  handleNewTodoSubmit = e => {
    e.preventDefault();

    return this.props.addTodo(this.state.newTodoValue, () =>
      this.setState({
        newTodoValue: ''
      })
    );
  };

  addTodoForm = () => {
    return (
      <form onSubmit={this.handleNewTodoSubmit}>
        <input
          type="text"
          value={this.state.newTodoValue}
          onInput={e =>
            this.setState({
              newTodoValue: e.target.value
            })
          }
        />
        <input type="submit" value="Add todo" />
      </form>
    );
  };

  render() {
    if (!this.props.todos.length) {
      return (
        <div>
          {this.addTodoForm()}
          <h1>Hi {this.props.userState.username}, your todo list is empty.</h1>
        </div>
      );
    }

    return (
      <div>
        {this.addTodoForm()}
        <h1>
          Hi {this.props.userState.username}, {"here's your todo list"}.
        </h1>
        {this.props.todos.map((todo, i) => (
          <div key={i} style={{ marginBottom: '10px' }}>
            <span
              style={{
                cursor: 'pointer',
                userSelect: 'none',
                backgroundColor: 'red',
                color: 'white',
                marginRight: '2px',
                borderRadius: '2px',
                padding: '1px'
              }}
              onClick={() => this.props.deleteTodo(todo.value, i)}>
              x
            </span>
            <label style={{ cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={todo.isDone}
                onChange={e => this.props.updateTodoDone(e.target.checked, todo.value, i)}
              />
              {todo.isDone ? (
                <span style={{ color: 'red', textDecoration: 'line-through' }}>
                  <span style={{ color: 'gray' }}>{todo.value}</span>
                </span>
              ) : (
                <span>{todo.value}</span>
              )}
            </label>
          </div>
        ))}
      </div>
    );
  }
}

Todos.propTypes = {
  userState: PropTypes.object.isRequired,
  todos: PropTypes.arrayOf(PropTypes.object).isRequired,
  updateTodoDone: PropTypes.func.isRequired,
  deleteTodo: PropTypes.func.isRequired,
  addTodo: PropTypes.func.isRequired
};

export default connect(
  store => ({
    userState: store.userState,
    todos: store.todos
  }),
  {
    updateTodoDone,
    deleteTodo,
    addTodo,
    // you could also add something else here
    anotherAction(store) {
      /**
       * if your action handler does not call store.updateState();
       * nothing will happen to the state
       */
      console.log(store);
    }
  }
)(Todos);
```

#### Callback on `store.updateStore`

`store.updateStore` has a second optional parameter which should be a `function` that will be run as callback of `setState`. This callback will receive the store's update state as it's only parameter. Please see [react's docs](https://reactjs.org/docs/react-component.html#setstate) about `setState`.

#### Deferred update

You can defer update by passing the prop `defer` like so:

```jsx
<Provider
  defer={100}
  // rest of the codes
```

`defer` must be a number in milliseconds. Doing this would ensure minimal updates when more than one state update occured within the specified millisecond, you only update once. By default this feature is turned off.

## getStoreState function

If you want to get the state somewhere, for example in a function that get's called and is suppose to return something related to the global state. You can use the `getStoreState` function like so.

```jsx
import { getStoreState } from 'inferno-context-api-store';

function getSomething() {
  const storeState = getStoreState();
  // rest of the code
}
```

The function would return the store's updated state the moment it was called.

## Async actions

The package itself does not care how you handle this, you can use `async/await` if you like or stick to the chained `.then` of promises. But don't use generator functions as the store package was not equipped with it and supporting it is not an option because it would defeat the whole purpose of this library.

**example code**

```js
function myStateHandler(store, data) {
  store.updateState({
    aState: {
      ...store.getStoreState().aState,
      loading: true
    }
  });

  fetch('/somewhere')
    .then(response => response.json())
    .then(response => {
      // do something with the response

      store.updateState({
        aState: {
          ...store.getStoreState().aState,
          loading: false,
          data: { ...response.data }
        }
      });
    });
}
```

## Persisting states

If you want to persist states, just provide a second property called `persist` which is an object that has the following shape:

```js
{
  storage: window.localStorage, // the storage of where to save the state
  statesToPersist: savedStore => {
    /**
     * savedStore is the going to be an object that was saved
     * on the storage or an empty object if starting from scratch.
     * Note that the store would only save whatever state you return
     * here, the other states that were not returned here will not
     * be saved.
     *
     * Do whatever you need to do here
     * then return the states that you want to save.
     * NOTE: This is not strict, meaning, you can even
     * create a new state here that was not originally
     * part of the store and it will still be saved
     */
    return {
      someState: { ...savedStore.someState },
      anotherState: [ ...savedStore.anotherState ],
      someValue: savedStore.someValue
    }
  }
}
```

When the store is saving the state to the storage, it is also deferred by `100ms`, this is to ensure that the store only saves once in case the the state was updated multiple times within 100ms. This also allows other codes to execute.

**example snippet**

```jsx
<Provider store={store} persist={{
  storage: window.localStorage,
  statesToPersist (savedStore) {
    return { ...savedStore };
  }
}}>
```

In this case I'm passing in the `window.localStorage` as the storage but you are free to use whatever storage you need but it must have the following methods:

- `getItem` which receives the `key` as the first parameter.
- `setItem` which receives the `key` as the first parameter and `value` as the second parameter.
- `removeItem` which receives the `key` as the first parameter.

# Related

- [react-context-api-store](https://github.com/aprilmintacpineda/react-context-api-store) react compatible version of the same thing.
