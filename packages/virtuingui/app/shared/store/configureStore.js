// @flow
if (process.env.NODE_ENV === 'production') {
  module.exports.configureStore = require('./configureStore.prod'); // eslint-disable-line global-require
} else {
  module.exports.configureStore = require('./configureStore.dev'); // eslint-disable-line global-require
}
