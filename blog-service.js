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
* GitHub Repository URL: https://github.com/ChrisZiyu/helloworld
*
********************************************************************************/ 
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
function getPostsByCategory(category) {
    return new Promise((resolve, reject) => {
      const postsWithCategory = postsData.filter(post => post.category === parseInt(category));
      const postsContent = postsData.filter(post => post.category === category);
      if (postsContent || postsWithCategory.length > 0) {
        const mergedPosts=[...postsContent, ...postsWithCategory]
        resolve(mergedPosts);
      } else {
        reject("No posts found with the specified category");
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
      const post = postsData.find(post => post.id === id);
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
            reject("aaa")
        }
    });
}

    function addPost(postData) {
        return new Promise((resolve, reject) => {
          // If postData.published is undefined, set it to false; otherwise, set it to true
          postData.published = postData.published === undefined ? false : true;
      
          // Set the id property of postData to be the length of the "postsData" array plus one
          postData.id = postsData.length + 1;
      
          // Push the updated postData to the "postsData" array
          postsData.push(postData);
      
          // Resolve the promise with the updated value
          resolve(postData);
        });
    }

    
    // Route functions
     function allPosts() {
       return JSON.stringify(postsData);
    }
    
    function allCategories() {
        return JSON.stringify(categoriesData);
    }

    
    
module.exports = {
    initialize,
    getAllPosts,
    getPublishedPosts,
    getPostsByCategory,
    getPostsByMinDate,
    getPostById,
    getCategories,
    allPosts,
    allCategories,
    addPost,
    };
          