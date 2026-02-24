const express = require('express');
const cors = require('cors');
const sw = require('./swagger');
const errH = require('./middleware/error');

const auth = require('./routes/authRoutes');
const users = require('./routes/userRoutes');
const tkts = require('./routes/ticketRoutes');
const box = require('./routes/commentRoutes');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/auth', auth);
app.use('/users', users);
app.use('/tickets', tkts);
app.use('/comments', box);

app.use('/docs', sw.swaggerUi.serve, sw.swaggerUi.setup(sw.swaggerDocument));

app.use(errH);

module.exports = app;
