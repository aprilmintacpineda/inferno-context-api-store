'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connect = undefined;

var _inferno = require('inferno');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createInfernoContext = require('create-inferno-context');

var _createInfernoContext2 = _interopRequireDefault(_createInfernoContext);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var connect = function connect(wantedState, wantedMutators) {
  return function (WrappedComponent) {
    return function (_Component) {
      _inherits(_class, _Component);

      function _class() {
        var _ref;

        var _this, _ret;

        _classCallCheck(this, _class);

        var _temp;

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class.__proto__ || Object.getPrototypeOf(_class)).call.apply(_ref, [this].concat(args))), _this), _this.dispatcher = function (updateStore, storeState, action) {
          return function () {
            for (var _len2 = arguments.length, payload = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
              payload[_key2] = arguments[_key2];
            }

            return action.apply(undefined, [{
              state: _extends({}, storeState),
              updateStore: updateStore
            }].concat(payload));
          };
        }, _this.mapStateToProps = function (storeState) {
          return wantedState ? wantedState(_extends({}, storeState)) : {};
        }, _this.mapActionsToProps = function (updateStore, storeState) {
          return wantedMutators ? Object.keys(wantedMutators).reduce(function (accumulatedMutators, mutator) {
            return _extends({}, accumulatedMutators, _defineProperty({}, mutator, _this.dispatcher(updateStore, storeState, wantedMutators[mutator])));
          }, {}) : {};
        }, _this.render = function () {
          return (0, _inferno.createComponentVNode)(2, StoreContext.Consumer, {
            children: function children(context) {
              return (0, _inferno.normalizeProps)((0, _inferno.createComponentVNode)(2, WrappedComponent, _extends({}, _this.mapStateToProps(context.state), _this.mapActionsToProps(context.updateStore, context.state), _this.props)));
            }
          });
        }, _temp), _possibleConstructorReturn(_this, _ret);
      }

      return _class;
    }(_inferno.Component);
  };
};

var Provider = function (_Component2) {
  _inherits(Provider, _Component2);

  function Provider(props) {
    _classCallCheck(this, Provider);

    var _this2 = _possibleConstructorReturn(this, (Provider.__proto__ || Object.getPrototypeOf(Provider)).call(this, props));

    _this2.persist = function () {
      if (!1 !== _this2.props.persist) {
        _this2.props.persist.storage.removeItem(_this2.props.persist.key || 'inferno-context-api-store');
        _this2.props.persist.storage.setItem(_this2.props.persist.key || 'inferno-context-api-store', JSON.stringify(_this2.state));
      }
    };

    _this2.render = function () {
      return (0, _inferno.createComponentVNode)(2, StoreContext.Provider, {
        'value': {
          state: _extends({}, _this2.state),
          updateStore: function updateStore(updatedStore, callback) {
            _this2.setState(_extends({}, _this2.state, updatedStore), function () {
              _this2.persist();
              if (callback) callback(_this2.state);
            });
          }
        },
        children: _this2.props.children
      });
    };

    if (!1 !== _this2.props.persist) {
      var savedStore = _this2.props.persist.storage.getItem(_this2.props.persist.key || 'inferno-context-api-store');

      _this2.state = _extends({}, _this2.props.store, _this2.props.persist.statesToPersist(JSON.parse(savedStore) || {}));

      _this2.persist();
    } else {
      _this2.state = _extends({}, _this2.props.store);
    }
    return _this2;
  }

  return Provider;
}(_inferno.Component);

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

exports.connect = connect;
exports.default = Provider;