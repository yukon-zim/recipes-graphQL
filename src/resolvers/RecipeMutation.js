const fetch = require('node-fetch');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { handleResponse } = require('../helpers/ResponseHandler');

// public-facing resolvers for getting data.  each mutation here must also be exposed to UI in schema.graphql
const RecipeMutation = {
    async addRecipe(parent, args, ctx) {
        // check if user is logged in
        if (!ctx.request.userId) {
            throw new Error(`You must be logged in to do this!`);
        }
        const response = await fetch(`${process.env.BASE_URL}/recipes`, {
            method: 'POST',
            body:  JSON.stringify(args)
        });
        return handleResponse(response);
    },
    async editRecipe(parent, args, ctx) {
        // check if user is logged in
        if (!ctx.request.userId) {
            throw new Error(`You must be logged in to do this!`);
        }
        // make a copy of the recipe's updates
        const updates = { ...args };
        // remove id from updates - id is never updated (pk)
        delete updates.id;
        // run update request
        const response = await fetch(`${process.env.BASE_URL}/recipes/${args.id}`, {
            method: 'PUT',
            body:  JSON.stringify(updates)
        });
        return handleResponse(response);
    },
    async deleteRecipe(parent, args, ctx) {
        // check if user is logged in
        if (!ctx.request.userId) {
            throw new Error(`You must be logged in to do this!`);
        }
        const response = await fetch(`${process.env.BASE_URL}/recipes/${args.id}`, {
            method: 'DELETE'
        });
        return handleResponse(response);
    },

    async importRecipeFromUrl(parent, {url}, ctx) {
        // check if user is logged in
        if (!ctx.request.userId) {
            throw new Error(`You must be logged in to do this!`);
        }
        const response = await fetch(`${process.env.BASE_URL}/recipes/import-url`, {
            method: 'POST',
            body: JSON.stringify({url})
        });
        return handleResponse(response)
    },
};

module.exports = RecipeMutation;