const Books = require('../models/Books');
const fs = require('fs');

const sharp = require('sharp');
const path = require('path');

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  
  // Chemin d'accès à l'image téléchargée
  const imagePath = req.file.path;

  // Chemin d'accès pour enregistrer l'image WebP
  const webpImagePath = path.join(path.dirname(imagePath), `${path.basename(imagePath, path.extname(imagePath))}.webp`);

  sharp(imagePath)
    .toFormat('webp') // Conversion en WebP
    .toFile(webpImagePath)
    .then(() => {
      const book = new Books({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      });

      book.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};


exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      }
    : { ...req.body };

  delete bookObject._userId;

  Books.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId !== req.auth.userId) {
        res.status(401).json({ message: 'Non autorisé' });
      } else {
        Books.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet modifié' }))
          .catch(error => res.status(401).json({ error }));
      }
    })
    .catch(error => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Books.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId !== req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Books.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {
  Books.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};


exports.getAllBooks = (req, res, next) => {
  Books.find()
    .then(book => res.status(200).json(book))
    .catch(error => res.status(400).json({ error }));
};

exports.getBooksBestRating = (req, res, next) => {
  Books.find()
    .sort({ rating: 1 })
    .limit(5)
    .then(book => res.status(200).json(book))
    .catch(error => res.status(400).json({ error }));
};


exports.rateBook = (req, res, next) => {
  const { userId, rating } = req.body;

  if (rating < 0 || rating > 5) {
    return res.status(400).json({ error  });
  }

  Books.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ error });
      }

      const userRating = book.ratings.find(entry => entry.userId === userId);

      if (userRating) {
        return res.status(400).json({ error });
      }

      book.ratings.push({ userId, grade: rating });

      const ratingsSum = book.ratings.reduce((sum, entry) => sum + entry.grade, 0);
      book.averageRating = ratingsSum / book.ratings.length;

      return book.save();
    })
    .then(updatedBook => {
      res.status(200).json(updatedBook);
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};







