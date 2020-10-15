const cf = require('./index');

// get players traded by Chicago Blackhawks from 2021
cf.getTrades("2021", 6).then((response) => {
    console.log("Blackhawks trades: ", response);
})

// get players signed by Chicago Blackhawks in 2019
cf.getSignings(6, cf.positions.ALL, cf.contract.ALL, [new Date('1-1-2019'), new Date('12-31-2019')]).then((response) => {
    console.log("Blackhawks signings: ", response);
})

// get all free agents from 2021 season
cf.getListOfPlayers("2021").then((response) => {
    console.log("all free agents: ", response.length);
});

// // get all free agents from age 25 to 30 from 2021 season
cf.getListOfPlayers("2019", cf.options.ALL, [25, 30]).then((response) => {
    console.log("filtered free agents: ", response);
});

// // get all active players
cf.getListOfPlayers("2021", cf.options.ACTIVE).then((response) => {
    console.log("active players: ", response.length);
})

// // get all entry level players
cf.getListOfPlayers("2021", cf.options.ENTRY_LEVEL).then((response) => {
    console.log("entry level players: ", response.length);
})