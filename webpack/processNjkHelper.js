const path = require("path");
const glob = require("glob");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const defaultExt = ".nunjucks";
const searchInFolders = ["/", "/blog/", "/blocks/", "/components/"];

const getFileName = filePath => {
  return path.basename(filePath, defaultExt);
};

module.exports = ({ IS_DEV }) => {
  let allPages = [];

  searchInFolders.forEach(folder => {
    const paths = glob.sync(`${__dirname}/src${folder}*${defaultExt}`);

    allPages = allPages.concat(
      paths.map(template => {
        const filename = getFileName(template);
        const page = `${folder.slice(1)}${filename}.html`;

        return new HtmlWebpackPlugin({
          template: template,
          inject: true,
          favicon: path.resolve(__dirname, "src/public/favicon.ico"),
          minify: !IS_DEV && {
            collapseWhitespace: true,
            preserveLineBreaks: true,
            removeComments: true
          },
          filename: page,
          hash: true
        });
      })
    );
  });

  return allPages;
};
