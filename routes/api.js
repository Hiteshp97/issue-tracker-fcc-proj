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

const CONNECTION_STRING = process.env.MONGO_URI; 
const client = MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });

var dbconn
var issueTracker;

module.exports = function (app = express()) {
  
  app.route('/api/issues/:project')
    
    .get(async function (req, res){
      var project = req.params.project;
      // console.log('Get Request for project: ', project ? project : 'All Projects');
      try {
        dbconn = await client;
        issueTracker = dbconn.db('issue-tracker').collection(project);
        // console.log('req.query: ', req.query);
        var reqQuery = {...req.query};
        const {open, created_on, updated_on} = reqQuery;
        try {
          if(open) reqQuery.open = eval(open);
          if(updated_on) {
            reqQuery.updated_on = new Date(updated_on);
            if(reqQuery.updated_on  == 'Invalid Date') 
              return res.json('invalid `updated_on` value');
          }
          if(created_on) {
            reqQuery.created_on = new Date(created_on);
            if(reqQuery.created_on  == 'Invalid Date') 
              return res.json('invalid `created_on` value');
          }
        } catch(e){
          console.log('Invalid value for `open` ', e);
          if(!res.headersSent) return res.json('invalid query parameters');
        }
        console.log(req.body, req.query, req.params);
          issueTracker.find(( reqQuery ? { ...reqQuery } : {} ))
            .toArray()
            .then((docs) => {
              if(docs) console.log(
                `Total docs in project: "${project}"(DB) are ${docs.length}` 
                + (Object.entries(req.query).length 
                  ? `; for query parameters: ${JSON.stringify(req.query)}` : '')
                );
              // res.json('under construction');
              if(!res.headersSent) res.json(docs);
            }, console.error);
          setTimeout(() => {
            if(!res.headersSent) res.redirect('/', 500);
          }, 10000);
        } catch(e) {
          console.error(e);
          setTimeout(() => {
            if(!res.headersSent) res.status(500).json('Unable to connect to database');
          }, 15000);
        }
    })
    
    .post(async function (req, res){
      var project = req.params.project;
      // console.log('Post Request body: ', req.body, ', Project: ', project);
      // const { issue_title, issue_text, created_by } = req.body;
      try {
        dbconn = await client;
        issueTracker = dbconn.db('issue-tracker').collection(project);
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
          setTimeout(() => {
            if(!res.headersSent) res.redirect('/', 500);
          }, 15000);
        }
      } catch(e) {
          console.error(e);
          setTimeout(() => {
          if(!res.headersSent) res.status(500).json('Unable to connect to database');
        }, 20000);
      }
    })
    
    .put(async function (req, res){
      var project = req.params.project;
      // console.log('Put Request body: ', req.body, ', Project: ', project);
      if(JSON.stringify(req.body) === '{}') return res.status(502).json('no updated field sent');
      try {
        dbconn = await client;
        issueTracker = dbconn.db('issue-tracker').collection(project);
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
              if(!res.headersSent && doc.result.nModified) res.json('successfully updated');
            })
            // if(!res.headersSent) res.json('under construction');
            setTimeout(() => {if(!res.headersSent) res.json('something went wrong');}, 5000);
          });
          setTimeout(() => {
            if(!res.headersSent) res.redirect('/', 500);
          }, 15000);
      } catch(e) {
        console.error(e);
        setTimeout(() => {
          if(!res.headersSent) res.status(500).json('Unable to connect to database');
        }, 20000);
      }
    })
    
    .delete(async function (req, res){
      var project = req.params.project;
      // console.log('Delete Request body: ', req.body, ', Project: ', project);
      if(!req.body._id) return res.json('_id error');
      try {
        dbconn = await client;
        issueTracker = dbconn.db('issue-tracker').collection(project);
        issueTracker.findOneAndDelete({ _id: new ObjectId(req.body._id) }, (err, result) => {
          if(err) { res.status(502); return console.error(err); };
          // console.log(result);
          // res.json('under construction');
          if(!res.headersSent && !result.value) res.json(`could not delete ${req.body._id}`);
          if(!res.headersSent && result.ok) res.json(`deleted ${req.body._id}`);
        })
        setTimeout(() => {
          if(!res.headersSent) res.redirect('/', 500);
        }, 15000);
      } catch(e) {
        console.error(e);
        setTimeout(() => {
          if(!res.headersSent) res.status(500).json('Unable to connect to database');
        }, 20000);
      }
    });
    
};
