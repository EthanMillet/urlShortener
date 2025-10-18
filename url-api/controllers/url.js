const dotenv = require('dotenv-safe');
const envFound = dotenv.config();
const config = require('../config/config.json');
if (envFound.error) {
  throw new Error("Couldn't find .env file");
}

const env = config[process.env.ENV];

const urlShortener = (urls) => {

};

module.exports = {
  async getUrlsById(req, res, next) {
    if (isNaN(parseInt(req.params.id))) {
        throw new InvalidRoute(
          "Provided ID is invalid.",
          `ID "${req.params.id}" is not an integer.`,
        );
      }
      const { id } = req.params;
      return urls.findByPk(id)
      .then((urls) => {
        if (!urls) {
            res.status(404).send("URL not found.");
        }
        res.status(200).send(urls);  
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  },
  async getUrls(req, res, next) {
    const urls = await urls.findAll();
    res.status(200).send(urls);
  },
  async createUrl(req, res, next) {
    try {
      const { original_url } = req.body;
      const body = await urls.create({ original_url });
      res.status(201).send(body);
    } catch (error) {
      res.status(500).send(error);
    }
  },
  async deleteUrl(req, res, next) {
    try {
      const { id } = req.params;
      await urls.destroy({ where: { id } });
      res.status(204).send();
    } catch (error) {
      res.status(500).send(error);
    }
  }
};