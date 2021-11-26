'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Question.belongsToMany(models.Game, {
        through: "GameQuestion",
        foreignKey: "questionId",
        otherKey: "gameId",
      });
    }
  };
  Question.init({
    category: DataTypes.STRING,
    difficulty: DataTypes.STRING,
    type: DataTypes.STRING,
    encoding: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Question',
  });
  return Question;
};