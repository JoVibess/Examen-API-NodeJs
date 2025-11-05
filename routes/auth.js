const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// middlewares
const authenticate = require('../middlewares/authenticate');
const logger = require('../middlewares/logger');

// Configuration
const JWT_PRIVATE_TOKEN = process.env.JWT_PRIVATE_TOKEN || 'default_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// --- Appliquer le logger à toutes les routes de /auth ---
router.use(logger);

/**
 * @route POST /auth/register
 * @desc Enregistre un nouvel utilisateur
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Utilisateur déjà existant' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: role || 'client',
    });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erreur dans /register:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

/**
 * @route POST /auth/login
 * @desc Connecte un utilisateur et renvoie un JWT
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_PRIVATE_TOKEN, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erreur dans /login:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

/**
 * @route GET /auth/me
 * @desc Retourne les infos de l'utilisateur connecté
 * @access Privé (nécessite token JWT)
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'role', 'createdAt'],
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Erreur dans /me:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

module.exports = router;
