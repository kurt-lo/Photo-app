import express, { response } from 'express';
import User from '../model/userModel.js';
import cookie from 'cookie';
import bcrypt from 'bcryptjs';
import { generateUserToken } from '../utils/token.js';

const userRouter = express.Router();

userRouter.post('/register', async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(409).json({ error: 'Email is already existed!' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match!' })
        }
        if (password.length < 8 || confirmPassword.length < 8) {
            return res.status(400).json({ error: 'Password is short needs atleast 8 characters!' })
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        res.status(201).json(user);
    } catch (error) {
        response.status(400).json({ message: 'Invalid User Data', error: error.message });
    }
});

userRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                const token = generateUserToken(user);

                res.setHeader('Set-Cookie', cookie.serialize('token', token, {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60,
                }));

                res.json({
                    token,
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                });
            } else {
                // Passwords don't match, return an unauthorized response
                response.status(401).json({ message: 'Invalid password' });
            }
        } else {
            response.status(401).json({ message: 'Invalid email' });
        }
    } catch (error) {
        console.error('Error:', error);
        response.status(500).json({ message: 'Server Error' });
    }
});

userRouter.post('/logout', async (req, res) => {
    res.setHeader('Set-Cookie', cookie.serialize('token', '', {
        httpOnly: true,
        expires: new Date(0),
    }));
    res.json({ message: 'Logged out sucessfully!' });
});

export default userRouter;