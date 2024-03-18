/*! For license information please see landing.js.LICENSE.txt */
(()=>{var e={509:function(e,t,r){"use strict";var o=this&&this.__createBinding||(Object.create?function(e,t,r,o){void 0===o&&(o=r);var n=Object.getOwnPropertyDescriptor(t,r);n&&!("get"in n?!t.__esModule:n.writable||n.configurable)||(n={enumerable:!0,get:function(){return t[r]}}),Object.defineProperty(e,o,n)}:function(e,t,r,o){void 0===o&&(o=r),e[o]=t[r]}),n=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),a=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)"default"!==r&&Object.prototype.hasOwnProperty.call(e,r)&&o(t,e,r);return n(t,e),t};Object.defineProperty(t,"__esModule",{value:!0}),t.Badge=void 0;var s=a(r(363));t.Badge=function(e){var t=e.children;return s.createElement("div",{className:"wcpos-inline-block wcpos-rounded-lg wcpos-bg-gray-300 wcpos-px-3 wcpos-py-1 wcpos-text-sm"},t)}},181:function(e,t,r){"use strict";var o=this&&this.__createBinding||(Object.create?function(e,t,r,o){void 0===o&&(o=r);var n=Object.getOwnPropertyDescriptor(t,r);n&&!("get"in n?!t.__esModule:n.writable||n.configurable)||(n={enumerable:!0,get:function(){return t[r]}}),Object.defineProperty(e,o,n)}:function(e,t,r,o){void 0===o&&(o=r),e[o]=t[r]}),n=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),a=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)"default"!==r&&Object.prototype.hasOwnProperty.call(e,r)&&o(t,e,r);return n(t,e),t},s=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var i=a(r(363)),c=r(85),l=s(r(302));t.default=function(e){var t=e.error,r=e.resetErrorBoundary,o=(0,c.get)(t,"message","Unknown error");return i.createElement("div",{className:"wcpos-p-4"},i.createElement(l.default,{status:"error",onRemove:r},i.createElement("p",null,"Something went wrong: ",i.createElement("code",null,o))))}},259:function(e,t,r){"use strict";var o=this&&this.__createBinding||(Object.create?function(e,t,r,o){void 0===o&&(o=r);var n=Object.getOwnPropertyDescriptor(t,r);n&&!("get"in n?!t.__esModule:n.writable||n.configurable)||(n={enumerable:!0,get:function(){return t[r]}}),Object.defineProperty(e,o,n)}:function(e,t,r,o){void 0===o&&(o=r),e[o]=t[r]}),n=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),a=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)"default"!==r&&Object.prototype.hasOwnProperty.call(e,r)&&o(t,e,r);return n(t,e),t};Object.defineProperty(t,"__esModule",{value:!0}),t.Hero=void 0;var s=a(r(363)),i=r(509);t.Hero=function(){return s.createElement("div",{className:"wcpos-space-y-2 lg:wcpos-space-y-4"},s.createElement(i.Badge,null,"Support the project"),s.createElement("p",{className:"wcpos-text-3xl wcpos-font-bold lg:wcpos-text-4xl"},"WooCommerce POS needs your help!"),s.createElement("p",{className:"wcpos-max-w-[900px] wcpos-text-xl wcpos-leading-8"},"WooCommerce POS is the only free and open source Point of Sale plugin for WooCommerce. We believe in creating a high quality product that is accessible to everyone. However, it requires many thousands of hours for development and support. It's a big project and it needs your help to keep it going. If you find WooCommerce POS useful, and can afford it, please consider supporting the project with a Pro license."))}},302:function(e,t,r){"use strict";var o=this&&this.__createBinding||(Object.create?function(e,t,r,o){void 0===o&&(o=r);var n=Object.getOwnPropertyDescriptor(t,r);n&&!("get"in n?!t.__esModule:n.writable||n.configurable)||(n={enumerable:!0,get:function(){return t[r]}}),Object.defineProperty(e,o,n)}:function(e,t,r,o){void 0===o&&(o=r),e[o]=t[r]}),n=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),a=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)"default"!==r&&Object.prototype.hasOwnProperty.call(e,r)&&o(t,e,r);return n(t,e),t},s=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var i=a(r(363)),c=s(r(184));t.default=function(e){var t=e.status,r=e.children;e.onRemove,e.isDismissible;return i.createElement("div",{className:(0,c.default)("wcpos-flex wcpos-px-4 wcpos-py-2 wcpos-items-center","error"===t&&"wcpos-bg-red-300 wcpos-border-l-4 wcpos-border-red-600","info"===t&&"wcpos-bg-yellow-100 wcpos-border-l-4 wcpos-border-yellow-300","success"===t&&"wcpos-bg-green-100 wcpos-border-l-4 wcpos-border-green-600")},i.createElement("div",{className:"wcpos-flex-1"},r))}},757:function(e,t,r){"use strict";var o=this&&this.__createBinding||(Object.create?function(e,t,r,o){void 0===o&&(o=r);var n=Object.getOwnPropertyDescriptor(t,r);n&&!("get"in n?!t.__esModule:n.writable||n.configurable)||(n={enumerable:!0,get:function(){return t[r]}}),Object.defineProperty(e,o,n)}:function(e,t,r,o){void 0===o&&(o=r),e[o]=t[r]}),n=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),a=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)"default"!==r&&Object.prototype.hasOwnProperty.call(e,r)&&o(t,e,r);return n(t,e),t};Object.defineProperty(t,"__esModule",{value:!0}),t.Pro=void 0;var s=a(r(363));t.Pro=function(){return s.createElement("div",{className:"wcpos-grid wcpos-gap-4"},s.createElement("div",{className:"wcpos-bg-gray-50 wcpos-p-6 wcpos-rounded-lg"},s.createElement("h2",{className:"wcpos-text-2xl wcpos-font-semibold wcpos-m-0"},"Upgrade to Pro"),s.createElement("p",{className:"wcpos-text-gray-500"},s.createElement("ul",{className:"wcpos-list-disc wcpos-pl-6"},s.createElement("li",null,"Use any WooCommerce gateway"),s.createElement("li",null,"Create multiple POS Stores"),s.createElement("li",null,"Analytics for POS and Online sales"),s.createElement("li",null,"Priority Discord support within 1 hour"))),s.createElement("a",{className:"wcpos-w-full wcpos-inline-flex wcpos-h-10 wcpos-items-center wcpos-justify-center wcpos-rounded-md wcpos-bg-wp-admin-theme-color-darker-10 wcpos-px-8 wcpos-text-sm wcpos-font-medium wcpos-text-gray-50 hover:wcpos-text-gray-50 shadow wcpos-transition-colors hover:wcpos-bg-wp-admin-theme-color-darker-20 focus-visible:wcpos-outline-none focus-visible:wcpos-ring-1 focus-visible:wcpos-ring-gray-950 wcpos-no-underline",href:"https://wcpos.com/pro"},"Upgrade to Pro")))}},783:function(e,t,r){"use strict";var o=this&&this.__createBinding||(Object.create?function(e,t,r,o){void 0===o&&(o=r);var n=Object.getOwnPropertyDescriptor(t,r);n&&!("get"in n?!t.__esModule:n.writable||n.configurable)||(n={enumerable:!0,get:function(){return t[r]}}),Object.defineProperty(e,o,n)}:function(e,t,r,o){void 0===o&&(o=r),e[o]=t[r]}),n=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),a=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)"default"!==r&&Object.prototype.hasOwnProperty.call(e,r)&&o(t,e,r);return n(t,e),t},s=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var i=a(r(363)),c=r(610),l=r(511),u=s(r(181)),p=r(259),d=r(757);r(744);var f=function(){return i.createElement("div",{className:"wcpos-w-full wcpos-py-4"},i.createElement("div",{className:"wcpos-mx-auto wcpos-grid wcpos-gap-8 lg:wcpos-max-w-6xl lg:wcpos-grid-cols-12 lg:wcpos-px-6"},i.createElement("div",{className:"wcpos-grid wcpos-gap-4 lg:wcpos-col-span-8 lg:wcpos-gap-2"},i.createElement(p.Hero,null)),i.createElement("div",{className:"lg:wcpos-col-span-4"},i.createElement(d.Pro,null))))},m=function(){return i.createElement(l.ErrorBoundary,{FallbackComponent:u.default},i.createElement(f,null))},h=document.getElementById("woocommerce-pos-upgrade");c.createRoot?(0,c.createRoot)(h).render(i.createElement(m,null)):(0,c.render)(i.createElement(m,null),h)},184:(e,t)=>{var r;!function(){"use strict";var o={}.hasOwnProperty;function n(){for(var e=[],t=0;t<arguments.length;t++){var r=arguments[t];if(r){var a=typeof r;if("string"===a||"number"===a)e.push(r);else if(Array.isArray(r)){if(r.length){var s=n.apply(null,r);s&&e.push(s)}}else if("object"===a){if(r.toString!==Object.prototype.toString&&!r.toString.toString().includes("[native code]")){e.push(r.toString());continue}for(var i in r)o.call(r,i)&&r[i]&&e.push(i)}}}return e.join(" ")}e.exports?(n.default=n,e.exports=n):void 0===(r=function(){return n}.apply(t,[]))||(e.exports=r)}()},744:(e,t,r)=>{"use strict";r.r(t)},511:(e,t,r)=>{"use strict";r.r(t),r.d(t,{ErrorBoundary:()=>s,ErrorBoundaryContext:()=>n,useErrorBoundary:()=>i,withErrorBoundary:()=>c});var o=r(363);const n=(0,o.createContext)(null),a={didCatch:!1,error:null};class s extends o.Component{constructor(e){super(e),this.resetErrorBoundary=this.resetErrorBoundary.bind(this),this.state=a}static getDerivedStateFromError(e){return{didCatch:!0,error:e}}resetErrorBoundary(){const{error:e}=this.state;if(null!==e){for(var t,r,o=arguments.length,n=new Array(o),s=0;s<o;s++)n[s]=arguments[s];null===(t=(r=this.props).onReset)||void 0===t||t.call(r,{args:n,reason:"imperative-api"}),this.setState(a)}}componentDidCatch(e,t){var r,o;null===(r=(o=this.props).onError)||void 0===r||r.call(o,e,t)}componentDidUpdate(e,t){const{didCatch:r}=this.state,{resetKeys:o}=this.props;var n,s;r&&null!==t.error&&function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[];return e.length!==t.length||e.some(((e,r)=>!Object.is(e,t[r])))}(e.resetKeys,o)&&(null===(n=(s=this.props).onReset)||void 0===n||n.call(s,{next:o,prev:e.resetKeys,reason:"keys"}),this.setState(a))}render(){const{children:e,fallbackRender:t,FallbackComponent:r,fallback:a}=this.props,{didCatch:s,error:i}=this.state;let c=e;if(s){const e={error:i,resetErrorBoundary:this.resetErrorBoundary};if((0,o.isValidElement)(a))c=a;else if("function"==typeof t)c=t(e);else{if(!r)throw new Error("react-error-boundary requires either a fallback, fallbackRender, or FallbackComponent prop");c=(0,o.createElement)(r,e)}}return(0,o.createElement)(n.Provider,{value:{didCatch:s,error:i,resetErrorBoundary:this.resetErrorBoundary}},c)}}function i(){const e=(0,o.useContext)(n);!function(e){if(null==e||"boolean"!=typeof e.didCatch||"function"!=typeof e.resetErrorBoundary)throw new Error("ErrorBoundaryContext not found")}(e);const[t,r]=(0,o.useState)({error:null,hasError:!1}),a=(0,o.useMemo)((()=>({resetBoundary:()=>{null==e||e.resetErrorBoundary(),r({error:null,hasError:!1})},showBoundary:e=>r({error:e,hasError:!0})})),[null==e?void 0:e.resetErrorBoundary]);if(t.hasError)throw t.error;return a}function c(e,t){const r=(0,o.forwardRef)(((r,n)=>(0,o.createElement)(s,t,(0,o.createElement)(e,{...r,ref:n})))),n=e.displayName||e.name||"Unknown";return r.displayName="withErrorBoundary(".concat(n,")"),r}},363:e=>{"use strict";e.exports=React},85:e=>{"use strict";e.exports=lodash},610:e=>{"use strict";e.exports=wp.element}},t={};function r(o){var n=t[o];if(void 0!==n)return n.exports;var a=t[o]={exports:{}};return e[o].call(a.exports,a,a.exports,r),a.exports}r.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return r.d(t,{a:t}),t},r.d=(e,t)=>{for(var o in t)r.o(t,o)&&!r.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};r(783)})();