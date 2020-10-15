const { getPlayerData, getTradesData, getSigningData } = require('./scrapers/scrapers');
const { url } = require('./constants');

const $ = require('cheerio');
const capfriendly = require('request-promise');

const positions = {
    ALL: 'all',
    FORWARDS: 'forwards',
    CENTERS: 'centers',
    LEFT_WING: 'leftwing',
    RIGHT_WING: 'rightwing',
    DEFENSE: 'defense',
    GOALTENDERS: 'goalies'
};

const options = {
    FREE_AGENTS: 'free-agents',
    ACTIVE: 'active',
    ENTRY_LEVEL: 'entry-level-contracts',
    VETERAN: '35-plus-contracts'
}

const contract = {
    ALL: 'all',
    ENTRY_LEVEL: 'entry-level',
    STANDARD: 'standard',
    VETERAN: '35-plus'
}

async function getListOfPlayers(year, type=options.FREE_AGENTS, age_filter=[16, 46]) {
    let players = [];
    let last_obtained = [''];
    let i = 1;

    while (last_obtained.length !== 0) {
        last_obtained = await getPlayerData(i, year, type, age_filter);
        players = players.concat(last_obtained);
        i++;
    }

    return players;
}

async function getTrades(year, team, isDeadline) {
    const trades_list = await getTradesData(year, team, isDeadline);
    return trades_list;
}

async function getSignings(team, position=positions.ALL, type=contract.ALL, daterange=[new Date('1-1-2020'), new Date()]) {
    const date_range_slug = `${formatDate(daterange[0].getMonth() + 1)}${formatDate(daterange[0].getDate())}${daterange[0].getFullYear()}-${formatDate(daterange[1].getMonth() + 1)}${formatDate(daterange[1].getDate())}${daterange[1].getFullYear()}`;
    const signing_list = await getSigningData(team, position, type, date_range_slug);
    return signing_list;
}

function formatDate(val) {
    return val > 10 ? val : '0' + val;
}

module.exports = {
    positions,
    options,
    contract,
    getListOfPlayers,
    getTrades,
    getSignings,
}