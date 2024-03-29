import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            default: 'user',
        }, uploadedImages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Image',
            }
        ]
    },
    {
        timestamps: true
    }
);

userSchema.pre('save', async function (next) {
    const user = this;

    if (!user.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);

        user.password = hash;
        next();
    } catch (error) {
        return next(error);
    }
})

const User = mongoose.model('User', userSchema);

export default User;