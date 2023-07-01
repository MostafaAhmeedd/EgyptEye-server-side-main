const express = require('express')
const app = express()
const port = 3000
const path = require('path');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/uploads',express.static(path.join(__dirname,"uploads")));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const session = require('express-session');
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// support parsing of application/json type post data
const bodyParser = require('body-parser');
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

// APIs file
const authRoutes = require('./APIs/Auth');
const adminRoutes = require('./APIs/Admin');
const searchRoutes = require('./APIs/Search');
const profileRoutes = require('./APIs/Profile');
const favoriteRoutes = require('./APIs/Favorite');

app.use("/APIs", authRoutes); 
app.use('/APIs', adminRoutes);
app.use('/search', searchRoutes);
app.use('/profile', profileRoutes);
app.use('/favorite', favoriteRoutes);


// app.get('/', (req, res) => {
//     res.render('login');
//   });



// app.get('/APIs/login', (req, res) => {
//   res.render('main');
// });

// app.get('/APIs/admin/signup.html', (req, res) => {
//   res.render("login");
// })




// app.get("/login.html", (req,res) =>{
//   res.render("login");
// });


// app.get("/profile.html", (req,res) =>{
//   res.render("profile");
// });

// app.use( (req, res) => {
//      res.status(404).send("Sorry cannot find!");
// } )

app.get("/", (req, res)=>{
    res.render('login');
})
app.get("/login", (req, res)=>{
  res.render('login');
})
app.get("/addplace", (req,res) =>{
  res.render("addplace");
});

app.get("/main", (req,res) =>{

  // const token = req.cookies.token;
  res.render("main")

});
app.get('/admin-signup', (req, res) => {
  res.render('signup');
});
app.get('/viewuser', (req, res) => {
  res.render('viewuser');
});
// app.get("/getlandmarks", (req,res) =>{
//   res.render("getlandmarks");
// });

// app.get('/profile-admin', (req, res) => {
//   res.render('profile-admin');
// });
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})