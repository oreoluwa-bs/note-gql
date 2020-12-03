const { NoteTC } = require("../models/note");

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
