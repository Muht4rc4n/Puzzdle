const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const puzzleController = require('../controllers/puzzleController');

router.get('/health', puzzleController.getHealth);
router.get('/leaderboard', puzzleController.getLeaderboard);

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

router.get('/favorites', puzzleController.getFavorites);
router.post('/favorites', puzzleController.addFavorite);
router.delete('/favorites/:key', puzzleController.deleteFavorite);

router.get('/admin/users', puzzleController.getAdminUsers);
router.delete('/admin/users/:id', puzzleController.deleteAdminUser);

router.get('/templates', puzzleController.getTemplates);
router.post('/templates', puzzleController.addTemplate);
router.delete('/templates/:id', puzzleController.deleteTemplate);

router.get('/battles/history', puzzleController.getBattlesHistory);

router.post('/contact', puzzleController.submitContactForm);
router.get('/admin/messages', puzzleController.getContactMessages);
router.delete('/admin/messages/:id', puzzleController.deleteContactMessage);

module.exports = router;
