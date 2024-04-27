import { db } from "../db.js";
import multer from "multer";

export const addRoomType = (req, res) => {
  const q = "INSERT INTO categories(`class_name`, `price`) VALUES (?, ?)";
  const values = [
    req.body.room_type_name,
    req.body.room_type_price,
  ];

  db.query(q, values, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
};

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
    if (err) {
      return res.json(err);
    }
    if (data.length) {
      return res.status(409).json("Room already exists!");
    }

    const q = "INSERT INTO rooms(`image_id`, `title`, `description`, `type_of_room`) VALUES (?)"
    const values = [
      lastImageId,
      req.body.name,
      req.body.desc,
      req.body.room_type
    ]
    db.query(q, [values], (err, data) => {
      if (err) {
        return res.json(err);
      }
      return res.status(200);
    })
  })
}

export const updateRoomTypes = (req, res) => {
  const q = 'SELECT * FROM categories';
  db.query(q, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch categories from the database.' });
    }

    return res.status(200).json(result);
  });
};

export const updateRooms = (req, res) => {
  const q = 'SELECT * FROM rooms';
  db.query(q, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch rooms from the database.' });
    }

    return res.status(200).json(result);
  });
};

export const updateRoomsByID = (req, res) => {
  const roomID = req.params.roomID;
  const q = 'SELECT * FROM rooms WHERE roomid = ?';
  db.query(q, [roomID], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch rooms from the database.' });
    }

    return res.status(200).json(result);
  });
};

export const updateRoomTypesByID = (req, res) => {
  const roomTypeID = req.params.roomTypeID;
  const q = 'SELECT * FROM categories WHERE categoryid = ?';
  db.query(q, [roomTypeID], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch categories from the database.' });
    }

    return res.status(200).json(result);
  });
};

export const getImagesFilenames = (req, res) => {
  const q = 'SELECT * FROM images';
  db.query(q, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch rooms from the database.' });
    }

    return res.status(200).json(result);
  });
}

export const searchImages = (req, res) => {
  const q = 'SELECT * FROM images';
  db.query(q, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch filenames from the database.' });
    }

    return res.status(200).json(result);
  });
};

export const deleteRoom = (req, res) => {
  const roomID = req.params.roomID;

  const getRoomImageIDQuery = "SELECT image_id FROM rooms WHERE roomid = ?";
  const deleteImagesQuery = "DELETE FROM images WHERE imageid = ?";

  db.query(getRoomImageIDQuery, [roomID], (err, roomData) => {
    if (err) {
      return res.status(500).json("Error retrieving room data.");
    }

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

  db.query(q, [roomID], (err, data) => {
    if (err) {
      return res.status(500).json("Error.");
    }

    return res.status(200);
  });
};

export const deleteRoomType = (req, res) => {
  const reservationID = req.params.reservationID;
  const q = "DELETE FROM categories WHERE categoryid = ?";

  db.query(q, [reservationID], (err, data) => {
    if (err) {
      return res.status(500).json("Error couldn't delete category.");
    }

    return res.status(200);
  });
};