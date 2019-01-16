const fetch = require('node-fetch');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { handleResponse } = require('../helpers/ResponseHandler');
const { setCookie } = require('../helpers/SetCookie');
const { transport, makeANiceEmail } = require('../mail');

// public-facing resolvers for getting user data.  each mutation here must also be exposed to UI in schema.graphql
const UserMutation = {
    async signin(parent, { email, password }, ctx, info) {
        // 1. check if there's a user w that email
        const response = await fetch(`${process.env.BASE_URL}/users/email/email?email=${email}`);
        const user = await handleResponse(response);
        if(!user) {
            throw new Error(`No user for email ${email}`);
        }
        // 2. check if pw is correct
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw new Error('Invalid Password!')
        }
        // 3. generate jwt token
        const token = jwt.sign({userId: user.id }, process.env.APP_SECRET);
        // 4. set cookie w token
        setCookie(ctx, token, (1000 * 60 * 60 * 24)); //1 day cookie
        // 5. return user
        return user;
    },
    async createUser(parent, args, ctx) {
        // make sure they entered an email
        if(!args.email) {
            throw new Error(`Please provide an email addy`);
        }
        args.email = args.email.toLowerCase();
        // make sure they entered a pw
        if(args.password.length < 6) {
            throw new Error(`PW should be at least 6 characters`);
        }
        // check their secret signup code
        // todo: remove field from resolver, schema and frontend mutation when ecaptcha is implemented
        if(args.signupCode !== process.env.SIGNUP_SECRET) {
            throw new Error(`Incorrect signup code`);
        }
        // hash their PW
        const password = await bcrypt.hash(args.password, 10);
        // complete new user request w/ back-end info
        const newUser = {
            ...args,
            password,
            superuser: false
        };
        // create user in db
        const response = await fetch(`${process.env.BASE_URL}/users`, {
            method: 'POST',
            body:  JSON.stringify(newUser)
        });
        const user = await handleResponse(response);
        // create user's jwt
        const token = jwt.sign({userId: user.id}, process.env.APP_SECRET);
        // set the jwt as a cookie on response
        setCookie(ctx, token, (1000 * 60 * 60 * 24)); //1 day cookie
        return user;
    },
    async signout(parent, args, ctx) {
        ctx.response.clearCookie('token');
        return {message: 'logout successful'};
    },
    async requestReset(parent, { email }) {
        // 1. check if user exists
        const getUserResponse = await fetch(`${process.env.BASE_URL}/users/email/email?email=${email}`);
        const user = await handleResponse(getUserResponse);
        if(!user) {
            throw new Error(`No user for email ${email}`);
        }
        // 2. set a reset token/expiry on that user
        const randomBytesPromisified = promisify(randomBytes);
        const resetToken = (await randomBytesPromisified(20)).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hr from now
        const userUpdate = { resetToken, resetTokenExpiry };
        const updateResponse = await fetch(`${process.env.BASE_URL}/users/${user.id}`, {
            method: 'PUT',
            body:  JSON.stringify(userUpdate)
        });
        // 3. email them that reset token
        const mailRes = await transport.sendMail({
            from: "recipe_app@recipe.com",
            to: user.email,
            subject: 'Your PW reset link',
            html: makeANiceEmail(`Here is your pw reset link! 
            <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}
            ">CLICK HERE TO RESET</a>`)
        });
        return {message: "success"};
    },
    async resetPassword(parent, args, ctx) {
        // 1. PW match and length check
        if (args.password !== args.confirmPassword) {
            throw new Error('passwords must match');
        }
        if (args.password.length < 6) {
            throw new Error(`PW should be at least 6 characters`);
        }
        // 2. check if it's a legit reset token and check if it's expired (API call does both)
        const getUserResponse = await fetch(`${process.env.BASE_URL}/users/reset/${args.resetToken}`);
        const user = await handleResponse(getUserResponse);
        if(!user) {
            throw new Error(`No user found for this reset token. Try requesting another PW reset.`);
        }
        // 3. hash new PW
        const newPassword = await bcrypt.hash(args.password, 10);
        // 4. save new pw to user and remove old resetToken fields
        const userUpdate = { password: newPassword, resetToken: '', resetTokenExpiry: ''};
        const updatedResponse = await fetch(`${process.env.BASE_URL}/users/${user.id}`, {
            method: 'PUT',
            body:  JSON.stringify(userUpdate)
        });
        const updatedUser = await handleResponse(updatedResponse);
        // 5. Generate JWT
        const token = jwt.sign({userId: updatedUser.id }, process.env.APP_SECRET);
        // 6. set the jwt cookie
        setCookie(ctx, token, (1000 * 60 * 60 * 24)); //1 day cookie
        // 7. return the new user
        return updatedUser;
    }
    };

module.exports = UserMutation;