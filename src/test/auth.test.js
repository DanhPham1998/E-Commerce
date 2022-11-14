const mongoose = require('mongoose');
const request = require('supertest');
const app = require('./../app');

require('dotenv').config({ path: 'src/config/.env' });

describe('POST /api/v1/auth', () => {
  it('should register a user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Danh12',
      email: 'unittest1@gmail.com',
      password: '123456',
      passwordConfirm: '123456',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.token).toMatch(/eyJ/);
  });
});
