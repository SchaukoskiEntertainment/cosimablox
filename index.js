var ws = require('ws')
const { v4: uuidv4 } = require('uuid')
const PORT = process.env.PORT || 3000

var server = new ws.Server({ port: PORT })

var players = []

server.on('connection', ws => {
    var playerID = uuidv4()

    ws.on('message', message => {
        let data = JSON.parse(message.toString())
        data.type = "Player"
        data.id = playerID

        players.push(data)

        server.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === ws.OPEN) {
                client.send(JSON.stringify(data))
            }
        })
    })

    ws.on('close', (code, reason) => {
        // Remove player by id
        var index = players.map(x => {
            return x.id;
        }).indexOf(playerID)
        players.splice(index, 1)

        var deleteData = {
            "type": "Delete",
            "id": playerID
        }
        
        server.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === ws.OPEN) {
                client.send(JSON.stringify(deleteData))
            }
        })
    })

    ws.send(JSON.stringify(players))
})