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

export const searchRoomsOutsideDateRange = (req, res) => {
  const checkIn = req.query.check_in_date;
  const checkOut = req.query.check_out_date;

  const query = `
    SELECT *
    FROM rooms
    WHERE roomid NOT IN (
      SELECT id_room
      FROM reservations
      WHERE (check_in BETWEEN ? AND ?)
        OR (check_out BETWEEN ? AND ?)
        OR (? BETWEEN check_in AND check_out)
    )
  `;

  db.query(query, [checkIn, checkOut, checkIn, checkOut, checkIn], (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Failed to fetch rooms from the database.' });
    }
    return res.status(200).json(results);
  });
};