/**
 * I put all the states and action handlers in one file.
 * It does not really matter where you put them though.
 *
 * @format
 */

const defaultTodos = [
  {
    value: 'Become a developer.',
    isDone: true
  },
  {
    value: 'Become an open-source contributor.',
    isDone: true
  },
  {
    value: 'Become a scientist.',
    isDone: false
  }
];

export default {
  userState: {
    username: 'April'
  },
  todos: [...defaultTodos]
};
