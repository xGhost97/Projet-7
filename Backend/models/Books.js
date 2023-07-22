const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const bookSchema = mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  imageUrl: { type: String },
  ratings: [
    {
      userId: { type: String, required: true },
      grade: { type: Number, min: 0, max: 5, required: true },
    },
  ],
  averageRating: { type: Number, default: 0 },
});

bookSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Books', bookSchema);
