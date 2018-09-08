/** @format */
import createInfernoContext from 'create-inferno-context';
import { Component } from 'inferno';
import raf from 'raf';

const StoreContext = createInfernoContext();
let storeState = {};

/**
 * @return store's state.
 */
export function getStoreState () {
  return { ...storeState };
}

/**
 *
 * @param {Function} wantedState a function that will accept the store's current state.
 * @param {Object} wantedMutators object that would have methods which would become the actions that you can dispatch to update the store's state.
 */
export function connect (wantedState, wantedMutators) {
  function mapActionsToProps (updateStore, storeState) {
    if (Boolean(wantedMutators)) {
      return Object.keys(wantedMutators).reduce(
        (accumulatedMutators, mutator) => ({
          ...accumulatedMutators,
          [mutator]: (...payload) =>
            wantedMutators[mutator](
              {
                state: storeState,
                updateStore
              },
              ...payload
            )
        }),
        {}
      );
    }

    return {};
  }

  function mapStateToProps (storeState) {
    return wantedState ? wantedState(storeState) : {};
  }

  return WrappedComponent => props => (
    <StoreContext.Consumer>
      {context => (
        <WrappedComponent
          {...mapStateToProps({ ...context.state })}
          {...mapActionsToProps(context.updateStore, { ...context.state })}
          {...props}
        />
      )}
    </StoreContext.Consumer>
  );
}

export default class Provider extends Component {
  constructor (props) {
    super(props);

    this.state = {
      count: 0
    };

    if (this.props.persist) {
      const savedStore = this.props.persist.storage.getItem(
        this.props.persist.key || 'inferno-context-api-store'
      );

      const persistedState = this.props.persist.statesToPersist(JSON.parse(savedStore) || {});
      this.persistedStateKeys = Object.keys(persistedState);

      storeState = {
        ...this.props.store,
        ...persistedState
      };

      this.persist();
    } else {
      storeState = { ...this.props.store };
    }
  }

  persist = () => {
    if (this.props.persist) {
      if (this.persistTimeout) raf.cancel(this.persistTimeout);

      const callTime = Date.now() + 100;
      const tick = () => {
        if (Date.now() >= callTime) {
          this.props.persist.storage.removeItem(
            this.props.persist.key || 'inferno-context-api-store'
          );
          this.props.persist.storage.setItem(
            this.props.persist.key || 'inferno-context-api-store',
            JSON.stringify(
              this.persistedStateKeys.reduce(
                (compiled, key) => ({
                  ...compiled,
                  [key]: storeState[key]
                }),
                {}
              )
            )
          );
        } else {
          this.persistTimeout = raf(tick);
        }
      };

      this.persistTimeout = raf(tick);
    }
  };

  render = () => (
    <StoreContext.Provider
      value={{
        state: { ...storeState },
        updateStore: (updatedStore, callback) => {
          if (this.updateTimeout) raf.cancel(this.updateTimeout);

          storeState = {
            ...storeState,
            ...updatedStore
          };

          if (this.props.defer) {
            // defer update so we only update as minimal as possible.
            const callTime = Date.now() + this.props.defer;

            const tick = () => {
              if (Date.now() >= callTime) {
                this.setState(
                  {
                    count: this.state.count + 1
                  },
                  () => {
                    this.persist();
                    if (callback) callback(storeState);
                  }
                );
              } else {
                this.updateTimeout = raf(tick);
              }
            };

            this.updateTimeout = raf(tick);
          } else {
            // don't defer state
            this.setState(
              {
                count: this.state.count + 1
              },
              () => {
                this.persist();
                if (callback) callback(storeState);
              }
            );
          }
        }
      }}>
      {this.props.children}
    </StoreContext.Provider>
  );
}

Provider.defaultProps = {
  persist: false,
  defer: false
};
