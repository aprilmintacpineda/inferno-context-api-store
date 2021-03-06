/** @format */

export function updateTodoDone (store, isDone, targetValue, targetIndex) {
  store.updateStore({
    todos: store.getStoreState().todos.map((todo, todoIndex) => {
      if (todo.value !== targetValue || todoIndex !== targetIndex) return todo;

      return {
        ...todo,
        isDone
      };
    })
  });
}

export function deleteTodo (store, targetValue, targetIndex) {
  store.updateStore({
    todos: store
      .getStoreState()
      .todos.filter((todo, todoIndex) => todo.value !== targetValue || todoIndex !== targetIndex)
  });
}

export function addTodo (store, value, callback) {
  store.updateStore(
    {
      todos: [
        ...store.getStoreState().todos,
        {
          value,
          isDone: false
        }
      ]
    },
    callback
  );
}
