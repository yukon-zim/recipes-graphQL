const fetch = require('node-fetch');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    },
    createUser: async (parent, args) => {
        args.email = args.email.toLowerCase();
        // hash their PW
        const password = await bcrypt.hash(args.password, 10);
        // complete new user request w/ back-end info
        const newUser = {
            ...args,
            password,
            permissions: ['USER']
        };
        // create user in db
        const response = await fetch(`http://localhost:1337/users`, {
            method: 'POST',
            body:  JSON.stringify(newUser)
        });
        const jsonData = await response.json();
        if (response.ok) {
            return jsonData;
        }
        throw new Error(jsonData.message);
    }
};

module.exports = Mutation;