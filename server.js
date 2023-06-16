/*********************************************************************************
* WEB322 – Assignment 2
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Christian Ziyu Ukiike Student ID: 139915219 Date: 19/05/2023
*
* Cyclic Web App URL: https://blushing-coat-worm.cyclic.app/about
*
* GitHub Repository URL: https://github.com/ChrisZiyu/Web322-app
********************************************************************************/ 


var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
const path = require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
var app = express();

cloudinary.config({ 
  cloud_name: 'dwup3hili', 
  api_key: '777482753413527', 
  api_secret: '4rrEmjOUpae1UoGa4n4Jfbw6y5o' 
});

const blogService = require("./blog-service");

blogService.initialize()
  .then(() => {
    // Initialization successful, start the server
    app.listen(HTTP_PORT, () => {
      console.log("Express http server listening on port", HTTP_PORT);
    });

    // Calls all posts
    blogService.getAllPosts()
      .then(posts => {
        console.log("All Posts:", posts);
      })
      .catch(error => {
        console.log("Error:", error);
      });

    // Calls published posts
    blogService.getPublishedPosts()
      .then(publishedPosts => {
        console.log("Published Posts:", publishedPosts);
      })
      .catch(error => {
        console.log("Error:", error);
      });

    // Calls categories
    blogService.getCategories()
      .then(categories => {
        console.log("Categories:", categories);
      })
      .catch(error => {
        console.log("Error:", error);
      });
  })
  .catch(error => {
    // Initialization failed, output the error to the console
    console.error("Initialization Error:", error);
  });




// Serve static files from the 'public' folder
app.use(express.static('public'));

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    res.redirect("/about");
});

// Return the about.html file from the views folder
app.get("/about", (req, res) => {
    res.sendFile(__dirname + "/views/about.html");
});
// Route for returning the addPost.html file
app.get("/posts/add", (req, res) => {
  res.sendFile(path.join(__dirname, "views/addPost.html"));
});

//multer for posts add only
const upload = multer(); //remember to move if more posts coming for next assignments

app.post('/posts/add', upload.single('featureImage'), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function uploadImage(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    uploadImage(req)
      .then((uploaded) => {
        processPost(uploaded.url);
      })
      .catch((error) => {
        console.error('Error uploading image:', error);
        // Handle the error and redirect to an error page or display an error message
        res.redirect('/error');
      });
  } else {
    processPost('');
  }

  function processPost(imageUrl) {
    var category = req.body.category;
    req.body.featureImage = imageUrl;
    // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
    var published = req.body.published === undefined ? false : true;
    // process the req.body and add it as a new Blog Post
    const newBlogPost={
      title: req.body.title,
      body:req.body.content,
      postDate: new Date().toISOString(),
      category:category,
      featureImage: imageUrl,
      published: published,
      
    };
    blogService
      .addPost(newBlogPost)
      .then((addedPost) => {
        console.log('New blog post added:', addedPost);
        res.redirect('/posts');
      })
      .catch((error) => {
        console.log('Error adding blog post:', error);
        res.redirect('/posts');
      });

    // // Redirect to /posts or wherever you want to redirect after adding the post
    // res.redirect('/posts');
  }
});




// Route for returning published posts
app.get("/blog", (req, res) => {
  blogService.getPublishedPosts()
    .then(publishedPosts => {
      res.send(JSON.stringify(publishedPosts));
    })
    .catch(error => {
      res.status(500).send("Error: " + error);
    });
});
  
app.get("/posts/:id", (req, res) => {
  const postId = parseInt(req.params.id);

  blogService
    .getPostById(postId)
    .then(post => {
      res.send(JSON.stringify(post));
    })
    .catch(error => {
      res.status(500).send("Error: " + error);
    });
});
// Route for returning all posts
// Updated /posts route
app.get("/posts", (req, res) => {
  const category = req.query.category;
  const minDate = req.query.minDate;

  if (category) {
    blogService
      .getPostsByCategory(category)
      .then(filteredPosts => {
        res.send(JSON.stringify(filteredPosts));
      })
      .catch(error => {
        res.status(500).send("Error: " + error);
      });
  } else if (minDate) {
    blogService
      .getPostsByMinDate(minDate)
      .then(filteredPosts => {
        res.send(JSON.stringify(filteredPosts));
      })
      .catch(error => {
        res.status(500).send("Error: " + error);
      });
  } else {
    blogService
      .getAllPosts()
      .then(posts => {
        res.send(JSON.stringify(posts));
      })
      .catch(error => {
        res.status(500).send("Error: " + error);
      });
  }
});




// Route for returning all categories
app.get("/categories", (req, res) => {
  blogService.getCategories()
    .then(Categories => {
      res.send(JSON.stringify(Categories));
    })
    .catch(error => {
      res.status(404).send("Error: " + error);
    });
});
  

// 404 error- page not found
  app.use((req, res) => {
    res.status(404).send("404 - Page not found");
    });
  
  // setup http server to listen on HTTP_PORT
  app.listen(HTTP_PORT,() => {
      console.log("Express http server listening on port",HTTP_PORT);
    });
  
