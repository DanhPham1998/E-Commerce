const mongoose = require('mongoose');
const request = require('supertest');
const app = require('./../app');

require('dotenv').config({ path: 'src/config/.env' });

beforeEach(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
});

/* Closing database connection after each test. */
afterEach(async () => {
  await mongoose.connection.close();
});

describe('product', () => {
  describe('POST /api/v1/products', () => {
    it('should create a product', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Product 2',
          price: 100,
          description: 'Description 2',
          category: 'Phone',
          stock: '10',
          imageCover: 'image',
          images: ['image1', 'image2'],
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('Product 2');
    });
  });

  describe('GET /api/v1/products', () => {
    it('should return all products', async () => {
      const res = await request(app).get('/api/v1/products');
      expect(res.statusCode).toBe(200);
      expect(res.body.result).toBeGreaterThan(0);
    });
  });
});
