// React Native provides fetch, Headers, Request, Response globally.
// This shim replaces @supabase/node-fetch so Metro doesn't bundle
// Node.js built-ins (stream, http, https, zlib) that don't exist in RN.
exports['default'] = fetch
exports.fetch = fetch
exports.Headers = Headers
exports.Request = Request
exports.Response = Response
