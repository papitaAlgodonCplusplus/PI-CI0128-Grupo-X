import { db } from "../db.js";

export const addCardPayment = (req, res) => {
  const q = "INSERT INTO card(`card_type`) VALUES (?)";
  const values = [
    req.body.cardType,
  ];
  
  db.query(q, [values], (err, data) => {
    if (err) return res.json(err);
    const paymentid = data.insertId;
    return res.status(200).json({ paymentid });
  });
};

export const addBankPayment = (req, res) => {
  const q = "INSERT INTO transaction(`bank`) VALUES (?)";
  const values = [
    req.body.bankName,
  ];
  
  db.query(q, [values], (err, data) => {
    if (err) return res.json(err);
    const paymentid = data.insertId;
    return res.status(200).json({ paymentid });
  });
};

export const getPaymentByID = (req, res) => {
  const q = 'SELECT * FROM payments WHERE paymentid = ?';
  db.query(q, [req.params.paymentID], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch rooms from the database.' });
    }

    return res.status(200).json(result);
  });
};

export const addCashPayment = (req, res) => {
  const q = "INSERT INTO cash(`change_amount`) VALUES (?)";
  const values = [
    req.body.change,
  ];
  
  db.query(q, [values], (err, data) => {
    if (err) return res.json(err);
    const paymentid = data.insertId;
    return res.status(200).json({ paymentid });
  });
};

export const addPayment = (req, res) => {
  const q = "INSERT INTO payments(`price`, `id_method`) VALUES (?)";
  const values = [
    req.body.price,
    req.body.paymentMethodId,
  ];
  
  db.query(q, [values], (err, data) => {
    if (err) return res.json(err);
    const payment_id = data.insertId;
    return res.status(200).json({ payment_id });
  });
}