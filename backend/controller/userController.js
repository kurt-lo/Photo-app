import express, { response } from 'express';
import User from '../model/userModel.js';
import cookie from 'cookie';
import bcrypt from 'bcryptjs';
import { generateUserToken } from '../utils/token.js';
import imageMiddleware from '../middleware/imageMiddleware.js'
import Image from '../model/imageModel.js';
import { authenticateUser } from '../middleware/authMiddleware.js'

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

userRouter.post('/post', authenticateUser, imageMiddleware, async (req, res) => {
    try {
        const authenticatedUser = req.user;
        const user = await User.findById(authenticatedUser._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }
        // Assuming other image-related data is sent in the request body
        const { name, description } = req.body;
        // Assuming you have a single file in req.file from the middleware
        const file = req.file;

        const newImage = new Image({
            name: name,
            description: description,
            imagePath: file.path,
            uploadedBy: user._id,
        });

        await newImage.save();

        // Update the user's uploadedImages array
        user.uploadedImages.push(newImage._id);
        await user.save();

        res.status(201).json({ success: true, message: 'Image uploaded successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

export default userRouter;