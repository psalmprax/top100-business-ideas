import jwt from 'jsonwebtoken';
const JWT_SECRET = 'your-jwt-secret-here-change-in-production';
const claims = {
  user_id: 'd0e1b5c4-f3a1-4d3a-b8e9-7c2d1e0f0a2b',
  email: 'test-admin@sentinel.dev',
  role: 'admin',
  token_type: 'access',
  allowed_products: ['*'],
  iss: 'top100-business-ideas',
  sub: 'd0e1b5c4-f3a1-4d3a-b8e9-7c2d1e0f0a2b',
  jti: 'e2e-test-token-id'
};
const token = jwt.sign(claims, JWT_SECRET, { expiresIn: '24h' });
console.log(token);
