const { ApolloServer } = require("apollo-server");
const { SchemaComposer } = require("graphql-compose");
const { getToken } = require("../helpers/auth");
const { NoteQuery, NoteMutation } = require("./note");
const { UserQuery, UserMutation } = require("./user");

const schemaComposer = new SchemaComposer();

schemaComposer.Query.addFields({
  ...NoteQuery,
  ...UserQuery,
});

schemaComposer.Mutation.addFields({
  ...NoteMutation,
  ...UserMutation,
});

const schema = schemaComposer.buildSchema();

const graphQLServer = new ApolloServer({
  schema,
  cors: true,
  context: ({ req }) => {
    const token = getToken(req);

    return { token };
  },
});

module.exports = graphQLServer;
