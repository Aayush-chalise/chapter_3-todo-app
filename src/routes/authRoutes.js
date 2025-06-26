import express from "express";
import bcrypt from "bcryptjs"; // used for hashing passwords securely
import jwt from "jsonwebtoken"; // used to create and verify JWTs for user authentication. n
import prisma from "../prismaClient.js";

const router = express.Router(); //

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const saltRounds = 8; // saltRounds control how many times the hashing algorithm works  . The more round makes more security but decreases speed of the hashing  algorithm / Slower performance.
  // encrypt the password
  const hashedPassword = bcrypt.hashSync(password, saltRounds);

  // save the new user and hashed passwowrd to the db

  // Error Handling(try and catch)
  try {
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    // now that we have a user, I want to add their first todo for them
    const defaultTodo = `Hello :) Add your first todo!`;

    const todo = await prisma.todo.create({
      data: {
        task: defaultTodo,
        userId: user.id,
      },
    });

    //create a token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ token });
  } catch (err) {
    res.sendStatus(503);
  }

  // res.send("Registering user");
});

router.post("/login", async (req, res) => {
  // We get their email and we look up the password associated with that email in the database . but we get it back and see its encrypted, which means that we cannot compare it to the one the user just used trying to login so what we can to do is again one way encrypt the password the user just entered

  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

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
