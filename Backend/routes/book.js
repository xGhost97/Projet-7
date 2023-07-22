const express = require('express');
const router = express.Router();
const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');
const booksCtrl = require('../controllers/book');


router.get('/bestrating', booksCtrl.getBooksBestRating);
router.post('/:id/rating', booksCtrl.rateBook)
router.get('/', booksCtrl.getAllBooks);
router.post('/', auth, multer, booksCtrl.createBook);
router.put('/:id', auth, multer, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.get('/:id', booksCtrl.getOneBook);


module.exports = router;
