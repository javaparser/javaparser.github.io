/**
 * Custom loader based on https://github.com/ibesty/nunjucks-webpack-loader.
 * The original loader lacks of some important features such as passing environment and file configuration
 **/
const fs = require("fs");
const loaderUtils = require("loader-utils");
const nunjucks = require("nunjucks");
const path = require("path");

module.exports = function(source) {
  const options = loaderUtils.getOptions(this) || {};

  const njkLoader = (startPath, alias) => {
    const resolvePath = filePath => {
      if (typeof alias === "object") {
        for (key in alias) {
          const patt = new RegExp(`^~${key}`);

          if (patt.test(filePath)) {
            return path.join(alias[key], filePath.replace(patt, ""));
          }
        }
      }

      return path.resolve(startPath, filePath);
    };

    return {
      getSource: filePath => {
        const completePath = resolvePath(filePath);
        this.addDependency(completePath);
        const dataBuffer = fs.readFileSync(completePath);
        // const charset = chardet.detect(dataBuffer);

        return {
          src: dataBuffer
            .toString("UTF-8", 0, dataBuffer.length)
            .replace(/({%.+?)>(.+?%})/gi, "$1&gt;$2")
            .replace(/({%.+?)<(.+?%})/gi, "$1&lt;$2"), //将 > < 替换成实体字符,
          path: completePath
        };
      }
    };
  };

  const env = new nunjucks.Environment(
    njkLoader(this.context, options.alias),
    {}
  );

  const compiled = nunjucks.compile(source, env);
  const rendered = compiled.render(options.context || {});

  return rendered;
};
