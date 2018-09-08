/** @format */

import { render, Component } from 'inferno';
import { HashRouter, Route, Link, Switch } from 'inferno-router';
import Provider from './lib';

import routes from './routes';

import store from './store';

class App extends Component {
  render () {
    return (
      <Provider
        store={store}
        defer={100}
        persist={{
          storage: localStorage,
          statesToPersist (savedStore) {
            return {
              userState: savedStore.userState || store.userState
            };
          }
        }}>
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
