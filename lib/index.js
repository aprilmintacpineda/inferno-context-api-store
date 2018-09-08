'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStoreState = getStoreState;
exports.connect = connect;

var _inferno = require('inferno');

var _createInfernoContext = require('create-inferno-context');

var _createInfernoContext2 = _interopRequireDefault(_createInfernoContext);

var _raf = require('raf');

var _raf2 = _interopRequireDefault(_raf);

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
var storeState = {};

/**
 * @return store's state.
 */
function getStoreState() {
  return _extends({}, storeState);
}

/**
 *
 * @param {Function} wantedState a function that will accept the store's current state.
 * @param {Object} wantedMutators object that would have methods which would become the actions that you can dispatch to update the store's state.
 */
function connect(wantedState, wantedMutators) {
  function mapActionsToProps(updateStore, storeState) {
    if (Boolean(wantedMutators)) {
      return Object.keys(wantedMutators).reduce(function (accumulatedMutators, mutator) {
        return _extends({}, accumulatedMutators, _defineProperty({}, mutator, function () {
          for (var _len = arguments.length, payload = Array(_len), _key = 0; _key < _len; _key++) {
            payload[_key] = arguments[_key];
          }

          return wantedMutators[mutator].apply(wantedMutators, [{
            state: storeState,
            updateStore: updateStore
          }].concat(payload));
        }));
      }, {});
    }

    return {};
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
      if (_this.props.persist) {
        if (_this.persistTimeout) _raf2.default.cancel(_this.persistTimeout);

        var callTime = Date.now() + 100;
        var tick = function tick() {
          if (Date.now() >= callTime) {
            _this.props.persist.storage.removeItem(_this.props.persist.key || 'inferno-context-api-store');
            _this.props.persist.storage.setItem(_this.props.persist.key || 'inferno-context-api-store', JSON.stringify(_this.persistedStateKeys.reduce(function (compiled, key) {
              return _extends({}, compiled, _defineProperty({}, key, storeState[key]));
            }, {})));
          } else {
            _this.persistTimeout = (0, _raf2.default)(tick);
          }
        };

        _this.persistTimeout = (0, _raf2.default)(tick);
      }
    };

    _this.render = function () {
      return (0, _inferno.createComponentVNode)(2, StoreContext.Provider, {
        'value': {
          state: _extends({}, storeState),
          updateStore: function updateStore(updatedStore, callback) {
            if (_this.updateTimeout) _raf2.default.cancel(_this.updateTimeout);

            storeState = _extends({}, storeState, updatedStore);

            if (_this.props.defer) {
              // defer update so we only update as minimal as possible.
              var callTime = Date.now() + _this.props.defer;

              var tick = function tick() {
                if (Date.now() >= callTime) {
                  _this.setState({
                    count: _this.state.count + 1
                  }, function () {
                    _this.persist();
                    if (callback) callback(storeState);
                  });
                } else {
                  _this.updateTimeout = (0, _raf2.default)(tick);
                }
              };

              _this.updateTimeout = (0, _raf2.default)(tick);
            } else {
              // don't defer state
              _this.setState({
                count: _this.state.count + 1
              }, function () {
                _this.persist();
                if (callback) callback(storeState);
              });
            }
          }
        },
        children: _this.props.children
      });
    };

    _this.state = {
      count: 0
    };

    if (_this.props.persist) {
      var savedStore = _this.props.persist.storage.getItem(_this.props.persist.key || 'inferno-context-api-store');

      var persistedState = _this.props.persist.statesToPersist(JSON.parse(savedStore) || {});
      _this.persistedStateKeys = Object.keys(persistedState);

      storeState = _extends({}, _this.props.store, persistedState);

      _this.persist();
    } else {
      storeState = _extends({}, _this.props.store);
    }
    return _this;
  }

  return Provider;
}(_inferno.Component);

exports.default = Provider;


Provider.defaultProps = {
  persist: !1,
  defer: !1
};