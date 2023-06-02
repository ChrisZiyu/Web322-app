/*********************************************************************************
* WEB322 – Assignment 1
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Christian Ziyu Ukiike Student ID: 139915219 Date: 19/05/2023
*
* Cyclic Web App URL: https://github.com/ChrisZiyu/Web322-app
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
function getAllPosts(){
    return new Promise((resolve,reject)=>{
        if(postsData.length>0){
            resolve(postsData);
        } else {
                reject("No results returned")
            }
        });
    }
    //get all published posts + error handling
    function getPublishedPosts() {
        return new Promise((resolve, reject) => {
            const publishedPosts = postsData.filter(post => post.published);
            if (publishedPosts.length > 0) {
                resolve(publishedPosts);
            } else {
                reject("No results returned");
            }
        });
    }
    //get categories + error handling
    function getCategories(){
        return new Promise((resolve,reject)=> {
            if(categoriesData.length>0){
                resolve(categoriesData);
            }else{
                reject("No results returned")
            }
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
    getCategories,
    allPosts,
    allCategories
    };
          