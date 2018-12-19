const fetch = require('node-fetch');
const { handleResponse } = require('../helpers/ResponseHandler');

// public-facing resolvers for getting data.  each query here must also be exposed to UI in schema.graphql
const Query = {
    recipes: async (parent, args) => {
        let recipes;
        if (!args.searchTerm) {
            recipes = await fetch(`${process.env.BASE_URL}/recipes`);
        } else {
            recipes = await fetch(`${process.env.BASE_URL}/recipes?searchTerm=${args.searchTerm}`);
        }
        return handleResponse(recipes);
    },
    recipe: async (parent, args) => {
        const recipe = await fetch(`${process.env.BASE_URL}/recipes/${args.id}`);
        return handleResponse(recipe);
    },
    users: async (parent, args) => {
        const users = await fetch(`${process.env.BASE_URL}/users`);
        return handleResponse(users);
    },
    userById: async (parent, args) => {
        const user = await fetch(`${process.env.BASE_URL}/users/${args.id}`);
        return handleResponse(user);
    },
    userByEmail: async (parent, args) => {
        const user = await fetch(`${process.env.BASE_URL}/users/email/email?email=${args.email}`);
        return handleResponse(user);
    },
    whoAmI: async (parent, args, ctx) => {
        // check if there is a current userId
        // access to ctx is provided where graphQL server is instantiated (index.js)
        if (!ctx.request.userId) {
            console.log('no user logged in');
            return null;
        }
        const currentUser = await fetch(`${process.env.BASE_URL}/users/${ctx.request.userId}`);
        // if no user is found (ie if logged-in user has been deleted from db), return null in order to prevent render errors in frontend
        if (currentUser.status === 404) {
            return null;
        }
        return handleResponse(currentUser);
    }
};

module.exports = Query;