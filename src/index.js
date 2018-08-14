/** @format */

import { Component } from 'inferno';
import PropTypes from 'prop-types';
import createInfernoContext from 'create-inferno-context';

const StoreContext = createInfernoContext();

const connect = (wantedState, wantedMutators) => WrappedComponent =>
  class Connect extends Component {
    dispatcher = (updateStore, storeState, action) => (...payload) =>
      action(
        {
          state: { ...storeState },
          updateStore
        },
        ...payload
      );

    mapStateToProps = storeState => (wantedState ? wantedState({ ...storeState }) : {});

    mapActionsToProps = (updateStore, storeState) =>
      wantedMutators
        ? Object.keys(wantedMutators).reduce(
            (accumulatedMutators, mutator) => ({
              ...accumulatedMutators,
              [mutator]: this.dispatcher(updateStore, storeState, wantedMutators[mutator])
            }),
            {}
          )
        : {};

    render = () => (
      <StoreContext.Consumer>
        {context => (
          <WrappedComponent
            {...this.mapStateToProps(context.state)}
            {...this.mapActionsToProps(context.updateStore, context.state)}
            {...this.props}
          />
        )}
      </StoreContext.Consumer>
    );
  };

class Provider extends Component {
  constructor (props) {
    super(props);

    this.defferedState = {};
    this.defferedStateChangeTimer = null;

    if (this.props.persist !== false) {
      const savedStore = this.props.persist.storage.getItem(
        this.props.persist.key || 'inferno-context-api-store'
      );

      this.state = {
        ...this.props.store,
        ...this.props.persist.statesToPersist(JSON.parse(savedStore) || {})
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
        JSON.stringify(this.state)
      );
    }
  };

  storeUpdater = callback =>
    this.setState(
      {
        ...this.state,
        ...this.defferedState
      },
      () => {
        this.persist();
        if (callback) callback(this.state);
      }
    );

  render = () => (
    <StoreContext.Provider
      value={{
        state: { ...this.state },
        updateStore: (updatedStore, callback) => {
          this.defferedState = {
            ...this.defferedState,
            ...updatedStore
          };

          if (this.defferedStateChangeTimer) {
            clearTimeout(this.defferedStateChangeTimer);
            this.defferedStateChangeTimer = null;
          }

          this.defferedStateChangeTimer = setTimeout(() => this.storeUpdater(callback), 20);
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

export { connect };
export default Provider;
