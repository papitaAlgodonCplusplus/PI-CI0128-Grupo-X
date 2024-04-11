import { db } from "../db.js";

export const searchByTitle = (req, res) => {
  const term = req.params.term.toLowerCase();
  const q = `SELECT * FROM rooms WHERE LOWER(title) LIKE '%${term}%'`;

  db.query(q, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to search rooms in the database.' });
    }
    return res.status(200).json(result);
  });
};

export const getRoomByID = (req, res) => {
 
};

export const retireveRoomByID = (req, res) => {
  const q = 'SELECT * FROM rooms WHERE roomid = ?';
  db.query(q, [req.params.roomID], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch rooms from the database.' });
    }

    return res.status(200).json(result);
  });
};