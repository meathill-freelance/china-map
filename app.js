var Express = require('express')
	, app = new Express();
	
app.use(Express.static('.'));

var server = app.listen(3000, function () {
	var host = server.address().address
		, port = server.address().port;
		
	console.log('Server start at http://%s:%s', host, port);
});	