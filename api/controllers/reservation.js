import { db } from "../db.js";

export const getReservations = (req, res) => {
  const q = 'SELECT * FROM reservations';
  db.query(q, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch reservations from the database.' });
    }

    return res.status(200).json(result);
  });
}

export const getReservationsByUserID = (req, res) => {
  const userID = req.params.userID;
  console.log(userID)
  const q = 'SELECT * FROM reservations WHERE user_id = ?';
  db.query(q, [userID], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch reservations from the database.' });
    }

    return res.status(200).json(result);
  });
}

export const addReservation = (req, res) => {
  const checkIn = new Date(req.body.check_in).toISOString().slice(0, 19).replace('T', ' ');
  const checkOut = new Date(req.body.check_out).toISOString().slice(0, 19).replace('T', ' ');

  const q = "INSERT INTO reservations(`check_in`, `check_out`, `user_id`, `payment_id`, `id_room`) VALUES (?, ?, ?, ?, ?)";
  const values = [
    checkIn,
    checkOut,
    req.body.user_id,
    req.body.paymentId,
    req.body.id_room,
  ];

  db.query(q, values, (err, data) => {
    if (err) {
      console.log(err);
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
};

export const deleteReservation = (req, res) => {
  const reservationID = req.params.reservationID;
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json("Error beginning transaction.");
    }

    const deleteServicesQuery = "DELETE FROM services_log WHERE reservation_id = ?";
    db.query(deleteServicesQuery, [reservationID], (err, servicesData) => {
      if (err) {
        db.rollback(() => {
          return res.status(500).json("Error deleting services log.");
        });
      }

      const deleteReservationQuery = "DELETE FROM reservations WHERE reservationid = ?";
      db.query(deleteReservationQuery, [reservationID], (err, reservationData) => {
        if (err) {
          db.rollback(() => {
            return res.status(500).json("Error deleting reservation.");
          });
        }

        db.commit((err) => {
          if (err) {
            db.rollback(() => {
              return res.status(500).json("Error committing transaction.");
            });
          }

          return res.status(200);
        });
      });
    });
  });
};


export const getService = (req, res) => {
  const q = 'SELECT * FROM services WHERE service_name = ?';
  db.query(q, [req.params.serviceName], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch service from the database.' });
    }

    return res.status(200).json(result);
  });
};

export const getReservationByID = (req, res) => {
  const reservationID = req.params.reservationID;
  const q = "SELECT * FROM reservations WHERE reservationid = ?";

  db.query(q, [reservationID], (err, data) => {
    if (err) {
      return res.status(500).json("Error fetch reservations data");
    }

    return res.status(200).json(data);
  });
};

export const getReservationByRoomID = (req, res) => {
  const roomID = req.params.roomID;
  const q = "SELECT * FROM reservations WHERE id_room = ?";

  db.query(q, [roomID], (err, data) => {
    if (err) {
      return res.status(500).json("Error fetch reservations data");
    }

    return res.status(200).json(data);
  });
};

export const updateReservation = (req, res) => {
  const { reservationID, check_in, check_out } = req.body;
  const updateQuery = `
    UPDATE reservations
    SET check_in = ?, check_out = ?
    WHERE reservationid = ?
  `;

  db.query(updateQuery, [check_in, check_out, reservationID], (error, results) => {
    if (error) {
      console.error("Error updating reservation:", error);
      return res.status(500).send("Error updating reservation");
    }

    if (results.affectedRows === 0) {
      return res.status(404).send("Reservation not found");
    }

    console.log("All OK")
    return res.status(200);
  });
}