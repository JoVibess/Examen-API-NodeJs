'use strict';

const express = require('express');
const router = express.Router();
const { Product, Tag } = require('../models');   
const { Op } = require('sequelize');  
const authenticate = require('../middlewares/authenticate');
const requireAdmin = require('../middlewares/requireAdmin');


// GET /products
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, tags } = req.query;
    const offset = (page - 1) * limit;
    const where = { stock: { [Op.gt]: 0 } };

    // filtre tags si fourni
    let include = [];
    if (tags) {
      const tagList = tags.split(',').map(t => t.trim());
      include = [
        {
          model: Tag,
          as: 'tags',
          where: { name: tagList },
          through: { attributes: [] }
        }
      ];
    }

    const products = await Product.findAll({
      where,
      include,
      offset,
      limit: parseInt(limit, 10),
      order: [['createdAt', 'DESC']]
    });

    return res.json({ products });
  } catch (error) {
    console.error('GET /products error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /products/:id
router.get('/:id', async (req, res) => {
  try {
    const prod = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] }
        }
      ]
    });
    if (!prod) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({ product: prod });
  } catch (error) {
    console.error('GET /products/:id error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /products  (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, price, description, stock } = req.body;
    if (!title || !price || !description) {
      return res.status(400).json({ error: 'title, price and description are required' });
    }
    const newProd = await Product.create({ title, price, description, stock: stock || 0 });
    return res.status(201).json({ product: newProd });
  } catch (error) {
    console.error('POST /products error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /products/:id  (admin only, permet aussi de gérer les tags)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, price, description, stock, tagIds } = req.body;

    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Tag, as: 'tags' }]
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.update({
      title:       title       !== undefined ? title       : product.title,
      price:       price       !== undefined ? price       : product.price,
      description: description !== undefined ? description : product.description,
      stock:       stock       !== undefined ? stock       : product.stock
    });

    if (Array.isArray(tagIds)) {
      const tags = await Tag.findAll({ where: { id: tagIds } });
      await product.setTags(tags); 
    }

    const updated = await Product.findByPk(req.params.id, {
      include: [{ model: Tag, as: 'tags', through: { attributes: [] } }]
    });

    return res.json({ product: updated });
  } catch (error) {
    console.error('PUT /products/:id error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// DELETE /products/:id  (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const prod = await Product.findByPk(req.params.id);
    if (!prod) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await prod.destroy();
    return res.status(204).send(); 
  } catch (error) {
    console.error('DELETE /products/:id error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
