const AuthController = require('../controllers/AuthController');
const UsersController = require('../controllers/UsersController');
const LoggerController = require('../controllers/LoggerController');
const TelegramController = require('../controllers/TelegramController');

const AuthMiddleware = require('../middleware/AuthMiddleware');

const { PATH_URL } = process.env;

exports.use = function (app) {
	// AUTH
  app.post(`${PATH_URL}/regis`, AuthController.regis);
  app.post(`${PATH_URL}/login`, AuthController.login);
	app.get(`${PATH_URL}/profile`, AuthMiddleware, AuthController.profile);

  // USERS
  app.get(`${PATH_URL}/users`, UsersController.list);
  app.post(`${PATH_URL}/user`, UsersController.add);
  app.get(`${PATH_URL}/user`, UsersController.detail);
  app.put(`${PATH_URL}/user`, UsersController.updt);
  app.delete(`${PATH_URL}/user`, UsersController.del);

	// LOGGER
  app.get(`${PATH_URL}/logs`, LoggerController.list);
	app.post(`${PATH_URL}/log`, AuthMiddleware, LoggerController.log);
  app.get(`${PATH_URL}/log_keys/sum`, LoggerController.sum_keys);

  // TELEGRAM
	app.get(`${PATH_URL}/recent_chats`, AuthMiddleware, TelegramController.recentChats);
}