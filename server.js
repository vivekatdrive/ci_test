var http = require('http');
var cron = require('node-cron');
const Gamedig = require('gamedig');
var mysql = require('mysql');
// var config = require('./config.json')
var iplocation = require('iplocation');
var sleep = require('system-sleep');
var env = require("./env");
var app = http.createServer(function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.end('Background Processor is running......');
}).listen(1337, "127.0.0.1");
//sets port and IP address of the server
console.log('Server running at http://127.0.0.1:1337/');
env.set_environment();
console.log('Environment variables defined');
var connection = mysql.createConnection({
    host: process.env.DBHost,
    user: process.env.DBUsername,
    password: process.env.DBPassword,
    database: process.env.Database
});
connection.connect();
console.log('DB Connected');
CrawlSteam();

cron.schedule('0 */' + process.env.RefreshIntervalInMinute + ' * * * *', function () {
    CrawlSteam();
});

function CrawlSteam() {
    connection.query('SELECT * FROM chal_server WHERE id IN (SELECT DISTINCT server_id FROM chal_active_challenger)', function (err, rows, fields) {
        rows.forEach(element => {
            if ((element.latitude == null && element.longitude == null) || (element.latitude == 'undefined' && element.longitude == 'undefined')) {
                GetServerDetailsFromIP(element.ip_address, function (result) {
                    console.log("fetching geolocation for " + element.ip_address + " id= " + element.id);
                    if(result != undefined && result != null)
                    {
                        element.country_code = result.country_code;
                        element.country = result.country_name;
                        element.latitude = result.latitude;
                        element.longitude = result.longitude;
                        element.city = result.city;
                    }
                    GetSteamVariables(element.ip_address, function (rs) {
                        // console.log(rs);
                        console.log("fetching steam data for " + element.ip_address + " id= " + element.id);
                        if(rs != null && rs!=undefined)
                        {
                            element.game_match_map = rs.map;
                            element.players = rs.raw.numplayers;
                            element.bots = rs.raw.numbots;
                            element.maxPlayers = rs.maxplayers;
                            element.server_name = rs.name;
                            console.log(element);
                            var sql = "UPDATE chal_server SET server_name=?, country=?, latitude=?, longitude=?, city=?, game_match_map=?, players=?, bots=?, maxPlayers=?, country_code=?, last_updated = NOW()  WHERE id = ?";
                            var query = connection.query(sql, [element.server_name, element.country, element.latitude, element.longitude, element.city, element.game_match_map, element.players, element.bots, element.maxPlayers, element.country_code, element.id], function (err, result) {
                                console.log("Record Updated!!");
                            });
                        }
                    });
                });
            } else {
                GetSteamVariables(element.ip_address, function (rs) {
                    // console.log(rs);
                    console.log("fetching steam data for " + element.ip_address + " id= " + element.id);
                    if (rs != null && rs != undefined) {
                        element.game_match_map = rs.map;
                        element.players = rs.raw.numplayers;
                        element.bots = rs.raw.numbots;
                        element.maxPlayers = rs.maxplayers;
                        element.server_name = rs.name;
                        console.log(element);
                        var sql = "UPDATE chal_server SET server_name=?, game_match_map=?, players=?, bots=?, maxPlayers=?, last_updated = NOW()  WHERE id = ?";
                        var query = connection.query(sql, [element.server_name, element.game_match_map, element.players, element.bots, element.maxPlayers, element.id], function (err, result) {
                            console.log("Record Updated!!");
                        });
                    }

                });
            }
            //console.log("id is " + element.id);
            sleep(3000);
        });
        //connection.end();
    });
}

function GetSteamVariables(ip_address, callback) {
    var serverIp = ip_address.match(/((\d{1,3}.){3}\d{1,3})/)[0];
    var port = ip_address.match(/(:\d+)/)[0];
    port = port.replace(':', '');
    Gamedig.query({
        type: 'csgo',
        host: serverIp,
        port: port,
        timeout: 5000
    }).then((state) => {
        callback(state);
    }).catch((error) => {
        console.log("Server is offline");
        callback(null);
    });
}

function GetServerDetailsFromIP(ip_address, callback) {
    var serverIp = ip_address.match(/((\d{1,3}.){3}\d{1,3})/)[0];
    var port = ip_address.match(/(:\d+)/)[0];
    port = port.replace(':', '');
    iplocation(serverIp, ["https://ipapi.co/*/json/"]).then((res) => {
        var location = {
            country_code: res.country,
            country_name: res.country_name,
            latitude: res.latitude,
            longitude: res.longitude,
            city: res.city
        };
        callback(location);
    }).catch((error) => {
        console.log("Geo data not found");
        callback(null);
    });

}