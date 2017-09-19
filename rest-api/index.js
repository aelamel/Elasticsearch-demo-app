var http     = require('http'),
	express  = require('express'),
	mysql    = require('mysql')
	parser   = require('body-parser');
    cors = require('cors')

// Database Connection
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'company'
});
try {
	connection.connect();
	
} catch(e) {
	console.log('Database Connetion failed:' + e);
}

var app = express();
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 8080);

app.use(cors())


app.get('/', function (req, res) {
	res.send('<html><body><p>Welcome to my REST API</p></body></html>');
});

app.get('/clients', function (req,res) {
 
	connection.query('SELECT * from clients', [], function(err, rows, fields) {
  		if (!err){
  			var response = [];

			if (rows.length != 0) {
				response.push({'result' : 'success', 'data' : rows});
			} else {
				response.push({'result' : 'error', 'msg' : 'No Results Found'});
			}

			res.setHeader('Content-Type', 'application/json');
	    	res.status(200).send(JSON.stringify(response));
  		} else {
		    res.status(400).send(err);
	  	}
	});
});


app.get('/orders/:client', function (req,res) {
 
 	var client = req.params.client;
 	console.log(client);
	connection.query('SELECT * from orders o INNER JOIN clients c ON o.client_id = c.id WHERE c.nom LIKE ? OR c.pays LIKE ? OR o.description LIKE ? OR o.code LIKE ?', ['%'+client+'%', '%'+client+'%', '%'+client+'%', '%'+client+'%' ], function(err, rows, fields) {
  		if (!err){
  			var response = [];

			if (rows.length != 0) {
				response.push({'result' : 'success', 'data' : rows});
			} else {
				response.push({'result' : 'error', 'msg' : 'No Results Found'});
			}

			res.setHeader('Content-Type', 'application/json');
	    	res.status(200).send(JSON.stringify(response));
  		} else {
		    res.status(400).send(err);
	  	}
	});
});

http.createServer(app).listen(app.get('port'), function(){
	console.log('Server listening on port ' + app.get('port'));
});
