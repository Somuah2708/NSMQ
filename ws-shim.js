// React Native provides WebSocket globally.
// This shim replaces the Node.js `ws` package so Metro doesn't try to
// bundle Node built-ins (stream, crypto) that don't exist in React Native.
const WS = typeof WebSocket !== 'undefined' ? WebSocket : null
module.exports = WS
module.exports.default = WS
