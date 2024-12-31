// importing dotenv
require('dotenv').config()
// importing express
const express = require('express')
// importing cores
const cors = require('cors')
// jwt
const jwt = require('jsonwebtoken');
// importing mongodb
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// application port
const port = process.env.PORT || 5000
// creating express app
const app = express()
// importing cookie parser
const cookieParser = require('cookie-parser');

// <-------------- middlewares ---------------->

// corsOptions for jwt
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  credentials: true,
  optionalSuccessStatus: 200,
}
// using cors middleware
app.use(cors(corsOptions))
// using express.json middleware
app.use(express.json())
// using cookie parser
app.use(cookieParser());

// authenticating verifyToken
const verifyToken = (req, res, next) => {
  const tokenFromClient = req.cookies?.token;
  // no token found from client side check
  if (!tokenFromClient) {
    return res.status(401).send({ message: 'unauthorized access!' })
  };
  // check client token is valid or not
  jwt.verify(tokenFromClient, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'unauthorized access!' });
    }
    req.user = decoded;
    // call the next middleware
    next();
  })
}

//<----------------- mongodb --------------->
// mongodb uri 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eeint.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

// <----------------pure backend-------------------> 

async function run() {
  try {

    // <------------mongodb database and collections ------------->
    // create mongodb database and collection here 


    
    // <--------------jwt apis----------------->
    // generate jwt
    app.post('/jwt', async (req, res) => {
      // taking user email to create token
      const email = req.body;
      // create token
      const token = jwt.sign(email, process.env.SECRET_KEY, { expiresIn: '5h' });
      // setting the token to local cookie storage
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',

      }).send({ success: true });
    })

    // logout and clear saved token from browser cookie
    app.get('/logout', async (req, res) => {
      res.clearCookie('token', {
        maxAge: 0,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      }).send({ success: true });
    })



    // <-------------------apis---------------------->






    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir)
app.get('/', (req, res) => {
  res.send('Hello from Project Server....')
})
app.listen(port, () => console.log(`Server running on port ${port}`))
