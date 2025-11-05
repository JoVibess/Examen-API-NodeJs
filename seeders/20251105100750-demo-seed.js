'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // --- USERS ---
    const users = await queryInterface.bulkInsert('Users', [
      {
        email: 'admin@candyworld.com',
        password: '$2a$10$Z1z7FjRj5I8Tq7X5gQ0R3OtJZ07Xl9tz1Rfkk9oLRq8CFqRh7WR.6', // hash: admin123
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'alice@candyworld.com',
        password: '$2a$10$2Q4p2ifMaEwD7y70BOz8XOMpWvBb16l5J1YEtKxH6G7xM0ZP1r3oS', // hash: test123
        role: 'client',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'bob@candyworld.com',
        password: '$2a$10$2Q4p2ifMaEwD7y70BOz8XOMpWvBb16l5J1YEtKxH6G7xM0ZP1r3oS', // test123
        role: 'client',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'charlie@candyworld.com',
        password: '$2a$10$2Q4p2ifMaEwD7y70BOz8XOMpWvBb16l5J1YEtKxH6G7xM0ZP1r3oS',
        role: 'client',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'diane@candyworld.com',
        password: '$2a$10$2Q4p2ifMaEwD7y70BOz8XOMpWvBb16l5J1YEtKxH6G7xM0ZP1r3oS',
        role: 'client',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { returning: true });

    // --- PRODUCTS ---
    const products = [
      { title: 'Bonbon Fraise Tagada', price: 2.5, description: 'Classique fraise sucrée', stock: 100 },
      { title: 'Bonbon Coca', price: 2.0, description: 'Acidulé goût cola', stock: 80 },
      { title: 'Dragibus', price: 3.0, description: 'Petites billes multicolores', stock: 90 },
      { title: 'Caramel tendre', price: 4.0, description: 'Caramel fondant au beurre salé', stock: 50 },
      { title: 'Oursons gélifiés', price: 2.8, description: 'Petits oursons colorés', stock: 120 },
      { title: 'Bonbon menthe glaciale', price: 3.2, description: 'Fraîcheur intense', stock: 60 },
      { title: 'Bonbon citron acidulé', price: 2.5, description: 'Citron pétillant', stock: 90 },
      { title: 'Réglisse douce', price: 3.5, description: 'Goût intense de réglisse', stock: 70 },
      { title: 'Sucette cerise', price: 1.2, description: 'Sucette artisanale goût cerise', stock: 200 },
      { title: 'Bonbon pêche', price: 2.3, description: 'Goût fruité et sucré', stock: 110 },
      { title: 'Chocolat praliné', price: 5.5, description: 'Petits carrés fourrés praliné', stock: 40 },
      { title: 'Bonbon à la violette', price: 3.0, description: 'Saveur florale délicate', stock: 60 },
      { title: 'Bâtonnet acidulé arc-en-ciel', price: 2.8, description: 'Coloré et pétillant', stock: 75 },
      { title: 'Bonbon cœur fondant', price: 4.2, description: 'Gélifié au centre liquide', stock: 55 },
      { title: 'Bonbon pomme verte', price: 2.5, description: 'Saveur fruitée rafraîchissante', stock: 90 },
      { title: 'Bonbon cassis', price: 2.6, description: 'Goût fruit rouge', stock: 70 },
      { title: 'Bonbon cerise noire', price: 2.7, description: 'Acidulé et sucré', stock: 65 },
      { title: 'Bonbon tropical', price: 3.1, description: 'Mélange exotique mangue-passion', stock: 85 },
      { title: 'Bonbon caramel dur', price: 3.8, description: 'Classique croquant', stock: 55 },
      { title: 'Bonbon bubble-gum', price: 1.9, description: 'Goût chewing-gum', stock: 100 },
    ].map(p => ({ ...p, createdAt: new Date(), updatedAt: new Date() }));

    await queryInterface.bulkInsert('Products', products);

    // --- TAGS ---
    const tags = [
      { name: 'fruité' },
      { name: 'acidulé' },
      { name: 'chocolaté' },
      { name: 'classique' },
      { name: 'exotique' }
    ].map(t => ({ ...t, createdAt: new Date(), updatedAt: new Date() }));

    await queryInterface.bulkInsert('Tags', tags);

    // --- PRODUCT TAGS ---
    const productTags = [
      { productId: 1, tagId: 1 },
      { productId: 2, tagId: 2 },
      { productId: 3, tagId: 1 },
      { productId: 4, tagId: 4 },
      { productId: 5, tagId: 1 },
      { productId: 6, tagId: 2 },
      { productId: 7, tagId: 2 },
      { productId: 8, tagId: 4 },
      { productId: 9, tagId: 1 },
      { productId: 10, tagId: 1 },
      { productId: 11, tagId: 3 },
      { productId: 12, tagId: 4 },
      { productId: 13, tagId: 2 },
      { productId: 14, tagId: 4 },
      { productId: 15, tagId: 1 },
      { productId: 16, tagId: 1 },
      { productId: 17, tagId: 1 },
      { productId: 18, tagId: 5 },
      { productId: 19, tagId: 4 },
      { productId: 20, tagId: 2 },
    ].map(pt => ({ ...pt, createdAt: new Date(), updatedAt: new Date() }));

    await queryInterface.bulkInsert('ProductTags', productTags);

    // --- CARTS ---
    const carts = [
      { userId: 2, deliveryAddress: '12 rue des sucreries', totalPrice: 12.3, status: 'completed' },
      { userId: 3, deliveryAddress: '5 allée du plaisir', totalPrice: 8.9, status: 'validated' },
      { userId: 4, deliveryAddress: '2 boulevard des douceurs', totalPrice: 15.5, status: 'open' },
    ].map(c => ({ ...c, createdAt: new Date(), updatedAt: new Date() }));

    await queryInterface.bulkInsert('Carts', carts);

    // --- CART ITEMS ---
    const cartItems = [
      { cartId: 1, productId: 1, quantity: 2, unitPrice: 2.5 },
      { cartId: 1, productId: 3, quantity: 1, unitPrice: 3.0 },
      { cartId: 2, productId: 2, quantity: 3, unitPrice: 2.0 },
      { cartId: 2, productId: 5, quantity: 2, unitPrice: 2.8 },
      { cartId: 3, productId: 8, quantity: 1, unitPrice: 3.5 },
      { cartId: 3, productId: 10, quantity: 4, unitPrice: 2.3 },
    ].map(i => ({ ...i, createdAt: new Date(), updatedAt: new Date() }));

    await queryInterface.bulkInsert('CartItems', cartItems);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CartItems', null, {});
    await queryInterface.bulkDelete('Carts', null, {});
    await queryInterface.bulkDelete('Tags', null, {});
    await queryInterface.bulkDelete('ProductTags', null, {});
    await queryInterface.bulkDelete('Products', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  },
};
