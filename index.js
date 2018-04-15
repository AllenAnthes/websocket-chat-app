import express from 'express'
import path from 'path'
import socketIO from 'socket.io'
import xssFilters from 'xss-filters'

const app = express();
const port = process.env.PORT || 4000;
const io = socketIO.listen(app.listen(port));

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get("/", (req, res) => {
    res.render("page");
});

let numUsers = 0;

/**
 * Listener handling most of our application logic.
 *
 * Keeps track of connected users, listens for incoming
 * chat messages, sanitizes those messages, and broadcasts
 * the sanitized result back to the clients
 *
 */
io.sockets.on('connection', (socket) => {
    numUsers++;
    console.log(`New connection. Users: ${numUsers}`);
    socket.emit('message', {message: 'Talk to people!  Hit enter or click send!'});
    io.sockets.emit('message', {
        message: `A new user just joined! There ${numUsers > 1 ? 'are' : 'is' }
                   now ${numUsers} user${numUsers > 1 ? 's' : ''} online.`
    });
    socket.on('send', (data) => {
        console.log(data);
        if (data.username) {
            data.username = xssFilters.inHTMLData(data.username);
        }
        if (data.message) {
            data.message = xssFilters.inHTMLData(data.message);
        }

        io.sockets.emit('message', data);
    });
    socket.on('disconnect', () => {
        numUsers--;
        console.log(`User disconnected. Users: ${numUsers}`);
        io.sockets.emit('message', {
            message: `A user has disconnected. There ${numUsers > 1 ? 'are' : 'is' }
                        now ${numUsers} user${numUsers > 1 ? 's' : ''} online.`
        })
    });
});

console.log("Listening on port " + port);
