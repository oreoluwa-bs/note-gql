const { NoteTC } = require("../models/note");

const NoteQuery = {
  getNotes: NoteTC.getResolver("findMany"),
  getNoteById: NoteTC.getResolver("findById"),
};

const NoteMutation = {
  createNoteOne: NoteTC.getResolver("createOne"),
  deleteNoteOne: NoteTC.getResolver("removeOne"),
};

module.exports = { NoteQuery, NoteMutation };
