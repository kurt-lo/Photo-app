import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'

dotenv.config();
let secretKey = process.env.JWT_SECRET;

export function generateUserToken(user) {
  const payload = {
    _id: user._id,
    role: 'user',
  };
  
  return jwt.sign(payload, secretKey, { expiresIn: '1d' });
}

export function generateAdminToken(admin) {
  const payload = {
    _id: admin._id,
    role: 'admin',
  };
  return jwt.sign(payload, secretKey, { expiresIn: '1d' });
}
