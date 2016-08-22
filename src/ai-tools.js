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

function count(array, item) {
	var count = 0;
	for (var i = 0; i < array.length; i++) {
		if (array[i] == item)
			count++;
	}
	return count;
}

function d6() {
	return Math.floor(6*Math.random())+1;
}

function die(d) {
	return Math.floor(d*Math.random())+1;
}

function fixZoneParameter(zone, outType) {
    outType = outType || 'object';

    if (typeof zone == outType)
        return zone;

    if (outType == 'string') {
        //console.log('INFO fixZoneParameter() converting from object to string for ' + zone.name);
        return zone.name;
    }
    if (outType == 'object') {
        //console.log('INFO fixZoneParameter() converting from string to object for ' + zone);
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

function setupProvinces() {
	var provinces = {
		"Badakhshan": {pop: 1, adjacencies: [ "Northwest Frontier (Pakistan)", "Nuristan", "Baghlan", "Konduz" ]},
		"Badghis": {pop: 1, adjacencies: [ "Faryab", "Sar-e-Pol", "Ghowr", "Herat" ]},
		"Baghlan": {pop: 2, adjacencies: [ "Konduz", "Badakhshan", "Nuristan", "Kabul", "Samangan", "Balkh" ]},
		"Balkh": {pop: 2, adjacencies: [ "Konduz", "Baghlan", "Samangan", "Sar-e-Pol", "Faryab" ]},
		"Balochistan (Pakistan)": {pop: 0, adjacencies: [ "Nimruz", "Helmand", "Kandahar", "Waziristan (Pakistan)" ]},
		"Bamian": {pop: 1, adjacencies: [ "Samangan", "Kabul", "Khowst", "Ghazni", "Oruzgan", "Sar-e-Pol" ]},
		"Farah": {pop: 0, adjacencies: [ "Herat", "Ghowr", "Nimruz" ]},
		"Faryab": {pop: 1, adjacencies: [ "Balkh", "Sar-e-Pol", "Badghis" ]},
		"Ghazni": {pop: 1, adjacencies: [ "Bamian", "Khowst", "Paktika", "Zabol", "Oruzgan" ]},
		"Ghowr": {pop: 1, adjacencies: [ "Badghis", "Sar-e-Pol", "Oruzgan", "Helmand", "Nimruz", "Farah", "Herat" ]},
		"Helmand": {pop: 1, adjacencies: [ "Oruzgan", "Kandahar", "Balochistan (Pakistan)", "Nimruz", "Ghowr" ]},
		"Herat": {pop: 1, adjacencies: [ "Badghis", "Ghowr", "Farah" ]},
		"Kabul": {pop: 3, adjacencies: [ "Baghlan", "Nuristan", "Khowst", "Bamian", "Samangan" ]},
		"Kandahar": {pop: 2, adjacencies: [ "Oruzgan", "Zabol", "Waziristan (Pakistan)", "Balochistan (Pakistan)", "Helmand" ]},
		"Khowst": {pop: 2, adjacencies: [ "Nuristan", "Northwest Frontier (Pakistan)", "Waziristan (Pakistan)", "Paktika", "Ghazni", "Bamian", "Kabul" ]},
		"Konduz": {pop: 2, adjacencies: [ "Badakhshan", "Baghlan", "Balkh" ]},
		"Nimruz": {pop: 0, adjacencies: [ "Ghowr", "Helmand", "Balochistan (Pakistan)", "Farah" ]},
		"Northwest Frontier (Pakistan)": {pop: 1, adjacencies: [ "Waziristan (Pakistan)", "Khowst", "Nuristan", "Badakhshan" ]},
		"Nuristan": {pop: 2, adjacencies: [ "Badakhshan", "Northwest Frontier (Pakistan)", "Khowst", "Kabul", "Baghlan" ]},
		"Oruzgan": {pop: 1, adjacencies: [ "Bamian", "Ghazni", "Zabol", "Kandahar", "Helmand", "Ghowr", "Sar-e-Pol" ]},
		"Paktika": {pop: 1, adjacencies: [ "Khowst", "Waziristan (Pakistan)", "Zabol", "Ghazni" ]},
		"Samangan": {pop: 0, adjacencies: [ "Baghlan", "Kabul", "Bamian", "Sar-e-Pol", "Balkh" ]},
		"Sar-e-Pol": {pop: 0, adjacencies: [ "Balkh", "Samangan", "Bamian", "Oruzgan", "Ghowr", "Badghis", "Faryab" ]},
		"Waziristan (Pakistan)": {pop: 1, adjacencies: [ "Northwest Frontier (Pakistan)", "Balochistan (Pakistan)", "Kandahar", "Zabol", "Pakistan", "Khowst" ]},
		"Zabol": {pop: 0, adjacencies: [ "Ghazni", "Paktika", "Waziristan (Pakistan)", "Kandahar", "Oruzgan" ]}
	};
	var locs = {
		"Kabul-Tor Kham LOC": { econ: 4, adjacencies: [ "Nuristan", "Kabul", "Khowst", "Northwest Frontier (Pakistan)" ] },
		"Kandahar-Spin Boldak LOC": { econ: 3, adjacencies: [ "Oruzgan", "Kandahar", "Zabol", "Waziristan (Pakistan)" ] },
		"Kabul-Aibak LOC": { econ: 1, adjacencies: [ "Kabul", "Baghlan", "Balkh", "Samangan" ] },
		"Shibirghan-Aibak LOC": { econ: 1, adjacencies: [ "Baghlan", "Balkh", "Faryab", "Sar-e-Pol", "Samangan" ] },
		"Farah-Kandahar LOC": { econ: 1, adjacencies: [ "Farah", "Nimruz", "Helmand", "Kandahar", "Zabol", "Oruzgan", "Ghowr" ] },
		"Toraghondi-Farah LOC": { econ: 1, adjacencies: [ "Badghis", "Ghowr", "Nimruz", "Farah", "Herat" ] },
		"Kandahar-Kabul LOC": { econ: 1, adjacencies: [ "Kandahar", "Zabol", "Paktika", "Khowst", "Kabul", "Bamian", "Ghazni", "Oruzgan" ] }
	};

	for (var i = 0; i < kSpacesAndLoCSpaces.length; i++) {
		var name = kSpacesAndLoCSpaces[i];
		var zone = getZone(name);

		// adjust pop for returnees
		if (zoneContains(zone, 'Returnees'))
			provinces[name].pop++;

		// provinces info
		if (provinces[name]) {
			zone.pop = provinces[name].pop;
			zone.adjacencies = provinces[name].adjacencies;
		} else if (locs[name]) {
			zone.econ = locs[name].econ;
			zone.adjacencies = locs[name].adjacencies;
		}
		zone.returnees = zoneContains(zone, 'Returnees');
		zone.terror = countAtZone(zone, 'Terror');

		// count bases and Forces
		zone.coalition_base = countAtZone(zone, "Coalition Base");
		zone.coalition_troops = countAtZone(zone, "Coalition Troops");
		zone.government_base = countAtZone(zone, "GOVT Base");
		zone.troops = countAtZone(zone, "Troops");
		zone.police = countAtZone(zone, "Police");
		zone.taliban_base = countAtZone(zone, "Taliban Base");
		zone.taliban_guerrilla_underground = countAtZoneExact(zone, "Taliban Guerrilla");
		zone.taliban_guerrilla_active = countAtZoneExact(zone, "Taliban Guerrilla Active");
		zone.warlords_base = countAtZone(zone, "Warlords Base");
		zone.warlords_guerrilla_underground = countAtZoneExact(zone, "Warlords Guerrilla");
		zone.warlords_guerrilla_active = countAtZoneExact(zone, "Warlords Guerrilla Active");

		// functions
		zone.empty = function() {
			return !this.coin() && !this.taliban() && !this.warlords();
		}
		zone.coalition = function() {
			return this.coalition_base + this.coalition_troops;
		}
		zone.government = function() {
			return this.government_base + this.troops + this.police;
		}
		zone.coin = function() {
			return this.coalition() + this.government();
		}
		zone.taliban = function() {
			return this.taliban_base + this.taliban_guerrilla();
		}
		zone.warlords = function() {
			return this.warlords_base + this.warlords_guerrilla();
		}
		zone.taliban_guerrilla = function () {
			return this.taliban_guerrilla_active + this.taliban_guerrilla_underground;
		};
		zone.warlords_guerrilla = function () {
			return this.warlords_guerrilla_active + this.warlords_guerrilla_underground;
		};
		zone.bases = function () {
			return this.coalition_base + this.government_base + this.taliban_base + this.warlords_base;
		}
		zone.removeForce = function (piece, amount, preferUnderground) {
			amount = amount || 1;
			var pieceActive = piece+'_active';
			var piece = (piece+'_underground' in this) ? piece+'_underground' : piece;
			preferUnderground = preferUnderground || false || !(pieceActive in this);

			var removed = {
				underground: 0,
				active: 0
			}

			if (amount > this[piece] + this[pieceActive]) msgPush("ASSERT FAILED zone.removeForce(): amount > present");

			for (var i = 0; i < amount; i++) {
				if (preferUnderground || this[pieceActive] == 0) {
					this[piece]--;
					removed.underground++;
				}
				else if (!preferUnderground || this[piece] == 0) {
					this[pieceActive]--;
					removed.active++;
				}
			}
			if (piece.startsWith('warlords'))
				availableForcesWarlords += amount;
			else if (piece.startsWith('coalition'))
				availableForcesCoalition += amount;
			else if (piece.startsWith('taliban'))
				availableForcesTaliban += amount;
			else if (piece.startsWith('police'))
				availableForcesPolice + amount;
			else if (piece.startsWith('troops'))
				availableForcesTroops += amount;

			// active
			if (removed.active) {
				msgPush("# Remove " + removed.active + " " + pieceLabel[pieceActive] + " from " + this.name);
			}
			// underground
			if (removed.underground > 0) {
				msgPush("# Remove " + removed.underground + " " + pieceLabel[piece] + " from " + this.name);
			}

			return removed;
		}
		zone.moveForce = function (toZone, piece, amount, preferUnderground, activate) {
			toZone = fixZoneParameter(toZone);
			var pieceActive = piece+'_active';
			var piece = (piece+'_underground' in this) ? piece+'_underground' : piece;
			preferUnderground = preferUnderground || false;
			activate = activate || false;
			if (!(pieceActive in this)) {
				preferUnderground = true;
				activate = false;
			}
			var moved = {
				underground: 0,
				active: 0
			}

			if (amount > this[piece] + this[pieceActive]) msgPush("ASSERT FAILED zone.moveForce(): amount > present");

			for (var i = 0; i < amount; i++) {
				if (preferUnderground || this[pieceActive] == 0) {
					this[piece]--;
					moved.underground++;
					toZone[activate ? pieceActive : piece]++;
				}
				else if (!preferUnderground || this[piece] == 0) {
					this[pieceActive]--;
					moved.active++;
					toZone[pieceActive]++;
				}
			}

			// active
			if (moved.active) {
				msgPush("# Move " + moved.active + " " + pieceLabel[pieceActive] + " from " + this.name + " to " + toZone.name);
			}
			// underground
			if (moved.underground > 0) {
				msgPush("# Move " + moved.underground + " " + pieceLabel[piece] + " from " + this.name + " to " + toZone.name);
				if (activate)
            		msg[msg.length-1] += " and flip Active";
			}

			return moved;
		}
		zone.activatePiece = function (piece) {
			var undergroundPieceName = piece + '_underground';
			var activePieceName = piece + '_active';
			this[undergroundPieceName]--;
			this[activePieceName]++;

			msgPush('# Activate 1 ' + pieceLabel[piece] + ' in ' + this.name);
		}
		zone.setSupportLevel = function (newLevel) {
			msgPush('# Set ' + this.supportlevel + ' in ' + this.name + ' to ' + newLevel);
			this.supportlevel = newLevel;
		}
		zone.addTerror = function () {
			msgPush('# Place Terror marker in ' + this.name);
			this.terror++;
		}

		// get support level
		if (zoneContains(zone, "Support"))
			zone.supportlevel = "Support";
		else if (zoneContains(zone, "Opposition"))
			zone.supportlevel = "Opposition";
		else
			zone.supportlevel = "Neutral";

		// get control
		zone.getControlValue = function () {
			// 0 = Uncontrolled; <0 = Taliban Control; >0 = COIN Control
			var coinCount = this.coalition_base + this.coalition_troops + this.troops +
				this.police + this.government_base; 
			var talibanCount = this.taliban_base + this.taliban_guerrilla();
			var warlordsCount = this.warlords_base + this.warlords_guerrilla();
			var controlDifference = coinCount - talibanCount;
			if (warlordsCount > 0 && controlDifference != 0) {
				if (Math.abs(controlDifference) <= warlordsCount)
					controlDifference = 0;
				else if (controlDifference < 0) {
					controlDifference += warlordsCount;
				} else {
					controlDifference -= warlordsCount;
				}
			}
			console.log('zone.getControlValue(' + this.name + ') = ' + controlDifference);
			return controlDifference;
		}
		zone.getControl = function () {
			var control = this.getControlValue();
			if (control < 0) return "Taliban Control";
			if (control > 0) return "COIN Control";
			return "Uncontrolled";
		}

		// output status
		zone.print = function () {
			msgPush('* ' + this.name);

			if ('pop' in this) {
				var popstr = this.pop;
				if (this.returnees) popstr += ' (Returnees)';
				msgPush('Population: ' + popstr);
				msgPush('Level: ' + this.supportlevel);
				msgPush('Control: ' + this.getControl());
				if (this.terror)
					msgPush('Terror: ' + this.terror);
			}
			if ('econ' in this) {
				msgPush('Economic Value: ' + this.econ);
			}

			var props = [, "", "troops", "police", "taliban Base", "taliban Guerrilla", "Warlords Base", "Warlords Guerrilla"];
			var props = {
				"coalition_base": "Coalition Base", 
				"coalition_troops": "Coalition Troops",
				"government_base": "GOVT Base", 
				"troops": "Troops", 
				"police": "Police",
				"taliban_base": "Taliban Base",
				"taliban_guerrilla_underground": "Taliban Guerrilla",
				"taliban_guerrilla_active": "Taliban Guerrilla Active",
				"warlords_base": "Warlords Base",
				"warlords_guerrilla_underground": "Warlords Guerrilla",
				"warlords_guerrilla_active": "Warlords Guerrilla Active"
			};
			for (var propkey in props) {
				var label = props[propkey];
				if (this[propkey] > 0) {
					msgPush(this[propkey] + 'x ' + label);
				}
			}
		}
    }
}

function countAtZone(zone, pieceName) {
    zone = fixZoneParameter(zone);

    // count all base and unit pieces, ignore Control pieces
	var count = 0;
    if (pieceName == "*") {
        count = zone.pieces.length;
    }
    else
    {
        for (var j = 0; j < zone.pieces.length; j++) {
            var zonePiece = zone.pieces[j].name; 
            if (zonePiece.startsWith(pieceName) && !zonePiece.endsWith('Control')) count++;
        }
    }
	console.log("countAtZone() " + pieceName + " @ " + zone.name + " = " + count);
	return count;
}

function zoneContains(zone, pieceName) {
    zone = fixZoneParameter(zone);

	for (var i = 0; i < zone.pieces.length; i++) {
		if (zone.pieces[i].name.startsWith(pieceName))
			return true;
	}
	return false;
}

function countAtZoneExact(zone, pieceName) {
    zone = fixZoneParameter(zone);

    // count all base and unit pieces, ignore Control pieces
	var count = 0;
    if (pieceName == "*") {
        count = zone.pieces.length;
    }
    else
    {
        for (var j = 0; j < zone.pieces.length; j++) {
            var zonePiece = zone.pieces[j].name; 
            if (zonePiece == pieceName) count++;
        }
    }
	console.log("countAtZoneExact() " + pieceName + " @ " + zone.name + " = " + count);
	return count;
}

function zoneContainsExact(zone, pieceName) {
    zone = fixZoneParameter(zone);

	for (var i = 0; i < zone.pieces.length; i++) {
		if (zone.pieces[i].name == pieceName)
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

/*
function movePiece(fromZone, toZone, pieceName, preferUnderground, activate) {
    fromZone = fixZoneParameter(fromZone);
    toZone = fixZoneParameter(toZone);
	preferUnderground = preferUnderground || false;
	activate = activate || false;

	console.log('movePiece(' + fromZone.name + ', ' + toZone.name + ', ' + pieceName + ', ' + preferUnderground + ', ' + activate + ')');

    var pieceMoved = fromZone.removeForce(pieceName, 1, preferUnderground);
    if (!pieceMoved) {
        msgPush("ASSERT FAILED movePiece(): origin '" + fromZone + "' has no piece requested for move to '" + toZone.name + "'");
        return false;
    }
    var destinationPiece = pieceMoved;
    if (!pieceMoved.endsWith("Active") && activate) {
        destinationPiece += " Active";
    }
    toZone.pieces.push({name: destinationPiece});
    return pieceMoved;
}

function movePieces(fromZone, toZone, amount, pieceName, preferUnderground, activate) {
	fromZone = fixZoneParameter(fromZone, 'string');
    toZone = fixZoneParameter(toZone);
	preferUnderground = preferUnderground || false;
	activate = activate || false;

	var p = [];
	for (var i = 0; i < amount; i++) {
		p.push(movePiece(fromZone, toZone, pieceName, preferUnderground, activate));
	}
	var pieceNameActive = pieceName + ' Active';
	var activeMoved = count(p, pieceNameActive);
	var undergroundMoved = count(p, pieceName);
	console.log('movePieces(' + fromZone + ', ' + toZone.name + ', ' + pieceName + ', ' + amount + '): ' + activeMoved + ', ' + undergroundMoved);
	// active
	if (activeMoved > 0) {
		msgPush("# Move " + activeMoved + " " + pieceNameActive + " from " + fromZone + " to " + toZone.name);
	}
	// underground
	if (undergroundMoved > 0) {
		msgPush("# Move " + undergroundMoved + " " + pieceName + " from " + fromZone + " to " + toZone.name);
		if (activate)
            msg[msg.length-1] += " and flip Active";
	}
	return p;
}*/

function getZone(zoneName) {
	if (typeof zoneName !== 'string') msgPush('ASSERT FAILED getZone(): zoneName is already a zone');

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
	
	return getZone(kSpacesTable[spaceIndex]);
}

function pickRandomLOC(candidates) {
	// econ 4?
	for (var i = 0; i < candidates.length; i++) {
		if (candidates[i].econ == 4)
			return getZone(candidates[i]);
	}

	// econ 3?
	for (var i = 0; i < candidates.length; i++) {
		if (candidates[i].econ == 3)
			returngetZone(candidates[i]);
	}

	// econ 1
	return getZone(candidates[die(candidates.length)-1]);
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