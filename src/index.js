/** @format */

import { Component } from 'inferno';
import PropTypes from 'prop-types';
import createInfernoContext from 'create-inferno-context';

const StoreContext = createInfernoContext();

/**
 *
 * @param {Function} wantedState a function that will accept the store's current state.
 * @param {Object} wantedMutators object that would have methods which would become the actions that you can dispatch to update the store's state.
 */
export function connect (wantedState, wantedMutators) {
  function mapActionsToProps (updateStore, storeState) {
    return wantedMutators
      ? Object.keys(wantedMutators).reduce(
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
        )
      : {};
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

    if (this.props.persist !== false) {
      const savedStore = this.props.persist.storage.getItem(
        this.props.persist.key || 'inferno-context-api-store'
      );

      const persistedState = this.props.persist.statesToPersist(JSON.parse(savedStore) || {});
      this.persistedStateKeys = Object.keys(persistedState);

      this.state = {
        ...this.props.store,
        ...persistedState
      };

      this.persist();
    } else {
      this.state = { ...this.props.store };
    }
  }

  persist = () => {
    if (this.props.persist !== false) {
      this.props.persist.storage.removeItem(this.props.persist.key || 'inferno-context-api-store');
      this.props.persist.storage.setItem(
        this.props.persist.key || 'inferno-context-api-store',
        JSON.stringify(
          this.persistedStateKeys.reduce(
            (compiled, key) => ({
              ...compiled,
              [key]: this.state[key]
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
        state: { ...this.state },
        updateStore: (updatedStore, callback) => {
          this.setState(
            {
              ...this.state,
              ...updatedStore
            },
            () => {
              this.persist();
              if (callback) callback(this.state);
            }
          );
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
  ])
};

Provider.defaultProps = {
  persist: false
};
