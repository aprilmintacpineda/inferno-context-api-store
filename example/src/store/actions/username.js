/** @format */

export function changeUsername (store, updatedUsername) {
  // you can do api calls in here

  if (!updatedUsername) {
    return store.updateStore({
      userState: {
        username: 'April'
      }
    });
  }

  return store.updateStore({
    userState: {
      username: updatedUsername
    }
  });
}
