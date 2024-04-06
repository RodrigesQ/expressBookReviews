// auth_users.js

const express = require('express');
const jwt = require('jsonwebtoken');
const regd_users = express.Router();
const { users } = require("./usersdb.js"); // Import users array and addUser function from usersdb.js
const books = require("./booksdb.js"); // Import books array from booksdb.js
const axios = require('axios');

const isValid = (username) => { //returns boolean
    //write code to check is the username is valid
    let userswithsamename = users.filter((user) => {
        return user.username === username
    });
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username, password) => { //returns boolean
    //write code to check if username and password match the one we have in records.
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password)
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    //Write your code here
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
//regd_users.put("/auth/review/:isbn", (req, res) => {
//Write your code here
//return res.status(300).json({ message: "Yet to be implemented" });
//});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    // Extract username, ISBN, and review from request
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;
    const review = req.query.review;

    // Print requested ISBN for debugging -----
    console.log("Requested ISBN:", isbn, "Data type:", typeof isbn);
    // Log the value of the books variable
    console.log("Books:", books, "Data type:", typeof books);

    // Find the book with the matching ISBN
    let foundBook = null;
    for (const key in books) {
        if (books.hasOwnProperty(key)) {
            const bookObject = books[key];

            // Print requested bookObject for debugging
            console.log("Requested bookObject:", bookObject, typeof bookObject);

            if (bookObject.isbn === isbn) {
                // Book found! Save the book object
                foundBook = bookObject;
                break; // Exit the loop once the book is found
            }
        }
    }

    // Print requested bookObject for debugging
    console.log("Book found!", foundBook, typeof foundBook);

    if (foundBook) {
        // Book found! Proceed with review logic

        /// Find the existing review for the given username
        const existingReviewKey = Object.keys(foundBook.reviews).find(
            key => foundBook.reviews[key].username === username
        );

        if (existingReviewKey) {
            // If a review exists for the user and ISBN, modify the existing review
            foundBook.reviews[existingReviewKey].review = review;
            return res.status(200).json({ message: "Review modified successfully" });
        } else {
            // If no review exists for the user and ISBN, add a new review
            const newReviewKey = Object.keys(foundBook.reviews).length + 1; // Generate a new key for the review
            foundBook.reviews[newReviewKey] = { review, username };
            return res.status(201).json({ message: "Review added successfully" });
        }
    } else {
        // Book not found!
        return res.status(404).json({ message: "Book not found" });
    }
});

//Deleting a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    // Extract username and ISBN from request
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;

    // Find the book with the matching ISBN
    let foundBook = null;
    for (const key in books) {
        if (books.hasOwnProperty(key)) {
            const bookObject = books[key];
            if (bookObject.isbn === isbn) {
                // Book found! Save the book object
                foundBook = bookObject;
                break; // Exit the loop once the book is found
            }
        }
    }

    // Print requested bookObject for debugging
    console.log("Book found!", foundBook, typeof foundBook);

    if (!foundBook) {
        // Book not found
        return res.status(404).json({ message: "Book not found" });
    }

    // Find the existing review for the given username
    //const existingReviewKey = Object.keys(foundBook.reviews).find(
    //   key => foundBook.reviews[key].username === username
    //);

    let existingReview = null; // Initialize to null

    // Check if the book and its reviews exist
    if (foundBook && foundBook.reviews) {
        // Iterate through each review within the foundBook.reviews object
        for (const key in foundBook.reviews) {
            const reviewObject = foundBook.reviews[key];

            // If the username of the current review matches the given username
            if (reviewObject.username === username) {
                // Assign the found review to existingReview
                existingReview = reviewObject;

                // Break out of the loop, as we've found the matching review
                break;
            }
        }
    }

    // Print the existingReview for debugging
    console.log("existingReview found!", existingReview, typeof existingReview);


    // Delete the found review
    if (existingReview) {
        delete foundBook.reviews[existingReview.username]; // Assuming username is the key for reviews

        // If your data store requires explicit updates:
        // await updateBookReviews(foundBook._id, foundBook.reviews);

        return res.status(200).json({ message: "Review deleted successfully" });
    } else {
        return res.status(404).json({ message: "No reviews found for this user" });
    }
});

// Get the book list available in the shop
regd_users.get('/auth/', async (req, res) => {
    try {
        res.status(200).json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve books' });
    }
});

// Get book details based on ISBN
regd_users.get('/auth/isbn/:isbn', function (req, res) {
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
regd_users.get('/auth/author/:author', function (req, res) {
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
regd_users.get('/auth/title/:title', function (req, res) {
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



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
