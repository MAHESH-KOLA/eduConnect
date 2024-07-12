const express = require("express");
const cors = require('cors');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const multer = require('multer');

const jwt = require('jsonwebtoken');
const cookieparser = require('cookie-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

const app = express();


// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieparser());


const salt = bcrypt.genSaltSync(10);
const secret = 'tfgxsnsui56b3dbc839udjndb389odjmcn';

// Middleware for handling file uploads (using multer)
// const uploadmiddleware = multer({ dest: 'uploads/' });
const upload = multer({ dest: 'uploads/' }); 
app.use('/uploads',express.static(__dirname + '/uploads/'))



    

mongoose.connect('mongodb://127.0.0.1:27017/eduApp')
.then(()=>{
  console.log("database connected successully");
})
.catch((err)=>{
  console.log("error in connecting to the database: ", err);
})


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'educonnect04u@gmail.com',
    pass: 'nsbi jwsr sasa okic',
  },
  
});       

transporter.on('token', token => {
  console.log('A new access token was generated');
  console.log('User: %s', token.user);
  console.log('Access Token: %s', token.accessToken);
  console.log('Expires: %s', new Date(token.expires));
});

const otp = randomstring.generate({
  length: 6,
  charset: 'numeric',
});

// Route to send OTP via email
app.post('/sendotp', (req, res) => {
  const { email } = req.body;
  

  const mailOptions = {
    from: 'educonnect04u@gmail.com',
    to: email,
    subject: 'Educonnect',
    text: otp,
  };
  console.log(email);
  console.log(mailOptions)
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("hii");
      console.error('Error sending OTP:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    } else {
      console.log('OTP sent:', info.response);
      res.status(200).json({ message: 'OTP sent successfully' });
    }
  });
});


app.post('/verifyotp', (req, res) => {
  const { email, otptext } = req.body;
  // You need to implement your own logic to verify the OTP, such as comparing it with the OTP stored in the database.
  // For this example, let's assume the OTP is valid if it matches '123456'.
  console.log(otp)
  console.log(otptext);
  if (otptext === otp) {
    res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ error: 'Invalid OTP' });
  }
});




app.post('/register', async (req, res) => {
  const { firstname, email, password } = req.body;

  // Check if the password meets the minimum length requirement
  if (password.length < 8) {
      return res.status(400).json({ error: 'Password should be minimum of 8 characters' });
  }

  try {
      // Check if the firstname already exists in the database
      const existingUser = await User.findOne({ firstname });
      if (existingUser) {
          return res.status(400).json({ error: 'Firstname must be unique' });
      }

      // If firstname is unique, create the new user
      const userdoc = await User.create({
          firstname,
          email,
          password: bcrypt.hashSync(password, salt)
      });

      console.log(userdoc);

      console.log("User registered successfully");
      console.log(password);
      res.json(userdoc);
  } catch (e) {
      console.error("Error registering user:", e);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.post('/login', async (req,res)  => {
    const {email,password} = req.body;
   console.log(email);
   console.log(password)
    try{
        const userdoc = await User.findOne({email:email});
        
      
        if(!userdoc){
            return res.status(400).json("User Not Found");
        }
        const ok = bcrypt.compareSync(password,userdoc.password);
        console.log(ok);
        if(ok){
            jwt.sign({email, id : userdoc._id} , secret , {} , (err, token) => {
                    if(err) throw err;
                    res.cookie('token', token).json({
                        id:userdoc.id,
                        firstname:userdoc.firstname,
                        email,
                    });
                });
         }else{
         res.status(400).json("wrong credentials");
        }
    }catch(e){
        res.status(500).json(e.message);
    }
})


app.get('/profile', async (req, res) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json("Token not provided");
        }

        const info = await jwt.verify(token, secret);

        if (!info || !info.id) {
            return res.status(401).json("Invalid token");
        }

        const user = await User.findById(info.id)

        if (!user) {
            return res.status(404).json("User not found");
        }

        console.log(info);
        console.log(user);

        res.json(
            
           user
        );

    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).json("Internal Server Error");
    }
});


app.post('/logout' , (req,res) => {
    res.cookie('token','').json('ok');
   })


// app.post('/upload',(req,res) => {
//     console.log(req.body);
    
//     res.status(200).json(req.body);

// })




// Route for handling the POST request from the form
// app.post('/upload', upload.single('file'), async (req, res) => {
//     const imagePath = req.file.path;
    
//     const {token} = req.cookies;
//     jwt.verify(token,secret, {} , async (err,info) => {
//         if(err) throw err;
//         const { title, tags, description, content, link, sourcecode } = req.body;
//         const postdoc =  await Post.create({
//              title,
//              tags,
//              description,
//              content,
//              link,
//              sourcecode,
//              cover:imagePath,
//              author:info.id
//          })
//         // res.json(info);
//         res.json(postdoc);
//     })
 
    

   
   
// });

// Set your destination folder

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // const imagePath = req.file.path;

    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length-1];
    const newpath = path+'.'+ext;
    fs.renameSync(path, newpath);

    const { token } = req.cookies;
        if (!token) {
        return res.status(401).json({ error: 'Token not provided' });
        }

    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) throw err;

      const { title, tags, description, content, link, sourcecode } = req.body;
      console.log(req.body);
      // Save imagePath and other data to MongoDB using Mongoose
      const newPost = new Post({
        title,
        tags,
        description,
        content,
        link,
        sourcecode,
        cover: newpath,
        upvotes: 0,
        author: info.id, // Assuming you have a field 'author' for the user who uploaded the post
      });
      // console.log(newPost);
      const savedPost = await newPost.save();

      // Respond with the saved post or any other desired response
      res.json({ success: true, post: savedPost });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/post', async (req,res) => {
    const posts = await Post.find().populate('author',  ['firstname'])
    .sort({createdAt:-1}) 
    .limit(20);
     res.json(posts);
 })

 app.get('/post/:id' , async (req,res ) => {
    const {id} = req.params;
    const postdoc = await Post.findById(id).populate('author',  ['firstname']) 
    // console.log(postdoc);  
    res.json(postdoc);
})


app.put('/post/:id/upvote', async (req, res) => {
    const id = req.params.id;
    
  
    // Find the post by ID
    
  
   
      // Update the upvotes count
      const postdoc = await Post.findById(id);
      if (!(postdoc)) {
        return res.status(403).json({ error: 'Unauthorized user' });
    }
    // console.log(postdoc);
    await postdoc.updateOne({
       
       upvotes:postdoc.upvotes+1,
    });
      // Respond with the updated post
    res.json(postdoc);
    
      // Post not found
    
  });
  
  app.put('/post', upload.single('file'), async (req, res) => {
    try {
      // File Upload Handling
      // console.log(req.file);
      // const { originalname, path } = req.file;
      // const parts = originalname.split('.');
      // const ext = parts[parts.length - 1];
      // const newpath = path + '.' + ext;
      // fs.renameSync(path, newpath);
      // console.log(newpath);
      // Token Verification
      const { token } = req.cookies;
      if (!token) {
        return res.status(401).json({ error: 'Token not provided' });
      }
  
      jwt.verify(token, secret, {}, async (err, info) => {
        if (err) {
          throw err;
        }
  
        // Post Authorization 
        const { id, title, tags, description, content, link, sourcecode} = req.body;
        const postdoc = await Post.findById(id);
        const isAuthor = JSON.stringify(postdoc.author) === JSON.stringify(info.id);
        if (!isAuthor) {
          return res.status(403).json({ error: 'Unauthorized user' });
        }
  
        // Update Post
        await postdoc.updateOne({
          title,
          tags,
          description,
          content,
          link,
          sourcecode,
          // cover: newpath,
          upvotes: postdoc.upvotes,
          author: info.id,
        });
  
        res.json(postdoc);
    // res.json();
      });
    } catch (error) {
      console.error('Error processing update request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
    // Delete route
app.delete('/post/:postId', async (req, res) => {
      const { postId } = req.params;
      // console.log(postId);
      try {
        // Check if the provided ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(postId)) {
          return res.status(400).json({ error: 'Invalid post ID' });
        }

        // Find and delete the post
        const deletedPost = await Post.findByIdAndDelete(postId);

        // Check if the post was found and deleted
        if (!deletedPost) {
          return res.status(404).json({ error: 'Post not found' });
        }

        res.json({ message: 'Post deleted successfully' });
      } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });    


    app.post('/yourprofile', async (req, res) => {
      try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json("Token not provided");
        }
        const info = await jwt.verify(token, secret);
        // console.log(info.id);
        try {
          // Assuming the Post model has an 'author' field
          const postdoc = await Post.find({ author: info.id });
          res.json({ posts: postdoc });
        } catch (error) {
          console.error('Error fetching posts:', error);
          res.status(500).json({ error: 'Internal Server Error' });     
        }   
     
        // res.send(postdoc);
    } catch (err) {
        res.status(401).json("Invalid token");
    }
    });



// Route handler for saving comments

// Route handler for saving comments
app.post('/post/:id/comment', async (req, res) => {
  const { id } = req.params; // Extract post ID from URL
  const { commentedBy, text } = req.body; // Extract commentedBy and text from request body
  
  try {
      // Find the post by ID
      const post = await Post.findById(id);
      if (!post) {
          return res.status(404).json({ error: 'Post not found' });
      }
      
      // Create a new comment object with timestamps
      const newComment = {
          commentedBy,
          text,
          createdAt: new Date() // Set the createdAt field to the current date and time
      };
  
      // Add the new comment to the post's comments array
      post.comments.push(newComment);
      
      // Save the updated post
      await post.save();
      
      res.status(201).json({ message: 'Comment added successfully', post });
  } catch (error) {
      console.error('Error saving comment:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
  
});



// Route handler for getting all comments of a post
app.get('/post/:id/comments', async (req, res) => {
  const { id } = req.params; // Extract post ID from URL

  try {
    // Find the post by ID
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Send all comments associated with the post
    console.log(post.comments);
    res.status(200).json({ comments: post.comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
    

app.listen(4000);