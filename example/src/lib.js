'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connect = connect;

var _inferno = require('inferno');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createInfernoContext = require('create-inferno-context');

var _createInfernoContext2 = _interopRequireDefault(_createInfernoContext);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};
/** @format */

var StoreContext = (0, _createInfernoContext2.default)();

/**
 *
 * @param {Function} wantedState a function that will accept the store's current state.
 * @param {Object} wantedMutators object that would have methods which would become the actions that you can dispatch to update the store's state.
 */
function connect(wantedState, wantedMutators) {
  function mapActionsToProps(updateStore, storeState) {
    return wantedMutators ? Object.keys(wantedMutators).reduce(function (accumulatedMutators, mutator) {
      return _extends({}, accumulatedMutators, _defineProperty({}, mutator, function () {
        for (var _len = arguments.length, payload = Array(_len), _key = 0; _key < _len; _key++) {
          payload[_key] = arguments[_key];
        }

        return wantedMutators[mutator].apply(wantedMutators, [{
          state: storeState,
          updateStore: updateStore
        }].concat(payload));
      }));
    }, {}) : {};
  }

  function mapStateToProps(storeState) {
    return wantedState ? wantedState(storeState) : {};
  }

  return function (WrappedComponent) {
    return function (props) {
      return (0, _inferno.createComponentVNode)(2, StoreContext.Consumer, {
        children: function children(context) {
          return (0, _inferno.normalizeProps)((0, _inferno.createComponentVNode)(2, WrappedComponent, _extends({}, mapStateToProps(_extends({}, context.state)), mapActionsToProps(context.updateStore, _extends({}, context.state)), props)));
        }
      });
    };
  };
}

var Provider = function (_Component) {
  _inherits(Provider, _Component);

  function Provider(props) {
    _classCallCheck(this, Provider);

    var _this = _possibleConstructorReturn(this, (Provider.__proto__ || Object.getPrototypeOf(Provider)).call(this, props));

    _this.persist = function () {
      if (!1 !== _this.props.persist) {
        _this.props.persist.storage.removeItem(_this.props.persist.key || 'inferno-context-api-store');
        _this.props.persist.storage.setItem(_this.props.persist.key || 'inferno-context-api-store', JSON.stringify(_this.persistedStateKeys.reduce(function (compiled, key) {
          return _extends({}, compiled, _defineProperty({}, key, _this.state[key]));
        }, {})));
      }
    };

    _this.render = function () {
      return (0, _inferno.createComponentVNode)(2, StoreContext.Provider, {
        'value': {
          state: _extends({}, _this.state),
          updateStore: function updateStore(updatedStore, callback) {
            _this.setState(_extends({}, _this.state, updatedStore), function () {
              _this.persist();
              if (callback) callback(_this.state);
            });
          }
        },
        children: _this.props.children
      });
    };

    if (!1 !== _this.props.persist) {
      var savedStore = _this.props.persist.storage.getItem(_this.props.persist.key || 'inferno-context-api-store');

      var persistedState = _this.props.persist.statesToPersist(JSON.parse(savedStore) || {});
      _this.persistedStateKeys = Object.keys(persistedState);

      _this.state = _extends({}, _this.props.store, persistedState);

      _this.persist();
    } else {
      _this.state = _extends({}, _this.props.store);
    }
    return _this;
  }

  return Provider;
}(_inferno.Component);

exports.default = Provider;


Provider.propTypes = {
  children: _propTypes2.default.element.isRequired,
  store: _propTypes2.default.object.isRequired,
  persist: _propTypes2.default.oneOfType([_propTypes2.default.shape({
    storage: _propTypes2.default.object.isRequired,
    statesToPersist: _propTypes2.default.func.isRequired,
    saveInitialState: _propTypes2.default.bool,
    key: _propTypes2.default.string
  }), _propTypes2.default.oneOf([!1])])
};

Provider.defaultProps = {
  persist: !1
};