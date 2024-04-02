import mysql from "mysql"

export const db = mysql.createConnection({
  host:"localhost",
  user:"root",
  password:"Golpiumiuyiuu1",
  database:"hotel"
})