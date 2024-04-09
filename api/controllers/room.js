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

  console.log("1/3 queries")

  var lastImageId = null;
  const query = "SELECT imageid FROM images ORDER BY imageid DESC LIMIT 1";
  db.query(query, (error, results) => {
    if (error) {
      console.log("A")
      return res.status(500).send("Internal Server Error");
    }

    if (results.length === 0) {
      console.log("B")
      res.status(404).send("No images found");
    } else {
      lastImageId = results[0].imageid;
    }
  });

  console.log("2/3 queries")
  const q = "SELECT * FROM rooms WHERE title = ?";

  db.query(q, [req.body.name], (err, data) => {
    if (err) {
      console.log("C")
      return res.json(err);
    }
    if (data.length) {
      console.log("D")
      return res.status(409).json("Room already exists!");
    }

    console.log("3/3 queries")
    const q = "INSERT INTO rooms(`image_id`, `title`, `description`, `type_of_room`) VALUES (?)"
    const values = [
      lastImageId,
      req.body.name,
      req.body.desc,
      1
    ]
    db.query(q, [values], (err, data) => {
      if (err) {
        console.log(err)
        return res.json(err);
      }
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

  const getRoomImageIdQuery = "SELECT image_id FROM rooms WHERE roomid = ?";
  const deleteImagesQuery = "DELETE FROM images WHERE imageid = ?";

  db.query(getRoomImageIdQuery, [roomId], (err, roomData) => {
    if (err) {
      return res.status(500).json("Error retrieving room data.");
    }

    console.log(roomData, [roomId])
    if (roomData.length === 0) {
      return res.status(404).json("Room not found.");
    }

    const imageId = roomData[0].image_id;

    db.query(deleteImagesQuery, [imageId], (err, imagesData) => {
      if (err) {
        return res.status(500).json("Error deleting images.");
      }

      res.json("Images related to the room have been deleted!");
    });
  });

  const q = "DELETE FROM rooms WHERE roomid = ?";

  db.query(q, [roomId], (err, data) => {
    if (err) {
      return res.status(500).json("Error.");
    }

    return res.status(200);
  });
};