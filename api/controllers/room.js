import { db } from "../db.js";
import multer from "multer";

export const addRoom = (req, res) => {
  const qi = "INSERT INTO images(`filename`, `filepath`) VALUES (?)"
  const filepath = "client/public/upload/" + req.body.filename.data;

  const values_0 = [
    req.body.filename.data,
    filepath
  ]
  db.query(qi, [values_0], (err, data) => {
    if (err) return res.json(err);
  })

  var lastImageId = null;
  const query = "SELECT imageid FROM images ORDER BY imageid DESC LIMIT 1";
  db.query(query, (error, results) => {
    if (error) {
      return res.status(500).send("Internal Server Error");
    }

    if (results.length === 0) {
      res.status(404).send("No images found");
    } else {
      lastImageId = results[0].imageid;
    }
  });

  const q = "SELECT * FROM rooms WHERE title = ?";

  db.query(q, [req.body.name], (err, data) => {
    if (err) return res.json(err);
    if (data.length) return res.status(409).json("Room already exists!");

    const q = "INSERT INTO rooms(`image_id`, `description`, `title`, `type_of_room`) VALUES (?)"
    const values = [
      lastImageId,
      req.body.name,
      req.body.desc,
      1
    ]
    console.log(values)
    db.query(q, [values], (err, data) => {
      if (err) return res.json(err);
      return res.status(200);
    })
  })
}

export const updateRooms = (req, res) => {
  const q = 'SELECT * FROM rooms';
  db.query(q, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch rooms from the database.' });
    }

    return res.status(200).json(result);
  });
};

export const updateImages = (req, res) => {
  const q = 'SELECT filename FROM images';
  db.query(q, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch filenames from the database.' });
    }

    return res.status(200).json(result);
  });
};
export const searchImages = (req, res) => {
  const q = 'SELECT * FROM images';
  db.query(q, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch filenames from the database.' });
    }

    return res.status(200).json(result);
  });
};
export const searchRooms = (req, res) => {
  const term = req.params.term.toLowerCase();
  const q = `SELECT * FROM rooms WHERE LOWER(title) LIKE '%${term}%'`;

  db.query(q, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to search rooms in the database.' });
    }
    return res.status(200).json(result);
  });
};

export const deleteRoom = (req, res) => {
  const roomId = req.params.roomId;
  const q = "DELETE FROM rooms WHERE roomid = ?";

  db.query(q, [roomId], (err, data) => {
    if (err) {
      return res.status(500).json("Error.");
    }

    return res.json("Room has been deleted!");
  });
};
