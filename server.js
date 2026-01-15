import express from 'express';
const app = express();
import db from './db.js';
app.get('/', (req, res) => {
  res.send('Welcome to my app');
});

app.get('/getData', (req, res) => {
  db.execute("SELECT * FROM users",(err,results) => {
    if(err){
      console.error('Error fetching data from the database:', err);
      return res.status(500).json({"message":"Server error"});
    }
return res.status(200).json({"message":"data fetched successfully","data":results});
  })
});

app.listen(3000, () => {
  console.log(`Server is running on port 3000`);
});

