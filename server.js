/*********************************************************************************
* WEB322 – Assignment 2
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Christian Ziyu Ukiike Student ID: 139915219 Date: 7/9/2023
*
* Cyclic Web App URL: https://blushing-coat-worm.cyclic.app
*
* GitHub Repository URL: https://github.com/ChrisZiyu/Web322-app
********************************************************************************/ 


var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
const path = require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');
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


  app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
      navLink: function(url, options) {
        return '<li' +
          ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
          '><a href="' + url + '">' + options.fn(this) + '</a></li>';
      },
      equal: function(lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      safeHTML: function(context) {
        return stripJs(context);
      },

    }
  }));
  
  app.set('view engine', '.hbs');
  
  app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
  });
  

// Serve static files from the 'public' folder
app.use(express.static('public'));

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    res.redirect("/blog");
});

// Render about.hbs view template, 2nd argument adds the hbs to the main.hbs
app.get("/about", (req, res) => {
    res.render("about",{ layout: "main" });
});
// Render addPost.hbs View template, 2nd argument adds the hbs to the main.hbs
app.get("/posts/add", (req, res) => {
  res.render("addPost", {layout: "main"});
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
  }
});


// Route for returning published posts by category
app.get('/blog', async (req, res, next) => {
  const categoryId = (req.query.category);
  const postId = (req.query.id);
  
  // if (postId) {
  //   try {
  //     const posts = await blogService.getPublishedPosts();
  //     console.log('post:', post); // Add this line to check the value of the post
  //     posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

  //     const post = await blogService.getPostById(postId);
  //     const categories = await blogService.getCategories();
  //     res.render('blog', { data: { posts: [], posts, categories } });
  //   } catch (error) {
  //     console.log('Error:', error); // Add this line to check if any error occurs
  //     res.render('blog', { data: { message: 'No resultaaaas' } });
  //   }
  // }
  if (categoryId) {
    // Redirect to the corresponding /blog/:id route
    res.redirect(`/blog/${categoryId}`);
  } else {
    // Your existing code for handling the /blog route
    let viewData = {};

    try {
      let posts = [];
      let categories = [];
  
      if (req.query.category) {
        const category = req.query.category;
        posts = await blogService.getPublishedPostsByCategory(category);
        posts.sort((a, b) => new Date(a.postDate) - new Date(b.postDate));
      } else {
        posts = await blogService.getPublishedPosts();
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
      }
      // console.log("Posts:", posts);
      const post = posts[0];
      // console.log("Retrieving categories...");
      categories = await blogService.getCategories();
      // console.log("Categories:", categories);
  
      viewData.posts = posts;
      viewData.post = post;
      viewData.categories = categories;
    } catch (error) {
      viewData.message = "No results";
    }
  
    res.render("blog", { data: viewData});
  }
});


app.get('/blog/:id', async (req, res) => {
  const categoryId = parseInt(req.params.id);
 
    try {
      const posts = await blogService.getPostsByCategory(categoryId);
      posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

      const post = posts.length > 0 ? posts[0] : null;

      const categories = await blogService.getCategories();
      res.render('blog', { data: { posts, post, categories } });
    } catch (error) {
      console.log('Error:', error);
      res.render('blog', { data: { message: 'No resuaaslts' } });
    }
  
});

app.get("/posts/:id", (req, res) => {
  const postId = parseInt(req.params.id);

  blogService
    .getPostById(postId)
    .then(post => {
      res.json(post)
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
        res.render("posts",{posts:filteredPosts});
      })
      .catch(error => {
        res.render("posts",{message: "no results"});
      });
  } else if (minDate) {
    blogService
      .getPostsByMinDate(minDate)
      .then(filteredPosts => {
        res.render("posts",{posts: filteredPosts});
      })
      .catch(error => {
        res.render("posts",{message: "no results"});
      });
  }else{
    blogService.getAllPosts()
    .then(posts => {
      res.render("posts", { posts: posts });
    })
    .catch(error => {
      res.render("posts", { message: "No results" });
    });
  }
});




// Route for returning all categories
app.get("/categories", (req, res) => {
  blogService.getCategories()
    .then(Categories => {
      res.render("categories",{categories:Categories});
    })
    .catch(error => {
      res.render("categories",{message:"no results"});
    });
});
  

// 404 error - page not found
app.use((req, res) => {
  res.status(404).render("404", { data: { message: "Return to blog", path: req.path } });
});

  // setup http server to listen on HTTP_PORT
  app.listen(HTTP_PORT,() => {
      console.log("Express http server listening on port",HTTP_PORT);
    });
  
