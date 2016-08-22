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

    msgPush('** ELIGIBILITY');
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
    for (var i = 0; i < momentum.length; i++)
        msgPush(cardIndex[momentum[i]].name);

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

    // Provinces + LOCs

    msgPush('');
    msgPush('** PROVINCES & LOCs');
    msgPush('');

    for (var key in kSpacesAndLoCSpaces) {
        var zone = getZone(kSpacesAndLoCSpaces[key]);

        zone.print();

        msgPush('');
    }
}