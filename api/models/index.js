"use strict";

const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);
fs.readdirSync(__dirname).filter(file => {
  const isJavaScriptFile = file.indexOf(".") !== 0;
  const isNotCurrentFile = file !== basename;
  const isJavaScriptExtension = file.slice(-3) === ".js";
  const isNotTestFile = file.indexOf(".test.js") === -1;
  const isNotAssociationFile = file !== "associations.js";
  return isJavaScriptFile && isNotCurrentFile && isJavaScriptExtension && isNotTestFile && isNotAssociationFile;
}).forEach(file => {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  require(path.join(__dirname, file));
});
require("./associations");