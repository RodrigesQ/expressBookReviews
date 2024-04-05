// auth_users.js

const express = require('express');
const jwt = require('jsonwebtoken');
const regd_users = express.Router();
const { users } = require("./usersdb.js"); // Import users array and addUser function from usersdb.js
const books = require("./booksdb.js"); // Import books array from booksdb.js


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
  
    // Print requested ISBN for debugging
    console.log("Requested ISBN:", isbn);
  
    // Find the book with the matching ISBN
    for (const key in books) {
        if (books.hasOwnProperty(key)) { // Check for own properties
          const bookObject = books[key];
      
          if (bookObject && bookObject.isbn === isbn) {
            // Book found! Save the book object for further actions
            const foundBook = bookObject;
            break; // Exit the loop once the book is found
      }
    }
  
    if (foundBook) {
      // Book found! Proceed with review logic
  
      // Find the review for the given ISBN and username
      const userReview = bookObject.reviews.find((reviewObj) => reviewObj.username === username);
  
      if (userReview) {
        // If a review exists for the user and ISBN, modify the existing review
        userReview.review = review;
        return res.status(200).json({ message: "Review modified successfully" });
      } else {
        // If no review exists for the user and ISBN, add a new review
        bookObject.reviews.push({ review, username });
        return res.status(201).json({ message: "Review added successfully" });
      }
    } else {
      // Book not found!
      return res.status(404).json({ message: "Book not found" });
    }}
  });
  



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
