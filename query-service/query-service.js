const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3')
const { performance } = require('perf_hooks')
const moment = require('moment');

var db = new sqlite3.Database('./ffxiv.db')

const app = express()
app.use(cors({'origin': true}))
app.use(express.json())
const port = 4000

function getStatement(queryProps) {
    var filters = []
    var params = []
    if (queryProps.matchString != '') {
        filters.push(` text LIKE '%' || ? || '%'`)
        params.push(queryProps.matchString)
    }
    if (queryProps.matchSpeaker != '') {
        filters.push(` speaker=?`)
        params.push(queryProps.matchSpeaker)
    }
    if (queryProps.minLevel > 1) {
        filters.push(' quests.level>?')
        params.push(queryProps.minLevel)
    }
    if (queryProps.maxLevel < 90) {
        filters.push(' quests.level<?')
        params.push(queryProps.maxLevel)
    }
    if (filters.length > 0) {
        filterText = ` AND ${filters.join(' AND ')}`
    }
    var preparedStatement = db.prepare(`SELECT * FROM lines 
        INNER JOIN quests 
        WHERE lines.quest_id=quests.quest_id ${filterText} 
        ORDER BY quests.level ASC, lines.rowid ASC
        LIMIT 500;`, params)
    return preparedStatement
}

app.get("/", (req, res) => {
    db.all("SELECT * FROM lines LIMIT 2", function(err, rows) {
        res.json(rows)
    })
    console.log(`${moment().format()}: GET root`)
})

app.post("/quest", (req, res) => {
    var startTime = performance.now()
    var statementLines = db.prepare('SELECT * FROM lines WHERE quest_id=? ORDER BY rowid')
    var statementQuest = db.prepare(`SELECT * FROM quests INNER JOIN places 
    WHERE quests.place_id=places.place_id AND quest_id=?`)
    questIdParam = [req.body.questId]
    statementLines.all(questIdParam,
        function (err, lines) {
            statementQuest.get(questIdParam,
                function (err, quest) {
                    var returnObj = { 'lines': lines, 'quest': quest }
                    res.json(returnObj)
                })
        })
    var endTime = performance.now()
    console.log(`${moment().format()}: Quest ${req.body.questId} took ${endTime - startTime}`)
})

app.post("/", (req, res) => {
    var startTime = performance.now()
    var preparedStatement = getStatement(req.body)
    preparedStatement.all( function (err, rows) {
        res.json(rows)
    })
    var endTime = performance.now()
    console.log(`${moment().format()}: Query ${JSON.stringify(req.body)} took ${endTime - startTime}`)
})


app.listen(port, () => {
    console.log(`Query service listening at http://localhost:${port}`)
  })