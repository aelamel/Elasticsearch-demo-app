var http     = require('http'),
	express  = require('express'),
	mysql    = require('mysql')
	parser   = require('body-parser');
    cors = require('cors')

// Database Connection
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'company'
});
try {
	connection.connect();
	
} catch(e) {
	console.log('Database Connetion failed:' + e);
}
var pageSize = 10;
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


app.get('/search/orders/:keyword/:page', function (req,res) {
 
 	var keyword = req.params.keyword;
 	var page = parseInt(req.params.page);
 	var offset = page * pageSize;
 	connection.query('SELECT o.id from orders o INNER JOIN clients c ON o.client_id = c.id WHERE c.nom LIKE ? OR c.pays LIKE ? OR o.description LIKE ? OR o.code LIKE ?', ['%'+keyword+'%', '%'+keyword+'%', '%'+keyword+'%', '%'+keyword+'%'], function(err, rows, fields) {
 		if (!err){
  			var response = [];
  			var totalRows = rows.length;
			if (rows.length != 0) {	
				var idsArray  = [] ;			
				for (var i = 0 ; i < rows.length ; i++) {
					idsArray.push(rows[i].id);
				}

				var slicedIds = idsArray.slice(offset, offset + pageSize);
				connection.query('SELECT c.nom client_name, c.pays client_country, o.code, o.description, o.delivery_date from orders o INNER JOIN clients c ON o.client_id = c.id WHERE o.id IN (?)', [slicedIds], function(err, rows, fields){
					if (!err){
						if (rows.length != 0) {
							response.push({'result' : 'success', 'data' : rows, 'total': totalRows});
						} else {
							response.push({'result' : 'error', 'msg' : 'No Results Found'});
						}

						res.setHeader('Content-Type', 'application/json');
				    	res.status(200).send(JSON.stringify(response));
			  		} else {
					    res.status(400).send(err);
				  	}
				});

			} else {
				response.push({'result' : 'error', 'msg' : 'No Results Found'});
			}
  		} else {
		    res.status(400).send(err);
	  	}
 	});
	// connection.query('SELECT * from orders o INNER JOIN clients c ON o.client_id = c.id WHERE c.nom LIKE ? OR c.pays LIKE ? OR o.description LIKE ? OR o.code LIKE ? LIMIT ?, ?', ['%'+keyword+'%', '%'+keyword+'%', '%'+keyword+'%', '%'+keyword+'%', offset, pageSize ], function(err, rows, fields) {
 //  		if (!err){
 //  			var response = [];

	// 		if (rows.length != 0) {
	// 			response.push({'result' : 'success', 'data' : rows});
	// 		} else {
	// 			response.push({'result' : 'error', 'msg' : 'No Results Found'});
	// 		}

	// 		res.setHeader('Content-Type', 'application/json');
	//     	res.status(200).send(JSON.stringify(response));
 //  		} else {
	// 	    res.status(400).send(err);
	//   	}
	// });
});

app.get('/orders/suggestions/:keyword', function (req,res) {
 
 	var keyword = req.params.keyword;
 	console.log(keyword);
	connection.query('SELECT c.nom client_name, c.pays client_country, o.code from orders o INNER JOIN clients c ON o.client_id = c.id WHERE c.nom LIKE ? OR c.pays LIKE ? OR o.description LIKE ? OR o.code LIKE ? LIMIT ?', [keyword+'%', keyword+'%', keyword+'%', keyword+'%', pageSize ], function(err, rows, fields) {
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
