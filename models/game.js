module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define('Game', {
    publisherId: DataTypes.STRING,
    name: DataTypes.STRING,
    platform: DataTypes.STRING,
    storeId: DataTypes.STRING,
    bundleId: DataTypes.STRING,
    appVersion: DataTypes.STRING,
    isPublished: DataTypes.BOOLEAN,
  }, {
    indexes: [
      {
        fields: ['name'],
      },
      {
        fields: ['platform'],
      },
      {
        fields: ['name', 'platform'],
      },
    ],
  });
  return Game;
};
