import express from 'express';
import dotenv from 'dotenv';

import apiRoutes from './routes/api'

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use('/api/v1', apiRoutes)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});