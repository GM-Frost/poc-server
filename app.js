require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
const uuid = require("uuid");

app.use(express.json());
app.use(cors());

const port = process.env.SERVER_PORT || 8000;

//Reservation ID increment
const reservationsData = JSON.parse(
  fs.readFileSync("reservations.json", "utf8")
);
let lastReservationId = 0;

reservationsData.forEach((reservation) => {
  const reservationId = parseInt(reservation.id);
  if (!isNaN(reservationId) && reservationId > lastReservationId) {
    lastReservationId = reservationId;
  }
});

app.get("/reservations", (req, res) => {
  fs.readFile("reservations.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Error reading reservations." });
      return;
    }
    const reservations = JSON.parse(data);
    res.json(reservations);
  });
});

app.post("/reservations", (req, res) => {
  const newReservation = req.body;
  newReservation.id = (++lastReservationId).toString();
  fs.readFile("reservations.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Error reading reservations." });
      return;
    }
    const reservations = JSON.parse(data);
    reservations.push(newReservation);
    fs.writeFile("reservations.json", JSON.stringify(reservations), (err) => {
      if (err) {
        res.status(500).json({ error: "Error writing reservations." });
        return;
      }
      res.json(newReservation);
    });
  });
});

app.put("/reservations/:id", (req, res) => {
  const reservationId = req.params.id;
  const updatedReservation = req.body;

  fs.readFile("reservations.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Error reading reservations." });
      return;
    }
    const reservations = JSON.parse(data);
    const reservationIndex = reservations.findIndex(
      (reservation) => reservation.id === reservationId
    );

    if (reservationIndex !== -1) {
      reservations[reservationIndex] = updatedReservation;
      fs.writeFile("reservations.json", JSON.stringify(reservations), (err) => {
        if (err) {
          res.status(500).json({ error: "Error writing reservations." });
          return;
        }
        res.json(updatedReservation);
      });
    } else {
      res.status(404).json({ error: "Reservation not found." });
    }
  });
});

// Delete a reservation by ID
app.delete("/reservations/:id", (req, res) => {
  const reservationId = req.params.id;

  fs.readFile("reservations.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Error reading reservations." });
      return;
    }
    const reservations = JSON.parse(data);
    const reservationIndex = reservations.findIndex(
      (reservation) => reservation.id === reservationId
    );

    if (reservationIndex !== -1) {
      const deletedReservation = reservations.splice(reservationIndex, 1)[0];
      fs.writeFile("reservations.json", JSON.stringify(reservations), (err) => {
        if (err) {
          res.status(500).json({ error: "Error writing reservations." });
          return;
        }
        res.json(deletedReservation);
      });
    } else {
      res.status(404).json({ error: "Reservation not found." });
    }
  });
});

app.get("/reservations/:id", (req, res) => {
  const reservationId = req.params.id;

  fs.readFile("reservations.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Error reading reservations." });
      return;
    }
    const reservations = JSON.parse(data);
    const reservation = reservations.find((r) => r.id === reservationId);
    if (reservation) {
      res.json(reservation);
    } else {
      res.status(404).json({ error: "Reservation not found" });
    }
  });
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
