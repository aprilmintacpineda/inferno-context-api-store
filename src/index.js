/** @format */
import PropTypes from 'prop-types';
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

    if (typeof this.props.persist === 'object') {
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

  timeout = (callback, ms) => {
    const tick = () => {
      if (Date.now() >= callTime) {
        callback();
      } else {
        this.timer = raf(tick);
      }
    };

    const callTime = Date.now() + ms;

    this.timer = raf(tick);
  };

  persist = () => {
    if (typeof this.props.persist === 'object') {
      this.props.persist.storage.removeItem(this.props.persist.key || 'inferno-context-api-store');
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
    }
  };

  render = () => (
    <StoreContext.Provider
      value={{
        state: { ...storeState },
        updateStore: (updatedStore, callback) => {
          if (this.timer) raf.cancel(this.timer);

          storeState = {
            ...storeState,
            ...updatedStore
          };

          if (typeof this.props.defer === 'number') {
            // defer update so we only update as minimal as possible.
            this.timeout(() => {
              this.setState(
                {
                  count: this.state.count + 1
                },
                () => {
                  if (callback) callback(storeState);
                }
              );

              this.persist();
            }, this.props.defer);
          } else {
            // don't defer state
            this.setState(
              {
                count: this.state.count + 1
              },
              () => {
                if (callback) callback(storeState);
              }
            );

            this.persist();
          }
        }
      }}>
      {this.props.children}
    </StoreContext.Provider>
  );
}

Provider.propTypes = {
  children: PropTypes.element.isRequired,
  store: PropTypes.object.isRequired,
  persist: PropTypes.oneOfType([
    PropTypes.shape({
      storage: PropTypes.object.isRequired,
      statesToPersist: PropTypes.func.isRequired,
      saveInitialState: PropTypes.bool,
      key: PropTypes.string
    }),
    PropTypes.oneOf([false])
  ]),
  defer: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([false])]).isRequired
};

Provider.defaultProps = {
  persist: false,
  defer: 100
};
