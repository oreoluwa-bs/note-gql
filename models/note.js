const mongoose = require("mongoose");
const { composeMongoose } = require("graphql-compose-mongoose");
const { default: slugify } = require("slugify");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Untitled Note",
    },
    content: {
      type: String,
    },
    slug: String,
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

// Middlewares
// eslint-disable-next-line func-names
noteSchema.pre("save", function (next) {
  const id = this._id.toString();
  this.slug = slugify(`${this.title} ${id.slice(id.length - 3)}`, {
    lower: true,
  });
  next();
});

const Note = mongoose.model("Note", noteSchema);
const NoteTC = composeMongoose(Note);

module.exports = { Note, NoteTC };
