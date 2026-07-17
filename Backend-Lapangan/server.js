const express = require('express');
const cors = require('cors');
const lapanganRoutes = require('./routes/lapanganRoutes');
const reservasiRoutes = require('./routes/reservasiRoutes');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/lapangan', lapanganRoutes);
app.use('/api/reservasi', reservasiRoutes);
app.use('/api/auth', authRoutes);
app.listen(process.env.PORT, () => console.log(`Server jalan di port ${process.env.PORT}`));
