var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/student_detail',function(req,res,next){
  res.render('student_detail');
});

router.get('/student',function(req,res,next){
  res.render('student_course');
});
module.exports = router;
