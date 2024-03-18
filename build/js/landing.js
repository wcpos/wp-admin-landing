/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/components/error.tsx":
/*!**********************************!*\
  !*** ./src/components/error.tsx ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function get() {
        return m[k];
      }
    };
  }
  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});
var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  __setModuleDefault(result, mod);
  return result;
};
var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
var React = __importStar(__webpack_require__(/*! react */ "react"));
var lodash_1 = __webpack_require__(/*! lodash */ "lodash");
var notice_1 = __importDefault(__webpack_require__(/*! ./notice */ "./src/components/notice.tsx"));
var ErrorFallback = function ErrorFallback(_a) {
  var error = _a.error,
    resetErrorBoundary = _a.resetErrorBoundary;
  var message = (0, lodash_1.get)(error, 'message', 'Unknown error');
  return React.createElement("div", {
    className: "wcpos-p-4"
  }, React.createElement(notice_1["default"], {
    status: "error",
    onRemove: resetErrorBoundary
  }, React.createElement("p", null, "Something went wrong: ", React.createElement("code", null, message))));
};
exports["default"] = ErrorFallback;

/***/ }),

/***/ "./src/components/notice.tsx":
/*!***********************************!*\
  !*** ./src/components/notice.tsx ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function get() {
        return m[k];
      }
    };
  }
  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});
var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  __setModuleDefault(result, mod);
  return result;
};
var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
var React = __importStar(__webpack_require__(/*! react */ "react"));
var classnames_1 = __importDefault(__webpack_require__(/*! classnames */ "./node_modules/classnames/index.js"));
var Notice = function Notice(_a) {
  var status = _a.status,
    children = _a.children,
    onRemove = _a.onRemove,
    _b = _a.isDismissible,
    isDismissible = _b === void 0 ? true : _b;
  return React.createElement("div", {
    className: (0, classnames_1["default"])('wcpos-flex wcpos-px-4 wcpos-py-2 wcpos-items-center', status === 'error' && 'wcpos-bg-red-300 wcpos-border-l-4 wcpos-border-red-600', status === 'info' && 'wcpos-bg-yellow-100 wcpos-border-l-4 wcpos-border-yellow-300', status === 'success' && 'wcpos-bg-green-100 wcpos-border-l-4 wcpos-border-green-600')
  }, React.createElement("div", {
    className: "wcpos-flex-1"
  }, children));
};
exports["default"] = Notice;

/***/ }),

/***/ "./src/index.tsx":
/*!***********************!*\
  !*** ./src/index.tsx ***!
  \***********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function get() {
        return m[k];
      }
    };
  }
  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});
var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  __setModuleDefault(result, mod);
  return result;
};
var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
var React = __importStar(__webpack_require__(/*! react */ "react"));
var element_1 = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
var react_error_boundary_1 = __webpack_require__(/*! react-error-boundary */ "./node_modules/react-error-boundary/dist/react-error-boundary.esm.js");
var error_1 = __importDefault(__webpack_require__(/*! ./components/error */ "./src/components/error.tsx"));
__webpack_require__(/*! ./index.css */ "./src/index.css");
var App = function App() {
  return React.createElement("h1", null, "Hello World!");
};
var Root = function Root() {
  return React.createElement(react_error_boundary_1.ErrorBoundary, {
    FallbackComponent: error_1["default"]
  }, React.createElement(App, null));
};
var el = document.getElementById('woocommerce-pos-upgrade');
if (element_1.createRoot) {
  (0, element_1.createRoot)(el).render(React.createElement(Root, null));
} else {
  (0, element_1.render)(React.createElement(Root, null), el);
}

/***/ }),

/***/ "./node_modules/classnames/index.js":
/*!******************************************!*\
  !*** ./node_modules/classnames/index.js ***!
  \******************************************/
/***/ ((module, exports) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;
	var nativeCodeString = '[native code]';

	function classNames() {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg)) {
				if (arg.length) {
					var inner = classNames.apply(null, arg);
					if (inner) {
						classes.push(inner);
					}
				}
			} else if (argType === 'object') {
				if (arg.toString !== Object.prototype.toString && !arg.toString.toString().includes('[native code]')) {
					classes.push(arg.toString());
					continue;
				}

				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if ( true && module.exports) {
		classNames.default = classNames;
		module.exports = classNames;
	} else if (true) {
		// register as 'classnames', consistent with npm package name
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
			return classNames;
		}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}());


/***/ }),

/***/ "./src/index.css":
/*!***********************!*\
  !*** ./src/index.css ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./node_modules/react-error-boundary/dist/react-error-boundary.esm.js":
/*!****************************************************************************!*\
  !*** ./node_modules/react-error-boundary/dist/react-error-boundary.esm.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ErrorBoundary: () => (/* binding */ ErrorBoundary),
/* harmony export */   ErrorBoundaryContext: () => (/* binding */ ErrorBoundaryContext),
/* harmony export */   useErrorBoundary: () => (/* binding */ useErrorBoundary),
/* harmony export */   withErrorBoundary: () => (/* binding */ withErrorBoundary)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
'use client';


const ErrorBoundaryContext = (0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)(null);

const initialState = {
  didCatch: false,
  error: null
};
class ErrorBoundary extends react__WEBPACK_IMPORTED_MODULE_0__.Component {
  constructor(props) {
    super(props);
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
    this.state = initialState;
  }
  static getDerivedStateFromError(error) {
    return {
      didCatch: true,
      error
    };
  }
  resetErrorBoundary() {
    const {
      error
    } = this.state;
    if (error !== null) {
      var _this$props$onReset, _this$props;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      (_this$props$onReset = (_this$props = this.props).onReset) === null || _this$props$onReset === void 0 ? void 0 : _this$props$onReset.call(_this$props, {
        args,
        reason: "imperative-api"
      });
      this.setState(initialState);
    }
  }
  componentDidCatch(error, info) {
    var _this$props$onError, _this$props2;
    (_this$props$onError = (_this$props2 = this.props).onError) === null || _this$props$onError === void 0 ? void 0 : _this$props$onError.call(_this$props2, error, info);
  }
  componentDidUpdate(prevProps, prevState) {
    const {
      didCatch
    } = this.state;
    const {
      resetKeys
    } = this.props;

    // There's an edge case where if the thing that triggered the error happens to *also* be in the resetKeys array,
    // we'd end up resetting the error boundary immediately.
    // This would likely trigger a second error to be thrown.
    // So we make sure that we don't check the resetKeys on the first call of cDU after the error is set.

    if (didCatch && prevState.error !== null && hasArrayChanged(prevProps.resetKeys, resetKeys)) {
      var _this$props$onReset2, _this$props3;
      (_this$props$onReset2 = (_this$props3 = this.props).onReset) === null || _this$props$onReset2 === void 0 ? void 0 : _this$props$onReset2.call(_this$props3, {
        next: resetKeys,
        prev: prevProps.resetKeys,
        reason: "keys"
      });
      this.setState(initialState);
    }
  }
  render() {
    const {
      children,
      fallbackRender,
      FallbackComponent,
      fallback
    } = this.props;
    const {
      didCatch,
      error
    } = this.state;
    let childToRender = children;
    if (didCatch) {
      const props = {
        error,
        resetErrorBoundary: this.resetErrorBoundary
      };
      if ((0,react__WEBPACK_IMPORTED_MODULE_0__.isValidElement)(fallback)) {
        childToRender = fallback;
      } else if (typeof fallbackRender === "function") {
        childToRender = fallbackRender(props);
      } else if (FallbackComponent) {
        childToRender = (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(FallbackComponent, props);
      } else {
        throw new Error("react-error-boundary requires either a fallback, fallbackRender, or FallbackComponent prop");
      }
    }
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(ErrorBoundaryContext.Provider, {
      value: {
        didCatch,
        error,
        resetErrorBoundary: this.resetErrorBoundary
      }
    }, childToRender);
  }
}
function hasArrayChanged() {
  let a = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  let b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return a.length !== b.length || a.some((item, index) => !Object.is(item, b[index]));
}

function assertErrorBoundaryContext(value) {
  if (value == null || typeof value.didCatch !== "boolean" || typeof value.resetErrorBoundary !== "function") {
    throw new Error("ErrorBoundaryContext not found");
  }
  return true;
}

function useErrorBoundary() {
  const context = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(ErrorBoundaryContext);
  assertErrorBoundaryContext(context);
  const [state, setState] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
    error: null,
    hasError: false
  });
  const memoized = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => ({
    resetBoundary: () => {
      context === null || context === void 0 ? void 0 : context.resetErrorBoundary();
      setState({
        error: null,
        hasError: false
      });
    },
    showBoundary: error => setState({
      error,
      hasError: true
    })
  }), [context === null || context === void 0 ? void 0 : context.resetErrorBoundary]);
  if (state.hasError) {
    throw state.error;
  }
  return memoized;
}

function withErrorBoundary(component, errorBoundaryProps) {
  const Wrapped = (0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)((props, ref) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(ErrorBoundary, errorBoundaryProps, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(component, {
    ...props,
    ref
  })));

  // Format for display in DevTools
  const name = component.displayName || component.name || "Unknown";
  Wrapped.displayName = "withErrorBoundary(".concat(name, ")");
  return Wrapped;
}




/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = React;

/***/ }),

/***/ "lodash":
/*!*************************!*\
  !*** external "lodash" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = lodash;

/***/ }),

/***/ "@wordpress/element":
/*!*****************************!*\
  !*** external "wp.element" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = wp.element;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.tsx");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlDQUFpQyxXQUFXO1dBQzVDO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7O1VFTkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9Ad2Nwb3Mvd3AtYWRtaW4tbGFuZGluZy8uL3NyYy9jb21wb25lbnRzL2Vycm9yLnRzeCIsIndlYnBhY2s6Ly9Ad2Nwb3Mvd3AtYWRtaW4tbGFuZGluZy8uL3NyYy9jb21wb25lbnRzL25vdGljZS50c3giLCJ3ZWJwYWNrOi8vQHdjcG9zL3dwLWFkbWluLWxhbmRpbmcvLi9zcmMvaW5kZXgudHN4Iiwid2VicGFjazovL0B3Y3Bvcy93cC1hZG1pbi1sYW5kaW5nLy4vbm9kZV9tb2R1bGVzL2NsYXNzbmFtZXMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vQHdjcG9zL3dwLWFkbWluLWxhbmRpbmcvLi9zcmMvaW5kZXguY3NzP2UxYjMiLCJ3ZWJwYWNrOi8vQHdjcG9zL3dwLWFkbWluLWxhbmRpbmcvLi9ub2RlX21vZHVsZXMvcmVhY3QtZXJyb3ItYm91bmRhcnkvZGlzdC9yZWFjdC1lcnJvci1ib3VuZGFyeS5lc20uanMiLCJ3ZWJwYWNrOi8vQHdjcG9zL3dwLWFkbWluLWxhbmRpbmcvZXh0ZXJuYWwgdmFyIFwiUmVhY3RcIiIsIndlYnBhY2s6Ly9Ad2Nwb3Mvd3AtYWRtaW4tbGFuZGluZy9leHRlcm5hbCB2YXIgXCJsb2Rhc2hcIiIsIndlYnBhY2s6Ly9Ad2Nwb3Mvd3AtYWRtaW4tbGFuZGluZy9leHRlcm5hbCB2YXIgXCJ3cC5lbGVtZW50XCIiLCJ3ZWJwYWNrOi8vQHdjcG9zL3dwLWFkbWluLWxhbmRpbmcvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vQHdjcG9zL3dwLWFkbWluLWxhbmRpbmcvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vQHdjcG9zL3dwLWFkbWluLWxhbmRpbmcvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL0B3Y3Bvcy93cC1hZG1pbi1sYW5kaW5nL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vQHdjcG9zL3dwLWFkbWluLWxhbmRpbmcvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9Ad2Nwb3Mvd3AtYWRtaW4tbGFuZGluZy93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL0B3Y3Bvcy93cC1hZG1pbi1sYW5kaW5nL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9Ad2Nwb3Mvd3AtYWRtaW4tbGFuZGluZy93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgeyBnZXQgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgRmFsbGJhY2tQcm9wcyB9IGZyb20gJ3JlYWN0LWVycm9yLWJvdW5kYXJ5JztcblxuaW1wb3J0IE5vdGljZSBmcm9tICcuL25vdGljZSc7XG5cbmNvbnN0IEVycm9yRmFsbGJhY2sgPSAoeyBlcnJvciwgcmVzZXRFcnJvckJvdW5kYXJ5IH06IEZhbGxiYWNrUHJvcHMpID0+IHtcblx0Y29uc3QgbWVzc2FnZSA9IGdldChlcnJvciwgJ21lc3NhZ2UnLCAnVW5rbm93biBlcnJvcicpO1xuXG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9XCJ3Y3Bvcy1wLTRcIj5cblx0XHRcdDxOb3RpY2Ugc3RhdHVzPVwiZXJyb3JcIiBvblJlbW92ZT17cmVzZXRFcnJvckJvdW5kYXJ5fT5cblx0XHRcdFx0PHA+XG5cdFx0XHRcdFx0U29tZXRoaW5nIHdlbnQgd3Jvbmc6IDxjb2RlPnttZXNzYWdlfTwvY29kZT5cblx0XHRcdFx0PC9wPlxuXHRcdFx0PC9Ob3RpY2U+XG5cdFx0PC9kaXY+XG5cdCk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBFcnJvckZhbGxiYWNrO1xuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxuaW50ZXJmYWNlIE5vdGljZVByb3BzIHtcblx0c3RhdHVzPzogJ2Vycm9yJyB8ICdpbmZvJyB8ICdzdWNjZXNzJztcblx0b25SZW1vdmU/OiAoKSA9PiB2b2lkO1xuXHRjaGlsZHJlbjogUmVhY3QuUmVhY3ROb2RlO1xuXHRpc0Rpc21pc3NpYmxlPzogYm9vbGVhbjtcbn1cblxuY29uc3QgTm90aWNlID0gKHsgc3RhdHVzLCBjaGlsZHJlbiwgb25SZW1vdmUsIGlzRGlzbWlzc2libGUgPSB0cnVlIH06IE5vdGljZVByb3BzKSA9PiB7XG5cdHJldHVybiAoXG5cdFx0PGRpdlxuXHRcdFx0Y2xhc3NOYW1lPXtjbGFzc05hbWVzKFxuXHRcdFx0XHQnd2Nwb3MtZmxleCB3Y3Bvcy1weC00IHdjcG9zLXB5LTIgd2Nwb3MtaXRlbXMtY2VudGVyJyxcblx0XHRcdFx0c3RhdHVzID09PSAnZXJyb3InICYmICd3Y3Bvcy1iZy1yZWQtMzAwIHdjcG9zLWJvcmRlci1sLTQgd2Nwb3MtYm9yZGVyLXJlZC02MDAnLFxuXHRcdFx0XHRzdGF0dXMgPT09ICdpbmZvJyAmJiAnd2Nwb3MtYmcteWVsbG93LTEwMCB3Y3Bvcy1ib3JkZXItbC00IHdjcG9zLWJvcmRlci15ZWxsb3ctMzAwJyxcblx0XHRcdFx0c3RhdHVzID09PSAnc3VjY2VzcycgJiYgJ3djcG9zLWJnLWdyZWVuLTEwMCB3Y3Bvcy1ib3JkZXItbC00IHdjcG9zLWJvcmRlci1ncmVlbi02MDAnXG5cdFx0XHQpfVxuXHRcdD5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwid2Nwb3MtZmxleC0xXCI+e2NoaWxkcmVufTwvZGl2PlxuXHRcdDwvZGl2PlxuXHQpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgTm90aWNlO1xuIiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgeyBjcmVhdGVSb290LCByZW5kZXIgfSBmcm9tICdAd29yZHByZXNzL2VsZW1lbnQnO1xuaW1wb3J0IHsgRXJyb3JCb3VuZGFyeSB9IGZyb20gJ3JlYWN0LWVycm9yLWJvdW5kYXJ5JztcblxuaW1wb3J0IEVycm9yIGZyb20gJy4vY29tcG9uZW50cy9lcnJvcic7XG5cbmltcG9ydCAnLi9pbmRleC5jc3MnO1xuXG5jb25zdCBBcHAgPSAoKSA9PiB7XG5cdHJldHVybiAoXG5cdFx0PGgxPkhlbGxvIFdvcmxkITwvaDE+XG5cdCk7XG59O1xuXG5jb25zdCBSb290ID0gKCkgPT4ge1xuXHRyZXR1cm4gKFxuXHRcdDxFcnJvckJvdW5kYXJ5IEZhbGxiYWNrQ29tcG9uZW50PXtFcnJvcn0+XG5cdFx0XHQ8QXBwIC8+XG5cdFx0PC9FcnJvckJvdW5kYXJ5PlxuXHQpO1xufTtcblxuY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd29vY29tbWVyY2UtcG9zLXVwZ3JhZGUnKTtcblxuaWYgKGNyZWF0ZVJvb3QpIHtcblx0Y3JlYXRlUm9vdChlbCkucmVuZGVyKDxSb290IC8+KTtcbn0gZWxzZSB7XG5cdHJlbmRlcig8Um9vdCAvPiwgZWwpO1xufVxuIiwiLyohXG5cdENvcHlyaWdodCAoYykgMjAxOCBKZWQgV2F0c29uLlxuXHRMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgKE1JVCksIHNlZVxuXHRodHRwOi8vamVkd2F0c29uLmdpdGh1Yi5pby9jbGFzc25hbWVzXG4qL1xuLyogZ2xvYmFsIGRlZmluZSAqL1xuXG4oZnVuY3Rpb24gKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIGhhc093biA9IHt9Lmhhc093blByb3BlcnR5O1xuXHR2YXIgbmF0aXZlQ29kZVN0cmluZyA9ICdbbmF0aXZlIGNvZGVdJztcblxuXHRmdW5jdGlvbiBjbGFzc05hbWVzKCkge1xuXHRcdHZhciBjbGFzc2VzID0gW107XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGFyZyA9IGFyZ3VtZW50c1tpXTtcblx0XHRcdGlmICghYXJnKSBjb250aW51ZTtcblxuXHRcdFx0dmFyIGFyZ1R5cGUgPSB0eXBlb2YgYXJnO1xuXG5cdFx0XHRpZiAoYXJnVHlwZSA9PT0gJ3N0cmluZycgfHwgYXJnVHlwZSA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0Y2xhc3Nlcy5wdXNoKGFyZyk7XG5cdFx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoYXJnKSkge1xuXHRcdFx0XHRpZiAoYXJnLmxlbmd0aCkge1xuXHRcdFx0XHRcdHZhciBpbm5lciA9IGNsYXNzTmFtZXMuYXBwbHkobnVsbCwgYXJnKTtcblx0XHRcdFx0XHRpZiAoaW5uZXIpIHtcblx0XHRcdFx0XHRcdGNsYXNzZXMucHVzaChpbm5lcik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKGFyZ1R5cGUgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdGlmIChhcmcudG9TdHJpbmcgIT09IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcgJiYgIWFyZy50b1N0cmluZy50b1N0cmluZygpLmluY2x1ZGVzKCdbbmF0aXZlIGNvZGVdJykpIHtcblx0XHRcdFx0XHRjbGFzc2VzLnB1c2goYXJnLnRvU3RyaW5nKCkpO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Zm9yICh2YXIga2V5IGluIGFyZykge1xuXHRcdFx0XHRcdGlmIChoYXNPd24uY2FsbChhcmcsIGtleSkgJiYgYXJnW2tleV0pIHtcblx0XHRcdFx0XHRcdGNsYXNzZXMucHVzaChrZXkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBjbGFzc2VzLmpvaW4oJyAnKTtcblx0fVxuXG5cdGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRcdGNsYXNzTmFtZXMuZGVmYXVsdCA9IGNsYXNzTmFtZXM7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBjbGFzc05hbWVzO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGRlZmluZS5hbWQgPT09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpIHtcblx0XHQvLyByZWdpc3RlciBhcyAnY2xhc3NuYW1lcycsIGNvbnNpc3RlbnQgd2l0aCBucG0gcGFja2FnZSBuYW1lXG5cdFx0ZGVmaW5lKCdjbGFzc25hbWVzJywgW10sIGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBjbGFzc05hbWVzO1xuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdHdpbmRvdy5jbGFzc05hbWVzID0gY2xhc3NOYW1lcztcblx0fVxufSgpKTtcbiIsIi8vIGV4dHJhY3RlZCBieSBtaW5pLWNzcy1leHRyYWN0LXBsdWdpblxuZXhwb3J0IHt9OyIsIid1c2UgY2xpZW50JztcbmltcG9ydCB7IGNyZWF0ZUNvbnRleHQsIENvbXBvbmVudCwgaXNWYWxpZEVsZW1lbnQsIGNyZWF0ZUVsZW1lbnQsIHVzZUNvbnRleHQsIHVzZVN0YXRlLCB1c2VNZW1vLCBmb3J3YXJkUmVmIH0gZnJvbSAncmVhY3QnO1xuXG5jb25zdCBFcnJvckJvdW5kYXJ5Q29udGV4dCA9IGNyZWF0ZUNvbnRleHQobnVsbCk7XG5cbmNvbnN0IGluaXRpYWxTdGF0ZSA9IHtcbiAgZGlkQ2F0Y2g6IGZhbHNlLFxuICBlcnJvcjogbnVsbFxufTtcbmNsYXNzIEVycm9yQm91bmRhcnkgZXh0ZW5kcyBDb21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnJlc2V0RXJyb3JCb3VuZGFyeSA9IHRoaXMucmVzZXRFcnJvckJvdW5kYXJ5LmJpbmQodGhpcyk7XG4gICAgdGhpcy5zdGF0ZSA9IGluaXRpYWxTdGF0ZTtcbiAgfVxuICBzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yKGVycm9yKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRpZENhdGNoOiB0cnVlLFxuICAgICAgZXJyb3JcbiAgICB9O1xuICB9XG4gIHJlc2V0RXJyb3JCb3VuZGFyeSgpIHtcbiAgICBjb25zdCB7XG4gICAgICBlcnJvclxuICAgIH0gPSB0aGlzLnN0YXRlO1xuICAgIGlmIChlcnJvciAhPT0gbnVsbCkge1xuICAgICAgdmFyIF90aGlzJHByb3BzJG9uUmVzZXQsIF90aGlzJHByb3BzO1xuICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICB9XG4gICAgICAoX3RoaXMkcHJvcHMkb25SZXNldCA9IChfdGhpcyRwcm9wcyA9IHRoaXMucHJvcHMpLm9uUmVzZXQpID09PSBudWxsIHx8IF90aGlzJHByb3BzJG9uUmVzZXQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF90aGlzJHByb3BzJG9uUmVzZXQuY2FsbChfdGhpcyRwcm9wcywge1xuICAgICAgICBhcmdzLFxuICAgICAgICByZWFzb246IFwiaW1wZXJhdGl2ZS1hcGlcIlxuICAgICAgfSk7XG4gICAgICB0aGlzLnNldFN0YXRlKGluaXRpYWxTdGF0ZSk7XG4gICAgfVxuICB9XG4gIGNvbXBvbmVudERpZENhdGNoKGVycm9yLCBpbmZvKSB7XG4gICAgdmFyIF90aGlzJHByb3BzJG9uRXJyb3IsIF90aGlzJHByb3BzMjtcbiAgICAoX3RoaXMkcHJvcHMkb25FcnJvciA9IChfdGhpcyRwcm9wczIgPSB0aGlzLnByb3BzKS5vbkVycm9yKSA9PT0gbnVsbCB8fCBfdGhpcyRwcm9wcyRvbkVycm9yID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfdGhpcyRwcm9wcyRvbkVycm9yLmNhbGwoX3RoaXMkcHJvcHMyLCBlcnJvciwgaW5mbyk7XG4gIH1cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wcywgcHJldlN0YXRlKSB7XG4gICAgY29uc3Qge1xuICAgICAgZGlkQ2F0Y2hcbiAgICB9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCB7XG4gICAgICByZXNldEtleXNcbiAgICB9ID0gdGhpcy5wcm9wcztcblxuICAgIC8vIFRoZXJlJ3MgYW4gZWRnZSBjYXNlIHdoZXJlIGlmIHRoZSB0aGluZyB0aGF0IHRyaWdnZXJlZCB0aGUgZXJyb3IgaGFwcGVucyB0byAqYWxzbyogYmUgaW4gdGhlIHJlc2V0S2V5cyBhcnJheSxcbiAgICAvLyB3ZSdkIGVuZCB1cCByZXNldHRpbmcgdGhlIGVycm9yIGJvdW5kYXJ5IGltbWVkaWF0ZWx5LlxuICAgIC8vIFRoaXMgd291bGQgbGlrZWx5IHRyaWdnZXIgYSBzZWNvbmQgZXJyb3IgdG8gYmUgdGhyb3duLlxuICAgIC8vIFNvIHdlIG1ha2Ugc3VyZSB0aGF0IHdlIGRvbid0IGNoZWNrIHRoZSByZXNldEtleXMgb24gdGhlIGZpcnN0IGNhbGwgb2YgY0RVIGFmdGVyIHRoZSBlcnJvciBpcyBzZXQuXG5cbiAgICBpZiAoZGlkQ2F0Y2ggJiYgcHJldlN0YXRlLmVycm9yICE9PSBudWxsICYmIGhhc0FycmF5Q2hhbmdlZChwcmV2UHJvcHMucmVzZXRLZXlzLCByZXNldEtleXMpKSB7XG4gICAgICB2YXIgX3RoaXMkcHJvcHMkb25SZXNldDIsIF90aGlzJHByb3BzMztcbiAgICAgIChfdGhpcyRwcm9wcyRvblJlc2V0MiA9IChfdGhpcyRwcm9wczMgPSB0aGlzLnByb3BzKS5vblJlc2V0KSA9PT0gbnVsbCB8fCBfdGhpcyRwcm9wcyRvblJlc2V0MiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX3RoaXMkcHJvcHMkb25SZXNldDIuY2FsbChfdGhpcyRwcm9wczMsIHtcbiAgICAgICAgbmV4dDogcmVzZXRLZXlzLFxuICAgICAgICBwcmV2OiBwcmV2UHJvcHMucmVzZXRLZXlzLFxuICAgICAgICByZWFzb246IFwia2V5c1wiXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoaW5pdGlhbFN0YXRlKTtcbiAgICB9XG4gIH1cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtcbiAgICAgIGNoaWxkcmVuLFxuICAgICAgZmFsbGJhY2tSZW5kZXIsXG4gICAgICBGYWxsYmFja0NvbXBvbmVudCxcbiAgICAgIGZhbGxiYWNrXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge1xuICAgICAgZGlkQ2F0Y2gsXG4gICAgICBlcnJvclxuICAgIH0gPSB0aGlzLnN0YXRlO1xuICAgIGxldCBjaGlsZFRvUmVuZGVyID0gY2hpbGRyZW47XG4gICAgaWYgKGRpZENhdGNoKSB7XG4gICAgICBjb25zdCBwcm9wcyA9IHtcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIHJlc2V0RXJyb3JCb3VuZGFyeTogdGhpcy5yZXNldEVycm9yQm91bmRhcnlcbiAgICAgIH07XG4gICAgICBpZiAoaXNWYWxpZEVsZW1lbnQoZmFsbGJhY2spKSB7XG4gICAgICAgIGNoaWxkVG9SZW5kZXIgPSBmYWxsYmFjaztcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGZhbGxiYWNrUmVuZGVyID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgY2hpbGRUb1JlbmRlciA9IGZhbGxiYWNrUmVuZGVyKHByb3BzKTtcbiAgICAgIH0gZWxzZSBpZiAoRmFsbGJhY2tDb21wb25lbnQpIHtcbiAgICAgICAgY2hpbGRUb1JlbmRlciA9IGNyZWF0ZUVsZW1lbnQoRmFsbGJhY2tDb21wb25lbnQsIHByb3BzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcInJlYWN0LWVycm9yLWJvdW5kYXJ5IHJlcXVpcmVzIGVpdGhlciBhIGZhbGxiYWNrLCBmYWxsYmFja1JlbmRlciwgb3IgRmFsbGJhY2tDb21wb25lbnQgcHJvcFwiKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQoRXJyb3JCb3VuZGFyeUNvbnRleHQuUHJvdmlkZXIsIHtcbiAgICAgIHZhbHVlOiB7XG4gICAgICAgIGRpZENhdGNoLFxuICAgICAgICBlcnJvcixcbiAgICAgICAgcmVzZXRFcnJvckJvdW5kYXJ5OiB0aGlzLnJlc2V0RXJyb3JCb3VuZGFyeVxuICAgICAgfVxuICAgIH0sIGNoaWxkVG9SZW5kZXIpO1xuICB9XG59XG5mdW5jdGlvbiBoYXNBcnJheUNoYW5nZWQoKSB7XG4gIGxldCBhID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiBbXTtcbiAgbGV0IGIgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IFtdO1xuICByZXR1cm4gYS5sZW5ndGggIT09IGIubGVuZ3RoIHx8IGEuc29tZSgoaXRlbSwgaW5kZXgpID0+ICFPYmplY3QuaXMoaXRlbSwgYltpbmRleF0pKTtcbn1cblxuZnVuY3Rpb24gYXNzZXJ0RXJyb3JCb3VuZGFyeUNvbnRleHQodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09IG51bGwgfHwgdHlwZW9mIHZhbHVlLmRpZENhdGNoICE9PSBcImJvb2xlYW5cIiB8fCB0eXBlb2YgdmFsdWUucmVzZXRFcnJvckJvdW5kYXJ5ICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJFcnJvckJvdW5kYXJ5Q29udGV4dCBub3QgZm91bmRcIik7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIHVzZUVycm9yQm91bmRhcnkoKSB7XG4gIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KEVycm9yQm91bmRhcnlDb250ZXh0KTtcbiAgYXNzZXJ0RXJyb3JCb3VuZGFyeUNvbnRleHQoY29udGV4dCk7XG4gIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gdXNlU3RhdGUoe1xuICAgIGVycm9yOiBudWxsLFxuICAgIGhhc0Vycm9yOiBmYWxzZVxuICB9KTtcbiAgY29uc3QgbWVtb2l6ZWQgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgcmVzZXRCb3VuZGFyeTogKCkgPT4ge1xuICAgICAgY29udGV4dCA9PT0gbnVsbCB8fCBjb250ZXh0ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBjb250ZXh0LnJlc2V0RXJyb3JCb3VuZGFyeSgpO1xuICAgICAgc2V0U3RhdGUoe1xuICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgaGFzRXJyb3I6IGZhbHNlXG4gICAgICB9KTtcbiAgICB9LFxuICAgIHNob3dCb3VuZGFyeTogZXJyb3IgPT4gc2V0U3RhdGUoe1xuICAgICAgZXJyb3IsXG4gICAgICBoYXNFcnJvcjogdHJ1ZVxuICAgIH0pXG4gIH0pLCBbY29udGV4dCA9PT0gbnVsbCB8fCBjb250ZXh0ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBjb250ZXh0LnJlc2V0RXJyb3JCb3VuZGFyeV0pO1xuICBpZiAoc3RhdGUuaGFzRXJyb3IpIHtcbiAgICB0aHJvdyBzdGF0ZS5lcnJvcjtcbiAgfVxuICByZXR1cm4gbWVtb2l6ZWQ7XG59XG5cbmZ1bmN0aW9uIHdpdGhFcnJvckJvdW5kYXJ5KGNvbXBvbmVudCwgZXJyb3JCb3VuZGFyeVByb3BzKSB7XG4gIGNvbnN0IFdyYXBwZWQgPSBmb3J3YXJkUmVmKChwcm9wcywgcmVmKSA9PiBjcmVhdGVFbGVtZW50KEVycm9yQm91bmRhcnksIGVycm9yQm91bmRhcnlQcm9wcywgY3JlYXRlRWxlbWVudChjb21wb25lbnQsIHtcbiAgICAuLi5wcm9wcyxcbiAgICByZWZcbiAgfSkpKTtcblxuICAvLyBGb3JtYXQgZm9yIGRpc3BsYXkgaW4gRGV2VG9vbHNcbiAgY29uc3QgbmFtZSA9IGNvbXBvbmVudC5kaXNwbGF5TmFtZSB8fCBjb21wb25lbnQubmFtZSB8fCBcIlVua25vd25cIjtcbiAgV3JhcHBlZC5kaXNwbGF5TmFtZSA9IFwid2l0aEVycm9yQm91bmRhcnkoXCIuY29uY2F0KG5hbWUsIFwiKVwiKTtcbiAgcmV0dXJuIFdyYXBwZWQ7XG59XG5cbmV4cG9ydCB7IEVycm9yQm91bmRhcnksIEVycm9yQm91bmRhcnlDb250ZXh0LCB1c2VFcnJvckJvdW5kYXJ5LCB3aXRoRXJyb3JCb3VuZGFyeSB9O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBSZWFjdDsiLCJtb2R1bGUuZXhwb3J0cyA9IGxvZGFzaDsiLCJtb2R1bGUuZXhwb3J0cyA9IHdwLmVsZW1lbnQ7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2luZGV4LnRzeFwiKTtcbiIsIiJdLCJuYW1lcyI6WyJSZWFjdCIsIl9faW1wb3J0U3RhciIsInJlcXVpcmUiLCJsb2Rhc2hfMSIsIm5vdGljZV8xIiwiX19pbXBvcnREZWZhdWx0IiwiRXJyb3JGYWxsYmFjayIsIl9hIiwiZXJyb3IiLCJyZXNldEVycm9yQm91bmRhcnkiLCJtZXNzYWdlIiwiZ2V0IiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTmFtZSIsInN0YXR1cyIsIm9uUmVtb3ZlIiwiZXhwb3J0cyIsImNsYXNzbmFtZXNfMSIsIk5vdGljZSIsImNoaWxkcmVuIiwiX2IiLCJpc0Rpc21pc3NpYmxlIiwiZWxlbWVudF8xIiwicmVhY3RfZXJyb3JfYm91bmRhcnlfMSIsImVycm9yXzEiLCJBcHAiLCJSb290IiwiRXJyb3JCb3VuZGFyeSIsIkZhbGxiYWNrQ29tcG9uZW50IiwiZWwiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiY3JlYXRlUm9vdCIsInJlbmRlciJdLCJzb3VyY2VSb290IjoiIn0=