/*********************************************************************************
* WEB322 – Assignment 1
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Christian Ziyu Ukiike Student ID: 139915219 Date: 19/05/2023
*
* Cyclic Web App URL: 
*
* GitHub Repository URL: https://github.com/ChrisZiyu/Web322-app
********************************************************************************/ 


var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();

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
  
// Route for returning all posts
app.get("/posts", (req, res) => {
    blogService.getAllPosts()
      .then(posts => {
        res.send(JSON.stringify(posts));
      })
      .catch(error => {
        res.status(500).send("Error: " + error);
      });
  });

// Route for returning all categories
app.get("/categories", (req, res) => {
  blogService.getCategories()
    .then(Categories => {
      res.send(JSON.stringify(Categories));
    })
    .catch(error => {
      res.status(500).send("Error: " + error);
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
  
