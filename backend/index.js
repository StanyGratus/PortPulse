const express=require('express');
const mongoose=require('mongoose');
require('dotenv').config();

const app=express();
app.use(express.json());
const cors = require("cors");

app.use(cors({
    origin: "process.env.FRONTENDURL",
    credentials: true
}));

const scanRoutes=require('./routes/scanRoutes');
app.use('/api/scan', scanRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log('MongoDB Connected'))
.catch((err)=>console.log('MongoDB error: ',err));

const PORT=process.env.PORT || 5000;
app.listen(PORT, ()=>console.log(`Server running on ${PORT}`));
