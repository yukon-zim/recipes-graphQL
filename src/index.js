const { GraphQLServer } = require('graphql-yoga');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: 'variables.env' });
const RecipeMutation = require('./resolvers/RecipeMutation');
const UserMutation = require('./resolvers/UserMutation');
const Query = require('./resolvers/Query');

const resolvers = {
    Query,
    Mutation: {...RecipeMutation, ...UserMutation}
};

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    context: req => ({ ...req }),
});

// jwt in cookie vs local storage.
// server-side rendering requires that the jwt be included in every request
// cookies are sent w every request, so use them to store jwt.
// if we stored jwt in local storage, we'd have to manually add it to every request.
server.express.use(cookieParser());
// custom middleware to decode jwt - so we can get the userId on each req
server.express.use((req, res, next) => {
    const { token } = req.cookies;
    if (token) {
        // if a user is logged in, destructure and verify their token
        const { userId } = jwt.verify(token, process.env.APP_SECRET);
        // put userId onto the req for future requests to access
        req.userId = userId;
    }
    next();
});

server.start({
        cors: {
            credentials: true,
            origin: process.env.FRONTEND_URL
        },
    }, () => console.log(`The server is running on http://localhost:4000`)
);