/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
const express = require('express');


module.exports = function (app = express()) {
  
  var dbconn;

  const CONNECTION_STRING = process.env.MONGO_URI; 
  const client = MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
  client.then(mongoConn => {
    dbconn = mongoConn.db('issue-tracker');

    
    var issueTracker;
    
    app.route('/api/issues/:project')
    
    .get(function (req, res){
      var project = req.params.project;
      // console.log('Get Request for project: ', project ? project : 'All Projects');
      issueTracker = dbconn.collection(project);
      issueTracker.find(( req.body ? { ...req.body } : {} ))
      .toArray()
      .then((docs) => {
        if(docs) console.log(docs)
        // res.json('under construction');
        if(!res.headersSent) res.json(docs);
      }, console.error);
      // setTimeout(() => {
        //   if(!res.headersSent) res.redirect('/', 500);
        // }, 10000);
      })
      
      .post(function (req, res){
        var project = req.params.project;
        // console.log('Post Request body: ', req.body, ', Project: ', project);
        // const { issue_title, issue_text, created_by } = req.body;
        issueTracker = dbconn.collection(project);
        if(!req.body.issue_title || !req.body.issue_text || !req.body.created_by) return res.json('missing inputs');//.json('Required fields not filled')
        else {
          issueTracker.insertOne({
            ...req.body,
            created_on: new Date(),
            updated_on: new Date(),
            open: true
          } , (err, doc) => {
            if(err) { res.status(502); return console.error(err); };
            // console.log(doc.ops[0]);
            if(!res.headersSent) res.json(doc.ops[0])
          })
        }
      })
      
      .put(function (req, res){
        var project = req.params.project;
        // console.log('Put Request body: ', req.body, ', Project: ', project);
        if(!req.body) return res.json('no updated field sent');
        issueTracker = dbconn.req.dbConnection.collection(project);
        // const contentToUpdate = req.body;
        const {issue_title, issue_text, created_by, assigned_to, status_text} = req.body;
        issueTracker.findOne({ _id: new ObjectId(req.body._id) }, (err, result) => {
          if(err) return console.error(err);
          // console.log('found doc: ', result);
          if(!result) return res.json(`could not update ${req.body._id}`);
          if(issue_title) result.issue_title = issue_title;
          if(issue_text) result.issue_text = issue_text;
          if(created_by) result.created_by = created_by;
          if(assigned_to) result.assigned_to = assigned_to;
          if(status_text) result.status_text = status_text;
          result.updated_on = new Date(); 
          result.open = eval(req.body.open) === undefined ? true : false;
          delete result._id;
          issueTracker.updateOne({ _id: new ObjectId(req.body._id) }, { $set: {...result} }, (err, doc) => {
            if(err) return console.error(err);
            // console.log('updated doc: ', doc);
            // console.log('updated doc result: ', doc.result);
            if(!res.headersSent && doc.result.nModified) res.json('sucessfully updated');
          })
          // if(!res.headersSent) res.json('under construction');
          setTimeout(() => {if(!res.headersSent) res.json('something went wrong');}, 5000);
        });
      })
      
      .delete(function (req, res){
        var project = req.params.project;
        // console.log('Delete Request body: ', req.body, ', Project: ', project);
        if(!req.body._id) return res.json('_id error')
        issueTracker = dbconn.collection(project);
        issueTracker.findOneAndDelete({ _id: new ObjectId(req.body._id) }, (err, result) => {
          if(err) { res.status(502); return console.error(err); };
          // console.log(result);
          // res.json('under construction');
          if(!res.headersSent && !result.value) res.json(`could not delete ${req.body._id}`);
          if(!res.headersSent && result.ok) res.json(`deleted ${req.body._id}`);
        })
      });
      
    }, reason => {
      // res.status(500).json('Database Connection Error');
      throw new Error(`Database Connection Error: ${reason}`);
    });
};
