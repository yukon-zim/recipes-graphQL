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
    }
};

module.exports = Query;