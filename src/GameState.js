function showGameState() {
    // Game variables

    msgPush('** GAME');
    msgPush('Aid: ' + aid);
    msgPush('Patronage: ' + patronage);
    msgPush('Support + Available: ' + supportAvailable);
    msgPush('COIN + Patronage: ' + coinPatronage);
    msgPush('Opposition + Bases: ' + oppositionBases);
    msgPush('Uncontrolled Pop: ' + uncontrolledPop);
    msgPush('Islamabad: ' + islamabad);
    msgPush('');

    msgPush('** ELIGABILITY');
    msgPush('#todo');
    msgPush('');

    msgPush('** DECK');
    msgPush('Current Card: ' + cardIndex[currentCard].name);
    msgPush('Upcoming Card: ' + cardIndex[nextCard].name);
    msgPush('Propaganda Cards Left in Deck: ' + propagandaCount);
    msgPush('');
    msgPush('** CAPABILITIES');
    msgPush('#todo');
    msgPush('');
    msgPush('** MOMENTUM');
    if (momentum.length == 0)
        msgPush('None');
    momentum.forEach(function (card) {
        msgPush(cardIndex[card].name);
    });

    msgPush('');
    msgPush('** COALITION');
    msgPush('Available Bases: ' + availableBasesCoalition);
    msgPush('Available Troops: ' + availableForcesCoalition);

    msgPush('');
    msgPush('** GOVERNMENT');
    msgPush('Resources: ' + governmentResources);
    msgPush('Available Bases: ' + availableBasesGovernment);
    msgPush('Available Troops: ' + availableForcesTroops);
    msgPush('Available Police: ' + availableForcesPolice);

    msgPush('');
    msgPush('** TALIBAN');
    msgPush('Resources: ' + talibanResources);
    msgPush('Available Bases: ' + availableBasesTaliban);
    msgPush('Available Troops: ' + availableForcesTaliban);

    msgPush('');
    msgPush('** WARLORDS');
    msgPush('Resources: ' + warlordsResources);
    msgPush('Available Bases: ' + availableBasesWarlords);
    msgPush('Available Troops: ' + availableForcesWarlords);

    // LOCs

    msgPush('');
    msgPush('** LOCs');
    msgPush('');

    for (var key in locs) {
        msgPush('* ' + key);
        var loc = locs[key];
        msgPush('Economic Value: ' + loc.econ);
        msgPush('');
    }

    // Provinces

    var props = ["Coalition Base", "Coalition Troops", "GOVT Base", "Troops", "Police", "Taliban Base", "Taliban Guerrilla", "Warlords Base", "Warlords Guerrilla"];
    
    msgPush('** PROVINCES');
    msgPush('');

    for (var key in provinces) {
        var province = provinces[key];
        var zone = getZone(key);

        msgPush('* ' + key);

        var popstr = province.pop;
        if (zoneContains(zone, 'Returnees'))
            popstr += ' (Returnees)';

        msgPush('Population: ' + popstr);

        var support = 'Neutral';
        if (zoneContains(zone, 'Support'))
            support = 'Support';
        if (zoneContains(zone, 'Opposition'))
            support = 'Opposition';
            
        msgPush('Level: ' + support);

        var control = 'Uncontrolled';
        if (zoneContains(zone, 'COIN Control'))
            control = 'COIN Control';
        if (zoneContains(zone, 'Taliban Control'))
            control = 'Taliban Control';

        msgPush('Control: ' + control);

        for (var pkey in props) {
            var prop = props[pkey];
            var count = countAtZone(zone.name, prop);
            if (count > 0) {
                msgPush(count + 'x ' + prop);
            }
        }
        msgPush('');
    }
}