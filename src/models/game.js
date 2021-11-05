'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Game extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Game.belongsTo(models.Server)
      Game.hasMany(models.User);
      Game.belongsToMany(models.Question, {
        through: "GameQuestion",
        foreignKey: "gameId",
        otherKey: "questionId",
      });
    }
  };
  Game.init({
    gameId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Game',
  });
  return Game;
};