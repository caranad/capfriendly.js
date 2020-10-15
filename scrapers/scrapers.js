const $ = require('cheerio');
const capfriendly = require('request-promise');
const { url, teams } = require('../constants');


function formatTrades(val) {
    const f = $(val).find('h6').text();
    let trade_items = [];

    if ($(val).find('div > div > div').text().indexOf("round pick") !== -1) {
        $(val).find('div > div > div').toArray().forEach((player) => {
            if ($(player).text().indexOf("round pick") !== -1) {
                trade_items.push(f + " " + $(player).text())
            }
        });
    } else if ($(val).find('a')) {
        $(val).find('a').toArray().forEach((player) => {
            trade_items.push(f + " " + $(player).text());
        }); 
    }

    return trade_items;
}

function getPlayerData(index, year, type, age_filter) {
    return capfriendly(`${url.browse}/${type}/${year}?ajax=1&p=${index}&limits=age-${age_filter[0]}-${age_filter[1]}`).then((response) => {
        const html = JSON.parse(response).data.results;
        const names = $("#brwt tbody tr td:nth-of-type(1) a", html).toArray().map(val => val.children[0].data);
        const teams = $("#brwt tbody tr td:nth-of-type(2)", html).toArray().map(val => $(val).find('a').text());
        const ages = $("#brwt tbody tr td:nth-of-type(3)", html).toArray().map(val => val.children[0].data);
        const positions = $("#brwt tbody tr td:nth-of-type(4)", html).toArray().map(val => val.children[0].data.split(", "));
        const handed = $("#brwt tbody tr td:nth-of-type(5)", html).toArray().map(val => val.children[0].data);
        const games_played = $("#brwt tbody tr td:nth-of-type(6)", html).toArray().map(val => val.children[0].data);
        const goals = $("#brwt tbody tr td:nth-of-type(7)", html).toArray().map(val => val.children[0].data);
        const assists = $("#brwt tbody tr td:nth-of-type(8)", html).toArray().map(val => val.children[0].data);
        const plus_minus = $("#brwt tbody tr td:nth-of-type(11)", html).toArray().map(val => val.children[0].data);
        const goalie_wins = $("#brwt tbody tr td:nth-of-type(15)", html).toArray().map(val => val.children[0].data);
        const goalie_losses = $("#brwt tbody tr td:nth-of-type(16)", html).toArray().map(val => val.children[0].data);
        const goalie_shutouts = $("#brwt tbody tr td:nth-of-type(17)", html).toArray().map(val => val.children[0].data);
        const cap = $("#brwt tbody tr td:nth-of-type(22)", html).toArray().map(val => val.children[0].data);
        const salary = $("#brwt tbody tr td:nth-of-type(23)", html).toArray().map(val => val.children[0].data);

        if (names.length === 0) { 
            return [];
        }
        
        return names.map((_, index) => {
            const isGoalie = positions[index].includes("G");

            return {
                player: names[index],
                team: teams[index],
                age: parseInt(ages[index]),
                right_handed: handed[index] !== "Left",
                position: positions[index],
                stats: !isGoalie ? {
                    games_played: parseInt(games_played[index]),
                    goals: parseInt(goals[index]),
                    assists: parseInt(assists[index]),
                    plus_minus: parseInt(plus_minus[index])
                } : {
                    wins: parseInt(goalie_wins[index]),
                    losses: parseInt(goalie_losses[index]),
                    shutouts: parseInt(goalie_shutouts[index])
                },
                cap_hit: cap[index],
                salary: salary[index]
            }
        })
    })
}

function getTradesData(year, team, isDeadline=undefined) {
    return capfriendly(`${url.trades}/${teams[team].slug}/${year}?ajax=1${isDeadline === undefined ? '' : !!isDeadline ? '&event=deadline' : '&event=draft' }`).then((response) => {
        const html = JSON.parse(response).data.html;

        if ($(".err", html).toArray()[0]) {
            return { trades: [] }
        }

        const dates = $("tr td:nth-of-type(1)", html).toArray().map(val => val.children[0].data);
        const received = $("tr td:nth-of-type(2)", html).toArray().map(val => formatTrades(val));
        const sent = $("tr td:nth-of-type(4)", html).toArray().map(val => formatTrades(val));

        return { 
            team: teams[team].name,
            trades: dates.map((_, index) => {
                return {
                    received: received[index][0].indexOf(teams[team].name) !== -1 ? received[index] : sent[index],
                    sent: received[index][0].indexOf(teams[team].name) === -1 ? received[index] : sent[index],
                    dates: new Date(dates[index])
                }
            })
        } 
    })
}

function getSigningData(team, position, type, date_range_slug) {
    return capfriendly(`${url.signings}/${teams[team].slug}/${type}/${position}/1-15/1-14500000/${date_range_slug}?p=1`).then((response) => {
        const html = JSON.parse(response).data.html;

        const players = $("tr td:nth-of-type(1) a:nth-of-type(2)", html).toArray().map(val => val.children[0].data);
        const ages = $("tr td:nth-of-type(2)", html).toArray().map(val => val.children[0].data);
        const positions = $("tr td:nth-of-type(3)", html).toArray().map(val => val.children[0].data.split(", "));
        const dates = $("tr td:nth-of-type(5)", html).toArray().map(val => val.children[0].data);
        const contracts = $("tr td:nth-of-type(6)", html).toArray().map(val => val.children[0].data);
        const structure = $("tr td:nth-of-type(8)", html).toArray().map(val => val.children[0].data);
        const salarys = $("tr td:nth-of-type(10) span", html).toArray().map(val => val.children[0].data);

        return { 
            team: teams[team].name,
            signings: players.map((_, index) => {
                return {
                    player: players[index],
                    age: parseInt(ages[index]),
                    position: positions[index],
                    date: new Date(dates[index]),
                    contract_type: contracts[index],
                    structure: structure[index],
                    salary: salarys[index]
                }
            })
        } 
    })
}

module.exports = {
    getPlayerData,
    getTradesData,
    getSigningData,
}