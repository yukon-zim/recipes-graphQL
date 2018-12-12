const fetch = require('node-fetch');

const baseUrl = 'http://localhost:1337';
// public-facing resolvers for getting data.  each query here must also be exposed to UI in schema.graphql
const Query = {
    recipes: async (parent, args) => {
        let recipes;
        if (!args.searchTerm) {
            recipes = await fetch(`${baseUrl}/recipes`);
        }
        recipes = await fetch(`${baseUrl}/recipes?searchTerm=${args.searchTerm}`);
        // console.log(recipes);
        return recipes.json();
    },
    recipe: async (parent, args) => {
        const recipe = await fetch(`${baseUrl}/recipes/${args.id}`);
        return recipe.json();
    },
    users: async (parent, args) => {
        const users = await fetch(`${baseUrl}/users`);
        return users.json();
    },
    user: async (parent, args) => {
        const user = await fetch(`${baseUrl}/users/${args.id}`);
        return user.json();
    },
    whoAmI: async (parent, args, ctx) => {
        // check if there is a current userId
        // todo: do i even have access to ctx? this comes from the frontend, right?
        if (!ctx.request.id) {
            console.log('no user logged in');
            return null;
        }
        const currentUser = await fetch(`${baseUrl}/users/${ctx.request.id}`);
        return currentUser;
}
};

module.exports = Query;