'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Search extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Search.belongsTo(models.User, {
        foreignKey: "person_id",
        targetKey: "id"
      });
      Search.belongsTo(models.Landmark, {
        foreignKey: "landmark_id",
        targetKey: "id",
        as: 'landmarks'
      })
    }
  }
  Search.init({
    person_id: DataTypes.INTEGER,
    landmark_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Search',
  });
  return Search;
};