import express from "express";
import bcrypt from "bcryptjs"; // used for hashing passwords securely
import jwt from "jsonwebtoken"; // used to create and verify JWTs for user authentication. n
import db from "../db.js";

const router = express.Router(); //

router.post("/register", (req, res) => {
  const { username, password } = req.body;
  const saltRounds = 8; // saltRounds control how many times the hashing algorithm works  . The more round makes more security but decreases speed of the hashing algorithm / Slower performance.
  // encrypt the password
  const hashedPassword = bcrypt.hashSync(password, saltRounds);

  // save the new user and hashed passwowrd to the db

  // Error Handling(try and catch)
  try {
    const insertUser = db.prepare(
      "INSERT INTO users  (username, password) VALUES (? , ?)"
    ); // INSERT, UPDATE, DELETE these kind of query returns a object with meta data(data about data). Username and password are the name of the columns  // .prepare() is SQL statement before execution. similar to .exec() method but it is ideal for multiple use and it can have a parameter which .exec() method didnot have. returns a obj which has methods like .get(), .run() etc.
    const result = insertUser.run(username, hashedPassword); // pass the value we want to store in db.

    // now that we have a user, I want to add their first todo for them
    const defaultTodo = `Hello :) Add your first todo!`;
    const insertTodo = db.prepare(
      `INSERT INTO todos (user_id, task) VALUES(?, ?)`
    );
    insertTodo.run(result.lastInsertRowid, defaultTodo);

    //create a token
    const token = jwt.sign(
      { id: result.lastInsertRowid },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token });
  } catch (err) {
    res.sendStatus(503);
  }

  // res.send("Registering user");
});

router.post("/login", (req, res) => {
  // We get their email and we look up the password associated with that email in the database . but we get it back and see its encrypted, which means that we cannot compare it to the one the user just used trying to login so what we can to do is again one way encrypt the password the user just entered

  const { username, password } = req.body;

  try {
    const getUser = db.prepare("SELECT * FROM users WHERE username = ?");
    const user = getUser.get(username); // user is a object where it holds username, password and id of a single user not all users, which we get from database

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);

    //If password doesnot match
    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid Password." });
    }

    //Token
    // we provide a secret key to a token so that on further login/register the user can be identified using that secret key.
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.json({ token });
  } catch (err) {
    res.sendStatus(503);
  }
});

export default router;
