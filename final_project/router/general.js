const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    //Write your code here
    return res.status(300).json({ message: "Yet to be implemented" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    //Write your code here
    return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    //Write your code here
    const isbn = req.params.isbn; // Retrieve the ISBN from the request parameters
    // Find the book with the matching ISBN
    const book = Object.values(books).find(book => book.isbn === isbn);
    if (book) {
        // If the book is found, send its details in the response
        return res.status(200).json(book);
    } else {
        // If the book is not found, send a 404 Not Found response
        return res.status(404).json({ error: 'Book not found' });
    }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    //Write your code here
    const author = req.params.author;
    const book = Object.values(books).find(book => book.author === author);
    if (book) {
        // If the book is found, send its details in the response
        return res.status(200).json(book);
    } else {
        // If the book is not found, send a 404 Not Found response
        return res.status(404).json({ error: 'Book not found' });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    //Write your code here
    const title = req.params.title;
    const book = Object.values(books).find(book => book.title === title);
    if (book) {
        // If the book is found, send its details in the response
        return res.status(200).json(book);
    } else {
        // If the book is not found, send a 404 Not Found response
        return res.status(404).json({ error: 'Book not found' });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    //Write your code here
    const isbn = req.params.isbn;
    const book = Object.values(books).find(book => book.isbn === isbn);

    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }

    const reviews = book.reviews || [];

    return res.status(200).json(reviews);
});

module.exports.general = public_users;
