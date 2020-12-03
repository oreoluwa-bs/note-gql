const { NoteTC } = require("../models/note");

const NoteQuery = {
  getNoteById: NoteTC.getResolver("findById"),
};

const NoteMutation = {
  createNoteOne: NoteTC.getResolver("createOne"),
};

module.exports = { NoteQuery, NoteMutation };
