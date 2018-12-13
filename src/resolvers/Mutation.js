const fetch = require('node-fetch');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { handleResponse } = require('../helpers/ErrorHandler');

// public-facing resolvers for getting data.  each mutation here must also be exposed to UI in schema.graphql
const Mutation = {
    addRecipe: async (parent, args) => {
        const response = await fetch(`http://localhost:1337/recipes`, {
            method: 'POST',
            body:  JSON.stringify(args)
        });
        return handleResponse(response);
    },
    editRecipe: async (parent, args) => {
        // make a copy of the recipe's updates
        const updates = { ...args };
        // remove id from updates - id is never updated (pk)
        delete updates.id;
        // run update request
        const response = await fetch(`http://localhost:1337/recipes/${args.id}`, {
            method: 'PUT',
            body:  JSON.stringify(updates)
        });
        return handleResponse(response);
    },
    deleteRecipe: async (parent, args) => {
        const response = await fetch(`http://localhost:1337/recipes/${args.id}`, {
            method: 'DELETE'
        });
        return handleResponse(response);
    },
    createUser: async (parent, args, ctx) => {
        args.email = args.email.toLowerCase();
        // hash their PW
        const password = await bcrypt.hash(args.password, 10);
        // complete new user request w/ back-end info
        const newUser = {
            ...args,
            password,
            superuser: false
        };
        // create user in db
        const response = await fetch(`http://localhost:1337/users`, {
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
    }
};

module.exports = Mutation;