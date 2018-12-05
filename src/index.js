const { GraphQLServer } = require('graphql-yoga');
const fetch = require('node-fetch');

const baseUrl = 'http://localhost:1337';

const resolvers = {
    Query: {
    //     description: () => `This is the API for a simple blogging application`
        recipes: async () => {
            const recipes = await fetch(`${baseUrl}/recipes`);
            // console.log(recipes);
            return recipes.json();
        },
        recipe: async (parent, args) => {
            const recipe = await fetch(`${baseUrl}/recipes/${args.id}`);
            return recipe.json();
        }
    },
    Mutation: {
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
            return response.json();
        }
    }
};

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers
});

server.start(() => console.log(`The server is running on http://localhost:4000`));