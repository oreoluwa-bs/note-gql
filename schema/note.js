const { NoteTC } = require("../models/note");
const { UserTC } = require("../models/user");

NoteTC.addRelation("author", {
  resolver: () => UserTC.mongooseResolvers.findOne(),
  prepareArgs: {
    id: (source) => source.author,
  },
  projection: { james: true },
});

const NoteQuery = {
  getNotes: NoteTC.mongooseResolvers.findMany,
  getNoteById: NoteTC.mongooseResolvers.findById,
  getNoteByField: NoteTC.mongooseResolvers.findOne,
};

const NoteMutation = {
  createNote: NoteTC.mongooseResolvers.createOne,
  updateNoteById: NoteTC.mongooseResolvers.updateById,
  deleteNoteById: NoteTC.mongooseResolvers.removeById,
};

module.exports = { NoteQuery, NoteMutation };
