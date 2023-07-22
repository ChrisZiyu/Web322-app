/*********************************************************************************
* WEB322 – Assignment 2
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Christian Ziyu Ukiike Student ID: 139915219 Date: 19/05/2023
*
* Cyclic Web App URL: https://blushing-coat-worm.cyclic.app
*
* GitHub Repository URL: https://github.com/ChrisZiyu/helloworld
*
********************************************************************************/ 
const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');



const sequelize = new Sequelize('uibrtjcb', 'uibrtjcb', 'RYmjYmAgKWDQr-ypS878Lkrorzm7KESS', {
  host: 'isilo.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});


var Post = sequelize.define('post',{
  body:Sequelize.TEXT,
  title:Sequelize.STRING,
  postDate:Sequelize.DATE,
  featureImage:Sequelize.STRING,
  published: Sequelize.BOOLEAN
});
var Category = sequelize.define('category',{
  category:Sequelize.STRING
});
// Define the relationship between Post and Category
Post.belongsTo(Category, { foreignKey: 'categoryID' });



function initialize() {
  return new Promise((resolve, reject) => {
    // Synchronize the models with the database
    sequelize
      .sync()
      .then(() => {
        console.log('Models synchronized successfully');
        resolve();
      })
      .catch((error) => {
        console.error('Error synchronizing models:', error);
        reject("Unable to sync the database");
      });
  });
}

function getAllPosts() {
  return new Promise((resolve, reject) => {
    Post.findAll()
    .then((posts)=>{
      if(posts && posts.length>0){
        resolve(posts);
      }else{
        reject("No posts found")
      }
    })
    .catch((error)=>{
      console.log("Error fetching all posts",error);
      reject("No results found");
    })
  });
}

function getPublishedPosts() {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where:{
        published:true
      }
    })
    .then((publishedPosts)=>{
      if (publishedPosts && publishedPosts>0){
        resolve(publishedPosts);
      }else{
        reject("No published Posts found");
      }

    })
    .catch((error)=>{
      console.error("Error Fetching Published Posts:",error);
      reject("No results found");
    })
  });
}

function getPublishedPostsByCategory(categoryID) {
    return new Promise((resolve, reject) => {
      Post.findAll({
        where: {
          published: true,
          categoryID: categoryID
        }
      })
      .then((publishedPostsByCategory) => {
        if (publishedPostsByCategory && publishedPostsByCategory.length > 0) {
          resolve(publishedPostsByCategory);
        } else {
          reject("No results returned");
        }
      })
      .catch((error) => {
        console.error('Error fetching published posts by category:', error);
        reject("No results returned");
      });
    });
  }
  


function getPostsByCategory(categoryID) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        categoryID: categoryID
      }
    })
    .then((postsByCategory) => {
      if (postsByCategory && postsByCategory.length > 0) {
        resolve(postsByCategory);
      } else {
        reject("No results returned");
      }
    })
    .catch((error) => {
      console.error('Error fetching posts by category:', error);
      reject("No results returned");
    });
  });
}

function getPostsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    const formattedMinDate = formatDate(new Date(minDateStr)); // Format the minDateStr using the formatDate function
    Post.findAll({
      where: {
        postDate: {
          [Op.gte]: formattedMinDate // Use the formatted date in the filtering
        }
      }
    })
    .then((postsByMinDate) => {
      if (postsByMinDate && postsByMinDate.length > 0) {
        resolve(postsByMinDate);
      } else {
        reject("No results returned");
      }
    })
    .catch((error) => {
      console.error('Error fetching posts by min date:', error);
      reject("No results returned");
    });
  });
}

function getPostById(categoryID) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        categoryID: categoryID
      }
    })
    .then((posts) => {
      if (posts && posts.length > 0) {
        resolve(posts[0]);
      } else {
        reject("No results returned");
      }
    })
    .catch((error) => {
      console.error('Error fetching post by ID:', error);
      reject("No results returned");
    });
  });
}

function getCategories() {
  return new Promise((resolve, reject) => {
    Category.findAll()
    .then((categories)=>{
      if(categories && categories.length>0){
        resolve(categories);
      }else{
        reject("No Categories Found")
      }
    })
    .catch((error)=>{
      console.error("Error fetching Categories:",error);
      reject("No results found");
    })
  });
}

function addPost(postData) {
  return new Promise((resolve, reject) => {
    // Ensure that the published property is set properly
    postData.published = postData.published ? true : false;

    // Replace any blank values ("") with null
    for (const prop in postData) {
      if (postData[prop] === "") {
        postData[prop] = null;
      }
    }

    // Set the postDate to the current date
    postData.postDate = new Date();

    // Create the post in the database using Post.create()
    Post.create(postData)
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.error('Error creating post:', error);
        reject("Unable to create the post");
      });
  });
}

function addCategory(categoryData) {
    return new Promise((resolve, reject) => {
      // Create a copy of the categoryData object
      const dataToSave = { ...categoryData };
  
      // Replace any blank values ("") with null
      for (const prop in dataToSave) {
        if (dataToSave[prop] === "") {
          dataToSave[prop] = null;
        }
      }
  
      // Create the category in the database using Category.create()
      Category.create(dataToSave)
        .then((category) => {
          // Resolve with the created category object
          resolve(category);
        })
        .catch((error) => {
          console.error('Error creating category:', error);
          reject("Unable to create the category");
        });
    });
  }
  
  
  
  function deleteCategoryById(id) {
    return new Promise((resolve, reject) => {
      // Delete the category from the database using Category.destroy()
      Category.destroy({
        where: {
          id: id
        }
      })
      .then((rowsDeleted) => {
        // The destroy method returns the number of rows deleted, so we can check if any rows were deleted
        if (rowsDeleted > 0) {
          resolve();
        } else {
          // If no rows were deleted, the category with the given ID does not exist or has already been deleted
          reject("Category not found");
        }
      })
      .catch((error) => {
        console.error('Error deleting category:', error);
        reject("Unable to delete the category");
      });
    });
  }
  
  function deletePostById(id) {
    return new Promise((resolve, reject) => {
      // Delete the post from the database using Post.destroy()
      Post.destroy({
        where: {
          id: id
        }
      })
      .then((rowsDeleted) => {
        // The destroy method returns the number of rows deleted, so we can check if any rows were deleted
        if (rowsDeleted > 0) {
          resolve();
        } else {
          // If no rows were deleted, the post with the given ID does not exist or has already been deleted
          reject("Post not found");
        }
      })
      .catch((error) => {
        console.error('Error deleting post:', error);
        reject("Unable to delete the post");
      });
    });
  }
  

const formatDate = function (dateObj) {
  let year = dateObj.getFullYear();
  let month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  let day = dateObj.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

module.exports = {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getPostsByCategory,
  getPostsByMinDate,
  getPostById,
  getCategories,
  addPost,
  getPublishedPostsByCategory,
  formatDate,
  addCategory,
  deleteCategoryById,
  deletePostById
};
