import { db } from "../db.js";
import multer from "multer";

export const addService = (req, res) => {
  const q = "SELECT * FROM services WHERE service_name = ?";

  db.query(q, [req.body.service_name], (err, data) => {
    if (err) {
      return res.json(err);
    }
    if (data.length) {
      return res.status(409).json("Service already exists!");
    }

    const q = "INSERT INTO services(`service_name`, `service_price`) VALUES (?)"
    const values = [
      req.body.service_name,
      req.body.fee,
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

export const addToServiceLog = (req, res) => {
  console.log("Here?")
  const q = "INSERT INTO services_log(`service_id`, `reservation_id`) VALUES (?)"
  const values = [
    req.body.service_id,
    req.body.reservation_id,
  ]
  db.query(q, [values], (err, data) => {
    if (err) {
      console.log(err)
      return res.json(err);
    }
    return res.status(200);
  })
}

export const updateServices = (req, res) => {
  const q = 'SELECT * FROM services';
  db.query(q, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch services from the database.' });
    }

    return res.status(200).json(result);
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

export const deleteService = (req, res) => {
  const serviceID = req.params.serviceID;
  const q = "DELETE FROM services WHERE serviceid = ?";

  db.query(q, [serviceID], (err, data) => {
    if (err) {
      return res.status(500).json("Error couldn't delete service.");
    }

    return res.status(200);
  });
};

export const getSumByReservationID = (req, res) => {
  const reservationID = req.params.reservationID;
  const getServiceIDsQuery = `
    SELECT service_id
    FROM services_log
    WHERE reservation_id = ?
  `;

  db.query(getServiceIDsQuery, [reservationID], (error, results) => {
    if (error) {
      console.error("Error retrieving service IDs:", error);
      res.status(500).send("Error retrieving service IDs");
      return;
    }

    const serviceIDs = results.map(result => result.service_id);
    if (serviceIDs.length === 0) {
      res.json({ totalServicePrice: 0 });
      return;
    }

    const getServicePricesQuery = `
      SELECT service_price
      FROM services
      WHERE serviceid IN (?)
    `;

    db.query(getServicePricesQuery, [serviceIDs], (error, results) => {
      if (error) {
        console.error("Error retrieving service prices:", error);
        res.status(500).send("Error retrieving service prices");
        return;
      }

      const totalServicePrice = results.reduce((total, result) => total + result.service_price, 0);
      res.json({ totalServicePrice });
    });
  });
};