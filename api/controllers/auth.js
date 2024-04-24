import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

export const getUserID = (req, res) => {
  const q = "SELECT userid FROM users WHERE email = ?"

  db.query(q, [req.params.email], (err, data) => {
    if (err) return res.json(err)
    return res.status(200).json(data);
  })
}

export const getEmail = (req, res) => {
  const q = "SELECT email FROM users WHERE userid = ?";

  db.query(q, [req.params.userID], (err, data) => {
    if (err) return res.json(err);
    return res.status(200).json(data);
  });
};

export const getUserByID = (req, res) => {
  const userID = req.params.userID;
  const q = 'SELECT * FROM users WHERE userid = ?';
  db.query(q, [userID], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch user data from the database.' });
    }

    console.log("Returning: ", result, userID)
    return res.status(200).json(result);
  });
}

export const register = (req, res) => {
  // Check if the user already exists
  const q = "SELECT * FROM users WHERE email = ?";
  db.query(q, [req.body.email], (err, data) => {
    if (err) {
      console.log(err)
      return res.json(err);
    }
    if (data.length) return res.status(409).json("User already exists!");

    // Hash the password and create the user
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const q = "INSERT INTO users(`name`, `email`, `last_name`, `password`, `rol`) VALUES (?)"
    const values = [
      req.body.name,
      req.body.email,
      req.body.last_name,
      hash,
      req.body.rol
    ]
    db.query(q, [values], (err, data) => {
      if (err) return res.json(err);
      return res.status(200).json({ message: "User has been created!" });
    })
  })
}

export const login = (req, res) => {
  const q = "SELECT * FROM users WHERE email = ?"

  db.query(q, [req.body.email], (err, data) => {
    if (err) return res.json(err)
    if (data.length === 0) return res.status(404).json("Wrong email or password")

    const isPasswordCorrect = bcrypt.compareSync(req.body.password, data[0].password)

    if (!isPasswordCorrect) return res.status(404).json("Wrong email or password")

    const token = jwt.sign({ id: data[0].id }, "jwtkey")
    const { password, ...other } = data[0]

    res.cookie("access_token", token, {
      httpOnly: true,
    }).status(200).json(other)
  })
}


export const deleteUser = (req, res) => {
  const q = "DELETE FROM users WHERE email = ?";

  db.query(q, [req.params.email], (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error couldn't delete user." });
    }

    return res.status(200).json({ message: "User deleted successfully." });
  });
};

export const logout = (req, res) => {

}