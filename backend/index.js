const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
require('dotenv').config();

const app=express();
app.use(cors());
app.use(express.json());

const scanRoutes=require('./routes/scanRoutes');
app.use('/api/scan', scanRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log('MongoDB Connected'))
.catch((err)=>console.log('MongoDB error: ',err));

const PORT=process.env.PORT || 5000;
app.listen(PORT, ()=>console.log(`Server running on ${PORT}`));
