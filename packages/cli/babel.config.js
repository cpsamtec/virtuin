module.exports = function (api) {
  api.cache(true);

  const presets = [["@babel/preset-env", {
  "targets": { "node": "10.13.0" }
  }], "@babel/preset-flow" ];
  const plugins = [ 
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-do-expressions",
    "@babel/plugin-proposal-export-default-from",
    "@babel/plugin-proposal-export-namespace-from",
    "@babel/plugin-proposal-function-bind",
    "@babel/plugin-proposal-function-sent",
    "@babel/plugin-proposal-json-strings",
    "@babel/plugin-proposal-logical-assignment-operators",
    "@babel/plugin-proposal-nullish-coalescing-operator",
    "@babel/plugin-proposal-numeric-separator",
    "@babel/plugin-proposal-optional-chaining",
    "@babel/plugin-proposal-throw-expressions",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-syntax-import-meta",
    "@babel/plugin-transform-react-constant-elements",
    "@babel/plugin-transform-react-inline-elements"
 ];

  return {
    presets,
    plugins
  };
}
