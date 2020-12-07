const express = require('express');
const app = express();

app.get('/app', (req, res) => {
    res.send('Hello From Express');
});
app.listen(3000);
  
module.exports = app;
