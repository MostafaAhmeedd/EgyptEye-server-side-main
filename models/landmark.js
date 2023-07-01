'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Landmark extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Landmark.belongsTo(models.Image, {
        foreignKey: "image_id",
        as: "image"
      });
      Landmark.belongsTo(models.Location, {
        foreignKey: "location_id",
        as: 'location'
      })
      Landmark.hasMany(models.Search, {
        foreignKey: "landmark_id", 
        sourceKey: "id"
      })
      Landmark.hasMany(models.Favorite,{
        foreignKey: 'landmark_id',
        as: 'favorites'
      })
    }
  }
  Landmark.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    image_id: DataTypes.INTEGER,
    location_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Landmark',
  });
  return Landmark;
};