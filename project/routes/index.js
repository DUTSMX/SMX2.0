var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/student_detail',function(req,res,next){
  res.render('student_detail')
});

router.get('/student',function(req,res,next){
  res.render('student_course')
});
router.get('/course_re',function(req,res,next){
    res.render('course_re')
});
router.get('/teacher',function(req,res,next){
    res.render('teacher_course')
});
router.get('/teacher_detail',function(req,res,next){
    res.render('teacher_detail')
});
router.get('/teacher_re',function(req,res,next){
    res.render('teacher_re')
});
module.exports = router;
