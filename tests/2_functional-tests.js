/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var ObjectId = require('mongodb').ObjectId;

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
        const sendJson = {
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        };
        chai.request(server)
          .post('/api/issues/test')
          .send(sendJson)
          .end(function(err, res){
            assert.equal(res.status, 200, 'Status code must be 200');
            assert.isObject(res.body, 'Response body must be an object');
            assert.equal(res.body.issue_title, sendJson.issue_title, 'Request and response "issue_title" must match');
            assert.equal(res.body.issue_text, sendJson.issue_text, 'Request and response "issue_text" must match');
            assert.equal(res.body.created_by, sendJson.created_by, 'Request and response "created_by" must match');
            assert.equal(res.body.assigned_to, sendJson.assigned_to, 'Request and response "assigned_to" must match');
            assert.equal(res.body.status_text, sendJson.status_text, 'Request and response "status_text" must match');
            assert.isString(res.body.created_on, 'Response "created_on" must be a "string" type');
            // assert.equal(res.body.created_on.length, 29)
            assert.isString(res.body.updated_on, 'Response "updated_on" must be a "string: type');
            // assert.equal(res.body.updated_on.length, 29)
            assert.isBoolean(res.body.open, 'Response "open" must be a "boolean" type');
            // assert.isTrue(res.body.open, true)
            assert.equal(res.body._id.length, 24, 'Response "_id" string length msut be "24" characters');
            //fill me in too!
            
            done();
          });
      });
      
      test('Required fields filled in', function(done) {
        const sendJson = {
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in'
        };
        chai.request(server)
          .post('/api/issues/test')
          .send(sendJson)
          .end(function(err, res){
            const { issue_title, issue_text, created_by, assigned_to, status_text } = res.body;
            assert.equal(res.status, 200, 'Status code must be 200');
            assert.equal(issue_title, sendJson.issue_title)
            assert.equal(issue_text, sendJson.issue_text)
            assert.equal(created_by, sendJson.created_by)
            assert.isUndefined(assigned_to)
            assert.isUndefined(status_text)
            done();
          });
      });
      
      test('Missing required fields', function(done) {
        const sendJson = {
          issue_title: 'Title',
          issue_text: 'text',
        };
        chai.request(server)
          .post('/api/issues/test')
          .send(sendJson)
          .end(function(err, res){
            assert.equal(res.status, 200, 'Status code must be 200');
            // console.log('response: ', res.text, res.type);
            assert.equal(res.body, 'missing inputs')
            done();
          });
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({})
          .end((err, res) => {
            // console.log('res.body: ', res.body);
            assert.equal(res.body, 'no updated field sent');
            done();
          })
      });
      
      test('One field to update', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({ _id: new ObjectId('5fa4e394197d4955d01398e7'), assigned_to: 'some chai wala' })
          .end((err, res) => {
            // console.log('res.body: ', res.body);
            assert.isString(res.body);
            assert.equal(res.body, 'successfully updated');

            done();
          })
      });
      
      test('Multiple fields to update', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({ 
            _id: new ObjectId('5fa4e394197d4955d01398e7'), 
            issue_text: 'text Change', 
            status_text: 'resolution in progress', 
            assigned_to: 'Mocha wala'
          })
          .end((err, res) => {
            // console.log('res.body: ', res.body);
            assert.isString(res.body);
            assert.equal(res.body, 'successfully updated');
            done();

          })
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .query({})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'issue_text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'updated_on');
            assert.property(res.body[0], 'created_by');
            assert.property(res.body[0], 'assigned_to');
            assert.property(res.body[0], 'open');
            assert.property(res.body[0], 'status_text');
            assert.property(res.body[0], '_id');

            done();
          });
      });
      
      test('One filter', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .query({ open: false })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            if(Array.isArray(res.body) && res.body.length ) {
              assert.property(res.body[0], 'issue_title');
              assert.property(res.body[0], 'issue_text');
              assert.property(res.body[0], 'created_on');
              assert.property(res.body[0], 'updated_on');
              assert.property(res.body[0], 'created_by');
              assert.property(res.body[0], 'assigned_to');
              assert.property(res.body[0], 'open');
              assert.property(res.body[0], 'status_text');
              assert.property(res.body[0], '_id');
            }

            done();
          });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .query({ open: false, assigned_to: 'some chai wala' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            if(Array.isArray(res.body) && res.body.length ) {
              assert.property(res.body[0], 'issue_title');
              assert.property(res.body[0], 'issue_text');
              assert.property(res.body[0], 'created_on');
              assert.property(res.body[0], 'updated_on');
              assert.property(res.body[0], 'created_by');
              assert.property(res.body[0], 'assigned_to');
              assert.property(res.body[0], 'open');
              assert.property(res.body[0], 'status_text');
              assert.property(res.body[0], '_id');
            }

            done();
          });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
          .del('/api/issues/test')
          .send({ _id: '' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body, '_id error');
            
            done();
          });
      });
      
      test('Valid _id', function(done) {
        chai.request(server)
          .del('/api/issues/test')
          .send({ _id: '5fa4e394197d4955d01398e7' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'deleted 5fa4e394197d4955d01398e7');
            
            done();
          });
      });
      
    });

});
