// utility functions

function msgPush(line) {
	msg.push(line);
	console.log('<AI> ' + line);
}

function msgPop() {
	var line = msg.pop();
	console.log('MSG-POP: ' + line);
}

function contains(array, item) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] == item)
			return true;
	}
	return false;
}

function d6() {
	return Math.floor(6*Math.random())+1;
}

function fixZoneParameter(zone, outType) {
    outType = outType || 'object';

    if (typeof zone == outType)
        return zone;

    if (outType == 'string') {
        console.log('INFO fixZoneParameter() converting from object to string for ' + zone.name);
        return zone.name;
    }
    if (outType == 'object') {
        console.log('INFO fixZoneParameter() converting from string to object for ' + zone);
        return getZone(zone);
    }
    
    msgPush("ASSERT FAILED fixZoneParameter(): Unknown outType");
}

function findResources() {
	for (var i = 0; i < zoneCount; i++) {
		var zone = zones[i];
		var zoneName = zone.name;
		for (var j = 0; j < zone.pieces.length; j++) {
			var pieceName = zone.pieces[j].name;
            if (pieceName.startsWith("GOVT Resources"))
				governmentResources = parseInt(zoneName);
            if (pieceName.startsWith("Taliban Resources"))
				talibanResources = parseInt(zoneName);
			if (pieceName.startsWith("Warlords Resources"))
				warlordsResources = parseInt(zoneName);
            if (pieceName.startsWith("Aid"))
                aid = parseInt(zoneName);
            if (pieceName.startsWith("Patronage"))
                patronage = parseInt(zoneName);
            if (pieceName.startsWith("Support + Avail"))
                supportAvailable = parseInt(zoneName);
            if (pieceName.startsWith("COIN + Patronage"))
                coinPatronage = parseInt(zoneName);
            if (pieceName.startsWith("Oppose + Bases"))
                oppositionBases = parseInt(zoneName);
            if (pieceName.startsWith("Uncontrolled Pop"))
                uncontrolledPop = parseInt(zoneName);
            if (pieceName.startsWith('Islamabad')) {
                islamabad = zoneName.substring(11);
                if (pieceName == 'Islamabad Hard')
                    islamabad += ' (Hard)';
            }
		}
	}
}

function findAvailableForces() {
	availableForcesCoalition = countAtZone("Coalition Available Forces", "Coalition Troops");
	availableForcesTroops = countAtZone("Government Available Forces", "Troops");
	availableForcesPolice = countAtZone("Government Available Forces", "Police");
	availableForcesWarlords = countAtZone("Warlords Available Forces", "Warlords Guerrilla");
	availableForcesTaliban = countAtZone("Taliban Available Forces", "Taliban Guerrilla");

	availableBasesCoalition = countAtZone("Coalition Available Forces", "Coalition Base");
	availableBasesGovernment = countAtZone("Government Available Forces", "GOVT Base");
	availableBasesWarlords = countAtZone("Warlords Available Forces", "Warlords Base");
	availableBasesTaliban = countAtZone("Taliban Available Forces", "Taliban Base");
}

function adjustForReturnees() {
    for (var key in provinces) {
        provinces[key].pop += countAtZone(key, 'Returnees');
        console.log('Population ' + key + ' = ' + provinces[key].pop);
    }
}

function zoneContains(zone, pieceName) {
    zone = fixZoneParameter(zone);

	for (var i = 0; i < zone.pieces.length; i++) {
		if (zone.pieces[i].name.startsWith(pieceName))
			return true;
	}
	return false;
}

function isAdjacent(target, origin) {
    if (typeof target == 'string') msgPush("ASSERT FAILED isAdjacent(): target is string instead of Zone");
    origin = fixZoneParameter(origin, 'string');

    for (var i = 0; i < target.adjacencies.length; i++) {
        console.log('isAdjacent() ' + target.adjacencies[i] + ' == ' + origin + '?');
        if (target.adjacencies[i] == origin)
            return true;
    }
    return false;
}

function deactivateZonePieces(zone, pieceName) {
    zone = fixZoneParameter(zone);
    
    var activePieceName = pieceName + ' Active';
    for (var i = 0; i < zone.pieces.length; i++) {
		if (zone.pieces[i].name == activePieceName)
			zone.pieces[i].name = pieceName;
	}
}

function removePiece(zone, pieceName) {
    zone = fixZoneParameter(zone);

    var activePieceName = pieceName + ' Active';
    for (var i = 0; i < zone.pieces.length; i++) {
		if (zone.pieces[i].name == activePieceName) {
			zone.pieces.splice(i, 1);
			return activePieceName;
		}
	}
	for (var i = 0; i < zone.pieces.length; i++) {
		if (zone.pieces[i].name == pieceName) {
			zone.pieces.splice(i, 1);
			return pieceName;
		}
	}
    return false;
}

function movePiece(fromZone, toZone, pieceName, activate) {
    fromZone = fixZoneParameter(fromZone, 'string');
    toZone = fixZoneParameter(toZone);

    var pieceMoved = removePiece(fromZone, pieceName);
    if (!pieceMoved) {
        msgPush("ASSERT FAILED movePiece(): origin has no piece requested for move");
        return false;
    }
    var destinationPiece = pieceMoved;
    if (!pieceMoved.endsWith("Active") && activate) {
        destinationPiece += " Active";
    }
    toZone.pieces.push({name: destinationPiece});
    return pieceMoved;
}

function countAtZone(zone, pieceName) {
    zone = fixZoneParameter(zone);

	var count = 0;
    if (pieceName == "*") {
        count = zone.pieces.length;
    }
    else
    {
        for (var j = 0; j < zone.pieces.length; j++) {
            if (zone.pieces[j].name.startsWith(pieceName)) count++;
        }
    }
	console.log("countAtZone() " + pieceName + " @ " + zone.name + " = " + count);
	return count;
}

function countBasesAtZone(zone) {
    zone = fixZoneParameter(zone);

	var count = 0;

    for (var j = 0; j < zone.pieces.length; j++) {
        var pieceName = zone.pieces[j].name;
        if (pieceName.substring(pieceName.length - 4) == "Base") count++;
    }
	console.log("countBasesAtZone() " + zone.name + " = " + count);
	return count;
}

function getZone(zoneName) {
	for (var i = 0; i < zoneCount; i++) {
		var zone = zones[i];
		if (zone.name == zoneName) {
			return zone;
		}
	}
	return false;
}

function getCurrentCard() {
	var cardZone = getZone("Card Play Area");
	var currentCard = 0;
	var y = 0;
	for (var i = 0; i < cardZone.pieces.length; i++) {
		var piece = cardZone.pieces[i];
		var periodIndex = piece.name.indexOf('.');
//		console.log("getCurrentCard() " + piece.name + " at " + piece.y + " (" + periodIndex + ", " + piece.name.substring(0, periodIndex) + "); " + currentCard + " at " + y);
		if (piece.name.charAt(0) != ' ' && periodIndex > 0 && periodIndex < 3 && piece.y > y) {
			y = piece.y;
			var cardNumber = piece.name.substring(0, periodIndex);
			if (cardNumber.charAt(0) == '0') cardNumber = cardNumber.substring(1);
			currentCard = parseInt(cardNumber);
		}
	}
	console.log("Current Card #" + currentCard);
	return currentCard;
}

function getNextCard() {
	var cardZone = getZone("Card Play Area");
	var nextCard = 0;
	var y = 9999999;
	for (var i = 0; i < cardZone.pieces.length; i++) {
		var piece = cardZone.pieces[i];
		var periodIndex = piece.name.indexOf('.');
		if (piece.name.charAt(0) != ' ' && periodIndex > 0 && periodIndex < 3 && piece.y < y) {
			y = piece.y;
			nextCard = parseInt(piece.name.substring(0, periodIndex));
		}
	}
	console.log("Next Card #" + nextCard);
	return nextCard;
}

function getMomentumCards() {
    var momentum = [];
	var cardZone = getZone("Momentum");
	for (var i = 0; i < cardZone.pieces.length; i++) {
		var piece = cardZone.pieces[i];
		var periodIndex = piece.name.indexOf('.');
		if (piece.name.charAt(0) != ' ' && periodIndex > 0 && periodIndex < 3) {
			var cardNumber = piece.name.substring(0, periodIndex);
			if (cardNumber.charAt(0) == '0') cardNumber = cardNumber.substring(1);
			momentum.push(parseInt(cardNumber));
		}
	}
	return momentum;
}

function isCardMomentum() {
	if (action == "Coalition" || action == "Government") {
		switch (currentCard) {
			case 11:
			case 24:
			case 45:
			case 57:
			case 59:
				return true;
		}
	} else {
		switch (currentCard) {
			case 10:
			case 11:
			case 17:
			case 24:
			case 26:
			case 36:
			case 45:
			case 57:
			case 59:
				return true;
		}
	}
	return false;
}

function isCardCapability() {
//	if (action == "Coalition" || action == "Government") {
		// COALITION Capability
		switch (currentCard) {
			case 1:
			case 2:
			case 3:
			case 5:
			case 7:
			case 12:
			case 18:
				return true;
		}
//	} else {
		// TALIBAN Capability
		switch (currentCard) {
			case 23:
			case 29:
			case 30:
			case 31:
			case 33:
			case 34:
			case 46:
				return true;
		}
//	}
	
	return false;
}

function isIslamabadCard() {
	switch (currentCard) {
		case 6:
		case 8:
		case 9:
		case 22:
		case 39:
		case 43:
		case 48:
			return true;
	}
	
	return false;
}

function pickRandomZone(candidates, selector) {
	var blackDie = d6();
	var tanDie = d6();
	var greenDie = d6();
	
	console.log("pickRandomZone() BLACK=" + blackDie + ", TAN=" + tanDie + ", GREEN=" + greenDie);
	
	blackDie = Math.ceil(blackDie / 2) - 1;
	tanDie = Math.ceil(tanDie / 2) - 1;
	greenDie = Math.ceil(greenDie / 2) - 1;
	
	var spaceIndex = (tanDie * 9) + (blackDie * 3) + greenDie;
	var safety = kSpacesTable.length + 1;
	
	console.log("pickRandomZone() rolled " + kSpacesTable[spaceIndex]);
	
	do {
		var isCandidate = contains(candidates, kSpacesTable[spaceIndex]);
		var selectorOk = (selector == null || selector(kSpacesTable[spaceIndex]));
		if (isCandidate && selectorOk) {
			safety = -1;
		} else {
			safety--;
			if (spaceIndex == (kSpacesTable.length - 1))
				spaceIndex = 0;
			else
				spaceIndex++;
		}
	} while (safety > 0);
	
	if (safety == 0)
		return false;
		
	console.log("pickRandomZone() selected " + kSpacesTable[spaceIndex]);
	
	return kSpacesTable[spaceIndex];
}

function filterZones(candidates, selector) {
	var output = [];
	if (candidates == null || candidates.length == 0) return output;
	for (var i = 0; i < candidates.length; i++) {
		var c = candidates[i];
		var z = getZone(c);
		if (selector(z)) output.push(c);
	}
	return output;
}

function placePieceInsurgent(faction, candidates) {
	console.log("placePieceInsurgent(" + faction + ", " + candidates + ")");

	var availableBases = faction == "Warlords" ? availableBasesWarlords : availableBasesTaliban;
	var availableForces = faction == "Warlords" ? availableForcesWarlords : availableForcesTaliban;

	var zone = false;
	if (availableBases > 0) {
		zone = pickRandomZone(candidates, function(z) { return countBasesAtZone(z) < 2; });
		
		if (zone) {
			msgPush("# Place " + faction + " Base in " + zone);
		} else {
			console.log("No spaces to place " + faction + " base");
		}
	}
	if (!zone && availableForces > 0) {
		zone = pickRandomZone(candidates);
		
		if (zone) {
			msgPush("# Place " + faction + " Guerilla in " + zone);
		} else {
			console.log("No spaces to place " + faction + " guerilla");
		}
	}
	
	return zone;
}