const fetch = require('node-fetch');

// public-facing resolvers for getting data.  each mutation here must also be exposed to UI in schema.graphql
const Mutation = {
    addRecipe: async (parent, args) => {
        const response = await fetch(`http://localhost:1337/recipes`, {
            method: 'POST',
            body:  JSON.stringify(args)
        });
        const jsonData = await response.json();
        if (response.ok) {
            return jsonData;
        }
        throw new Error(jsonData.message);
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
        const jsonData = await response.json();
        if (response.ok) {
            return jsonData;
        }
        throw new Error(jsonData.message);
    },
    deleteRecipe: async (parent, args) => {
        const response = await fetch(`http://localhost:1337/recipes/${args.id}`, {
            method: 'DELETE'
        });
        const jsonData = await response.json();
        if (response.ok) {
            return { message: jsonData.message };
        }
        throw new Error(jsonData.message);
    }
};

module.exports = Mutation;