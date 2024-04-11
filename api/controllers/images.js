import { db } from "../db.js";

export const retrieveImages = (req, res) => {
  const q = 'SELECT * FROM images';
  db.query(q, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch rooms from the database.' });
    }

    return res.status(200).json(result);
  });
};


export const geImageByID = (req, res) => {
  console.log(req.params.imageID)
  const q = 'SELECT * FROM images WHERE imageid = ?';
  db.query(q, [req.params.imageID], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch rooms from the database.' });
    }

    return res.status(200).json(result);
  });
};