const fetch = require('node-fetch');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { handleResponse } = require('../helpers/ErrorHandler');

const baseUrl = 'http://localhost:1337';
// public-facing resolvers for getting data.  each mutation here must also be exposed to UI in schema.graphql
const Mutation = {
    async addRecipe(parent, args) {
        const response = await fetch(`${baseUrl}/recipes`, {
            method: 'POST',
            body:  JSON.stringify(args)
        });
        return handleResponse(response);
    },
    async editRecipe(parent, args) {
        // make a copy of the recipe's updates
        const updates = { ...args };
        // remove id from updates - id is never updated (pk)
        delete updates.id;
        // run update request
        const response = await fetch(`${baseUrl}/recipes/${args.id}`, {
            method: 'PUT',
            body:  JSON.stringify(updates)
        });
        return handleResponse(response);
    },
    async deleteRecipe(parent, args) {
        const response = await fetch(`${baseUrl}/recipes/${args.id}`, {
            method: 'DELETE'
        });
        return handleResponse(response);
    },

    async importRecipeFromUrl(parent, {url}) {
        const response = await fetch(`${baseUrl}/recipes/import-url`, {
            method: 'POST',
            body: JSON.stringify({url})
        });
        return handleResponse(response)
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
        // hash their PW
        const password = await bcrypt.hash(args.password, 10);
        // complete new user request w/ back-end info
        const newUser = {
            ...args,
            password,
            superuser: false
        };
        // create user in db
        const response = await fetch(`${baseUrl}/users`, {
            method: 'POST',
            body:  JSON.stringify(newUser)
        });
        const user = await handleResponse(response);
        // create user's jwt
        const token = jwt.sign({userId: user.id}, process.env.APP_SECRET);
        // set the jwt as a cookie on response

        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, //1 day cookie
        });
        return user;
    },
    async signin(parent, { email, password }, ctx, info) {
        // 1. check if there's a user w that email
        const response = await fetch(`${baseUrl}/users/email/email?email=${email}`);
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
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, //1 day cookie
        });
        // 5. return user
        return user;
    },
    async signout(parent, args, ctx) {
        ctx.response.clearCookie('token');
        return {message: 'logout successful'};
    },
};

module.exports = Mutation;