var mysql = require("mysql");

let DbConnection = { runQuery };

module.exports = DbConnection;

let pool = mysql.createPool({
	connectionLimit: 10,
	host: process.env.DBHOST,
	user: process.env.DBUSER,
	password: process.env.DBPASSWORD,
	database: process.env.DBDATABASE,
});

function runQuery(query) {
	return new Promise((resolve, reject) => {
		pool.getConnection(function (err, connection) {
			if (err) reject(err); // not connected!

			// Use the connection
			connection.query(query, function (error, results) {
				connection.destroy();

				if (error) {
					console.error(error);
					reject(error);
				}
				resolve(results);
			});
		});
	});
}
