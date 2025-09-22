const axios = require("axios");
const db = require('../models');
const { Op } = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require(`${__dirname}/../config/config.json`)[env];

async function fetchAndFlattenApps(url) {
  const res = await axios.get(url);
  return res.data.flat();
}


const mapAppToGame = (app, platform) => {
  return {
    publisherId: app.publisher_id?.toString() || null,
    name: app.humanized_name || app.name,
    platform,
    storeId: app.app_id?.toString() || null,
    bundleId: app.bundle_id || null,
    appVersion: app.version || null,
    isPublished: true
  };
}

const populateGames = async () => {
  const { iosUrl, androidUrl } = config;

  // Fetch and flatten both feeds
  const [iosApps, androidApps] = await Promise.all([
    fetchAndFlattenApps(iosUrl),
    fetchAndFlattenApps(androidUrl)
  ]);

  // Map apps to DB model
  const allGames = [
    ...iosApps.map(app => mapAppToGame(app, "iOS")),
    ...androidApps.map(app => mapAppToGame(app, "Android"))
  ];

  // Step 1: Find existing games
  const existingGames = await db.Game.findAll({
    where: {
      [Op.or]: allGames.map(g => ({
        platform: g.platform,
        storeId: g.storeId
      }))
    },
    attributes: ["platform", "storeId"]
  });

  // Step 2: Filter out duplicates
  const existingSet = new Set(existingGames.map(g => `${g.platform}-${g.storeId}`));
  const newGames = allGames.filter(g => !existingSet.has(`${g.platform}-${g.storeId}`));

  // Step 3: Insert new games
  if (newGames.length > 0) {
    await db.Game.bulkCreate(newGames);
  }

  return {
    total: allGames.length,
    inserted: newGames.length,
    skipped: allGames.length - newGames.length
  };
}

module.exports = {
  populateGames,
}