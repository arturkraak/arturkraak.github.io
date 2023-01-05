let totalXP = 0
let xpOffset = 0
let tries = 0
let points = []
let auditUp = 0
let auditDown = 0
let auditUpOffset = 0
let auditDownOffset = 0
let levelOffset = 0
let levelPoints = [[0, 60]]
let level = 0

getXP()
getAuditUp()
getAuditDown()
setTimeout(() => {
  getLevel()
}, "500")

// Normal query
fetch('https://01.kood.tech/api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
    {
      transaction{
        userId
      }
    }
      `,
        }),
    })
    .then((res) => res.json())
    .then(function(result) {
        id = result.data.transaction[6].userId
        document.getElementById("userID").innerText = id
    })

// Nested query
fetch('https://01.kood.tech/api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
    {
      transaction{
        user{
          login
        }
      }
    }
      `,
        }),
    })
    .then((res) => res.json())
    .then(function(result) {
        id = result.data.transaction[6].user.login
        document.getElementById("userName").innerText = id
    })

// Argument query
function getXP() {
    fetch('https://01.kood.tech/api/graphql-engine/v1/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
      {
        transaction(offset:${xpOffset}, where: { userId: { _eq: 3249 } type: { _eq: "xp"}} order_by: {createdAt: asc}) {
              amount
              createdAt
        }
    }
        `,
            }),
        })
        .then((res) => res.json())
        .then(function(result) {
            for (i = 0; i < result.data.transaction.length; i++) {
                console.log()
                totalXP += result.data.transaction[i].amount
                points.push([Math.round((Date.parse(result.data.transaction[i].createdAt) - Date.parse("2021-07-05T07:14:15.24974+00:00")) / (1000 * 60 * 60 * 24)) * 10, totalXP / 1000])
            }
            document.getElementById("xp").innerText = totalXP
            xpOffset += 50
            if (result.data.transaction.length > 49) {
                setTimeout(() => {
                    getXP()
                }, "20")
            } else {
                drawXPGraph()
            }
        })
}

function getAuditUp() {
    fetch('https://01.kood.tech/api/graphql-engine/v1/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
      {
        transaction(offset:${xpOffset}, where: { userId: { _eq: 3249 } type: { _eq: "up"}} ) {
              amount
        }
    }
        `,
            }),
        })
        .then((res) => res.json())
        .then(function(result) {
            for (i = 0; i < result.data.transaction.length; i++) {
                auditUp += result.data.transaction[i].amount
            }
            auditUpOffset += 50
            if (result.data.transaction.length > 49) {
                setTimeout(() => {
                    getAuditUp()
                }, "200")
            } else {
                drawAuditRatioGraph()
            }
        })
}

function getAuditDown() {
    fetch('https://01.kood.tech/api/graphql-engine/v1/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
      {
        transaction(offset:${auditDownOffset}, where: { userId: { _eq: 3249 } type: { _eq: "down"}}) {
              amount
        }
    }
        `,
            }),
        })
        .then((res) => res.json())
        .then(function(result) {
            for (i = 0; i < result.data.transaction.length; i++) {
                auditDown += result.data.transaction[i].amount
            }
            auditDownOffset += 50
            if (result.data.transaction.length > 49) {
                setTimeout(() => {
                    getAuditDown()
                }, "200")
            } else {
                drawAuditRatioGraph()
            }
        })
}

// LEVEL OVER TIME
function getLevel() {
    fetch('https://01.kood.tech/api/graphql-engine/v1/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
      {
        transaction(offset:${levelOffset}, order_by: {createdAt: asc} where: {type: {_eq: "level"} userId: {_eq: 3249} _not: {object: {type: {_eq: "exercise"}}} }){
          createdAt
          amount
        }
      }
        `,
            }),
        })
        .then((res) => res.json())
        .then(function(result) {
            for (i = 0; i < result.data.transaction.length; i++) {
                level = result.data.transaction[i].amount
                levelPoints.push([Math.round((Date.parse(result.data.transaction[i].createdAt) - Date.parse("2021-09-17T15:13:44.184449+00:00")) / (1000 * 60 * 60 * 24)), 60 - level])
            }
            levelOffset += 50
            if (result.data.transaction.length > 49) {
                setTimeout(() => {
                  getLevel()
                }, "400")
            } else {
                document.getElementById("level").innerText = level
                drawLevelGraph()
            }
        })
}

function drawAuditRatioGraph() {
  document.getElementById("auditRatio").innerHTML = `
<h1 style="border-width: 0px; position: absolute; margin-right: 230px">${Math.round(100*auditUp/(auditDown+auditUp))}%</h1>
<svg width="100%" height="100%" viewBox="0 0 42 42" class="donut">
<circle class="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="transparent"></circle>
<circle class="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#00AA00" stroke-width="3"></circle>
<circle class="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#AA0000" stroke-width="3" stroke-dasharray="${Math.round(100*auditDown/(auditDown+auditUp))} ${Math.round(100*auditUp/(auditDown+auditUp))}" stroke-dashoffset="25"></circle>
</svg>
<h1 style="border-width: 0px; position: absolute; color: #AA0000; margin-left: 230px">${Math.round(100*auditDown/(auditDown+auditUp))}%</h1>
`
}

function drawXPGraph() {
  for (i = 0; i < points.length; i++) {
      points[i][1] = (totalXP / 1000) - points[i][1]
  }
  points.push([points[points.length - 1][0], totalXP / 1000])
  document.getElementById("xpOverTime").innerHTML = ` 
<svg id="xpGraph" width="100%" height="100%" viewBox="0 0 ${points[points.length-1][0]} ${points[points.length-1][1]} ">
<polyline fill="#00AA00" stroke="#00FF00" stroke-width="20" points=" ${points.join(" ")} "/>
</svg>
`
}

function drawLevelGraph() {
    levelPoints.push([Math.round(Date.now() - Date.parse("2021-09-17T15:13:44.184449+00:00")) / (1000 * 60 * 60 * 24), levelPoints[levelPoints.length - 1][1]])
    levelPoints.push([Math.round(Date.now() - Date.parse("2021-09-17T15:13:44.184449+00:00")) / (1000 * 60 * 60 * 24), 60])
    // 730 60
    document.getElementById("levelOverTime").innerHTML = ` 
  <svg height="100%" width="100%" id="xpGraph" viewBox="0 0 ${levelPoints[levelPoints.length-1][0]} 60" preserveAspectRatio="none">
  <polyline fill="#00AA00" stroke="#00FF00" stroke-width="1" points="${levelPoints.join(" ")} "/>
  </svg>
  `
}