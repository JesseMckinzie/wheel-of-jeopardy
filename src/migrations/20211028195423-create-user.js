'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      gameId: {
        type: Sequelize.INTEGER,
        defaultValue: -1
      },
      cumulativeScore: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      highScore: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      gamesPlayed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }

      // createdAt: {
      //   allowNull: false,
      //   type: Sequelize.DATE,
      //   defaultValue: new Date(),
      // },
      // updatedAt: {
      //   allowNull: false,
      //   type: Sequelize.DATE,
      //   defaultValue: new Date(),
      // }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};