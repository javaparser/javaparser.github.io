module.exports = ({ file, options, env }) => ({
  parser: file.extname === ".sss" ? "sugarss" : false,
  plugins: {
    "postcss-import": {},
    //"postcss-preset-env": {},
    autoprefixer: {},
    cssnano: {}
  }
});
