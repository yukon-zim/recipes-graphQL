const fetch = require('node-fetch');
const { handleResponse } = require('../helpers/ErrorHandler');

const baseUrl = 'http://localhost:1337';
// public-facing resolvers for getting data.  each query here must also be exposed to UI in schema.graphql
const Query = {
    recipes: async (parent, args) => {
        let recipes;
        if (!args.searchTerm) {
            recipes = await fetch(`${baseUrl}/recipes`);
        }
        recipes = await fetch(`${baseUrl}/recipes?searchTerm=${args.searchTerm}`);
        return handleResponse(recipes);
    },
    recipe: async (parent, args) => {
        const recipe = await fetch(`${baseUrl}/recipes/${args.id}`);
        return handleResponse(recipe);
    },
    users: async (parent, args) => {
        const users = await fetch(`${baseUrl}/users`);
        return handleResponse(users);
    },
    userById: async (parent, args) => {
        const user = await fetch(`${baseUrl}/users/${args.id}`);
        return handleResponse(user);
    },
    userByEmail: async (parent, args) => {
        const user = await fetch(`${baseUrl}/users/email/email?email=${args.email}`);
        return handleResponse(user);
    },
    whoAmI: async (parent, args, ctx) => {
        // check if there is a current userId
        // access to ctx is provided where graphQL server is instantiated (index.js)
        if (!ctx.request.userId) {
            console.log('no user logged in');
            return null;
        }
        const currentUser = await fetch(`${baseUrl}/users/${ctx.request.userId}`);
        return handleResponse(currentUser);
}
};

module.exports = Query;