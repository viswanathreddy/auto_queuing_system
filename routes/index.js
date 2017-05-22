var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.use('/customerapp.html', require('./customer'));
router.use('/driverapp.html', require('./driver'));
router.use('/dashboard.html', require('./dashboard'));

module.exports = router;
