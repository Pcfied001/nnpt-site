// Express 4 doesn't catch errors thrown inside async route handlers; this forwards them
// to the error handler in server.js instead of leaving the request hanging.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
