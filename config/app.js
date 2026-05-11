require("dotenv").config();
const express = require('express');
const app = express();
const PORT = 3000;

/*-----Routes-----*/
//insert routes here

/*-----Error Handling Middleware-----*/
/*-------404 Catch requests to pages that don't exist-------*/
app.use((req, res, next) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

/*-------500 Catch code errors and database failures-------*/
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).send('Something went wrong.');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));