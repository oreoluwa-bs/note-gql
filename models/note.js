const mongoose = require("mongoose");
const { composeWithMongoose } = require("graphql-compose-mongoose");

const noteSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Note = mongoose.model("Note", noteSchema);
const NoteTC = composeWithMongoose(Note);

module.exports = { Note, NoteTC };
