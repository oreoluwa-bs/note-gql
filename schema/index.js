const { ApolloServer } = require("apollo-server");
const { SchemaComposer } = require("graphql-compose");
const { NoteQuery, NoteMutation } = require("./note");

const schemaComposer = new SchemaComposer();

schemaComposer.Query.addFields({
  ...NoteQuery,
});

schemaComposer.Mutation.addFields({
  ...NoteMutation,
});

const schema = schemaComposer.buildSchema();

const graphQLServer = new ApolloServer({ schema });

module.exports = graphQLServer;
