'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class urls extends Model {
  }
  urls.init({
    original_url: DataTypes.STRING,
    short_url: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'urls',
  });
  return urls;
};