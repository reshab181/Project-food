// React Native 0.83's codegen Flow parser crashes while bundling several of its
// own internal NativeComponent spec files (specs_DEPRECATED/* and the
// experimental virtualview components). Those files only need codegen for the
// New Architecture; this app runs on the old architecture where native view
// configs register at runtime.
//
// We use mutually-exclusive babel `overrides` so that:
//  - the crashing RN spec files are transformed by @react-native/babel-preset
//    with `disableStaticViewConfigsCodegen: true` (skips the codegen plugin), and
//  - every other file uses the normal `babel-preset-expo`.
// They must not overlap, otherwise babel errors with "More than one plugin
// attempted to override parsing".
const RN_CODEGEN_CRASH =
  /react-native[\\/]src[\\/]private[\\/](specs_DEPRECATED|components[\\/]virtualview)[\\/]/;

module.exports = function (api) {
  api.cache(true);
  return {
    overrides: [
      {
        exclude: RN_CODEGEN_CRASH,
        presets: ['babel-preset-expo']
      },
      {
        test: RN_CODEGEN_CRASH,
        presets: [['@react-native/babel-preset', { disableStaticViewConfigsCodegen: true }]]
      }
    ]
  };
};
