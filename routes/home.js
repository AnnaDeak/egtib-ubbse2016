/**
 * Created by rekaszilagyi on 2016-11-13.
 */
var router = require('express').Router();

router.get('/', function(req, res) {
	webSocketUri = req.get('host').split(':')[0];
	res.render('home', {
		active: 'home'
	});
});

module.exports = router;