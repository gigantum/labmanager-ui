'use strict';
//#!/usr/bin/env babel-node --optional es7.asyncFunctions
import path from 'path'
import fs from 'fs'
import jsdom from 'jsdom-global'
import fetch from 'node-fetch'
import jest from 'jest'

jsdom()
// Do this as the first thing so that any code reading it knows the right env.]

global.test = function(){}
global.describe = function(){}
global.it = function(){}

window.matchMedia = window.matchMedia || function() {
    return {
        matches : false,
        addListener : function() {},
        removeListener: function() {}
    };
};

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';


let relayFilePostfixes = ["Query", "Pagination"]
const read = (dir) =>
  fs.readdirSync(dir)
    .reduce((files, file) => fs.statSync(path.join(dir, file)).isDirectory() ?
        files.concat(read(path.join(dir, file))) :
        files.concat(path.join(dir, file)),
      [])


let sourcsJsFiles = read('src/js')

let genteratedFiles = sourcsJsFiles.filter((dirname) => {
  return((dirname.indexOf('__generated__') > -1) && (dirname.indexOf('_', (dirname.indexOf('__generated__') + 14)) < 0) && (dirname.indexOf('/mutations/') < 0))
})

let relayQueries = genteratedFiles.filter((route) => {
  let testFile = __dirname + '/../' + route.replace('src/js', '__tests__').replace('/__generated__/', '/').replace('.graphql.', '.test.').replace('Query', '').replace('Pagination', '')

  const exists = fs.existsSync(testFile)
  if(!exists){
    console.log(`create test ${testFile}`)
  }
  return exists
}).map((route) => {
  let testFile = __dirname + '/../' + route.replace('src/js', '__tests__').replace('/__generated__/', '/').replace('.graphql.', '.test.')

  relayFilePostfixes.forEach(function(postFix){
      if(testFile.indexOf(postFix) > -1){
        testFile = testFile.replace(postFix, '')
      }
  })
  console.log(`Fetching variables for ${route}...`)
  return {dirname: route, relay: require(__dirname + '/../' + route), variables:require(testFile).default, testFile: testFile}
})

relayQueries.forEach((queryData) => {

  let variables = queryData.variables

  fetch('http://localhost:10001/labbook/', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: queryData.relay.text,
      variables: variables
    })
  }).then(function(response) {

      response.json().then(function(data){
          if(data.errors){
            console.log(`Error: ${data.errors[0].message}`)
          }
          let relayDataField = path.dirname(queryData.testFile) + '/__relaydata__/' + path.basename(queryData.testFile).replace('.test.js', '.json')

          function ensureDirectoryExistence(filePath) {
              var dirname = path.dirname(filePath);
              if (fs.existsSync(dirname)) {
                return true;
              }
              ensureDirectoryExistence(dirname);
              fs.mkdirSync(dirname);
          }


          ensureDirectoryExistence(relayDataField)

          console.log('gets here')
          fs.exists(relayDataField, function(exists){
            console.log(exists)
            if(exists){
              fs.open(relayDataField, 'w', (err, fd) => {
                if (err) throw err;

                fs.write(fd, JSON.stringify(data), 0, JSON.stringify(data).length, null, function(err) {
                    if (err) throw 'error writing file: ' + err;
                    fs.close(fd, function() {
                        console.log(`${fd} updated`);
                    })
                });
              });
            }else{
              fs.writeFile(relayDataField, JSON.stringify(data), { flag: 'wx' }, (err)=>{
                console.log(err)
              })
            }
          })


      })
    }).catch(function(error) {
       console.log('request failed', error)
    })

})
