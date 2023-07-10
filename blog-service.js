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
const { error } = require('console');
const fs = require('fs');
const path = require('path');


let postsData = [];
let categoriesData = [];


function initialize() {
    return new Promise((resolve, reject) => {

        let postsLoaded = false;
        let categoriesLoaded = false;

      fs.readFile(path.join(__dirname, 'data', 'posts.json'), 'utf8', (err, postsContent) => {
        if (err) {
          reject("Unable to read posts file");
          return;
        }
        try {
          postsData = JSON.parse(postsContent);
        } catch (error) {
            reject("Unable to read posts file");
            return;
        }
        if(postsLoaded && categoriesLoaded){
          resolve();
        }
        fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8', (err, categoriesContent) => {
        if (err) {
            reject("Unable to read categories file");
            return;
        }
        try {
            categoriesData = JSON.parse(categoriesContent);
        } catch (error) {
            reject("Unable to read categories file");
            return;
        }
        if(categoriesLoaded && postsLoaded){
            resolve();
         }
        });
      });
    });
}
//get all posts + error handling
function getAllPosts() {
    return new Promise((resolve, reject) => {
      if (postsData.length > 0) {
        resolve(postsData);
      } else {
        reject("No all results returned");
      }
    });
}
function getPublishedPosts() {
    return new Promise((resolve, reject) => {
      const publishedPosts = postsData.filter(post => post.published);
      if (publishedPosts.length > 0) {
        resolve(publishedPosts);
      } else {
        reject("No published return");
      }
    });
}

function getPublishedPostsByCategory(){
  return new Promise ((resolve, reject)=>{
  const publishedPostsByCategory= postsData.filter(post=>post.published && post.category===category);
  if(publishedPostsByCategory.length > 0) {
    resolve(publishedPostsByCategory);
  }else{
    reject("No results returned")
  }  
  });
}

function getPostsByCategory(categoryId) {
  return new Promise(async (resolve, reject) => {
    try {
      const publishedPostsByCategory = postsData.filter(post => post.published && post.category === categoryId);
      if (publishedPostsByCategory.length > 0) {
        resolve(publishedPostsByCategory);
      } else {
        const posts = await getAllPosts();
        const filteredPosts = posts.filter(post => post.published && post.category === categoryId);
        if (filteredPosts.length > 0) {
          resolve(filteredPosts);
        } else {
          reject("No results returned");
        }
      }
    } catch (error) {
      reject("Error retrieving published posts by category: " + error.message);
    }
  });
}

  
  function getPostsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
      const minDate = new Date(minDateStr);
      const postsByMinDate = postsData.filter(post => new Date(post.postDate) >= minDate);
      if (postsByMinDate.length > 0) {
        resolve(postsByMinDate);
      } else {
        reject("No results returned");
      }
    });
  }
  function getPostById(id) {
    return new Promise((resolve, reject) => {
      const post = postsData.find(post => post.id ==id);
      if (post) {
        resolve(post);
      } else {
        reject("No result returned");
      }
    });
  }
//get categories + error handling
function getCategories(){
    return new Promise((resolve,reject)=> {
        if(categoriesData.length>0){
                resolve(categoriesData);
        }else{
            reject("No categories Found")
        }
    });
}

const dateFormat = function(date, format) {
  const options = {
    year: 'numeric',
    month: format.includes('MM') ? '2-digit' : undefined,
    day: format.includes('DD') ? '2-digit' : undefined,
    hour: format.includes('HH') ? '2-digit' : undefined,
    minute: format.includes('mm') ? '2-digit' : undefined,
  };
  const formattedDate = new Date(date).toLocaleString('en-US', options).split('-')[0];
  return formattedDate;
};

function addPost(postData) {
  return new Promise((resolve, reject) => {
    // If postData.published is undefined, set it to false; otherwise, set it to true
    postData.published = postData.published === undefined ? false : true;

    // Set the postDate property of postData to the current date formatted using the dateFormat helper
    const currentDate = new Date();
    postData.postDate = dateFormat(currentDate, 'YYYY-MM-DD');

    // Set the id property of postData to be the length of the "postsData" array plus one
    postData.id = postsData.length + 1;

    // Push the updated postData to the "postsData" array
    postsData.push(postData);

    // Resolve the promise with the updated value
    resolve(postData);
  });
}





    


    
    
module.exports = {
    initialize,
    getAllPosts,
    getPublishedPosts,
    getPostsByCategory,
    getPostsByMinDate,
    getPostById,
    getCategories,
    addPost,
    getPublishedPostsByCategory
    };
          