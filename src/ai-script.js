// setup
var inputData = JSON.parse(inputString);
var msg = [];
var isVerbose = false; //inputData.verbose;
var action = inputData.action;
var coalitionNP = inputData.npcoalition;
var governmentNP = inputData.npgovernment;
var warlordsNP = inputData.npwarlords;
var talibanNP = inputData.nptaliban;
var propagandaCount = inputData.propaganda;
var zones = inputData.zones;
var zoneCount = zones.length;

var governmentResources = 0;
var talibanResources = 0;
var warlordsResources = 0;

var availableForcesCoalition = 0;
var availableForcesTroops = 0;
var availableForcesPolice = 0;
var availableForcesWarlords = 0;
var availableForcesTaliban = 0;

var availableBasesCoalition = 0;
var availableBasesGovernment = 0;
var availableBasesWarlords = 0;
var availableBasesTaliban = 0;

var kMullahOmar = 36;
var kPropaganda = 73;
var kPakistan = ["Balochistan (Pakistan)", "Waziristan (Pakistan)", "Northwest Frontier (Pakistan)"];
var kPashtun = [
	"Nimruz", "Farah", "Helmand", "Zabol", "Oruzgan", "Paktika",
	"Waziristan (Pakistan)", "Khowst", "Ghazni", "Kabul", "Nuristan", 
	"Northwest Frontier (Pakistan)", "Ghowr", "Kandahar"
];
var kNonPashtun = [
    "Balochistan (Pakistan)", "Herat", "Badghis",
	"Baghlan",
	"Konduz", "Badakhshan", "Samangan",
	"Balkh", "Faryab",
	"Sar-e-Pol", "Bamian",
];
var kNonPashtunNonPakistan = [
    "Herat", "Badghis",
	"Baghlan",
	"Konduz", "Badakhshan", "Samangan",
	"Balkh", "Faryab",
	"Sar-e-Pol", "Bamian",
];
var kSpacesTable = [
	"Balochistan (Pakistan)", "Nimruz", "Farah",
	"Herat", "Badghis", "Helmand",
	"Zabol", "Oruzgan", "Paktika",
	"Waziristan (Pakistan)", "Khowst", "Ghazni",
	"Kabul", "Kabul", "Kabul",
	"Nuristan", "Baghlan", "Northwest Frontier (Pakistan)",
	"Konduz", "Badakhshan", "Samangan",
	"Balkh", "Faryab", "Ghowr",
	"Sar-e-Pol", "Bamian", "Kandahar"
];
var kSpacesNonPakistan = [
	"Nimruz", "Farah",
	"Herat", "Badghis", "Helmand",
	"Zabol", "Oruzgan", "Paktika",
	"Khowst", "Ghazni",
	"Kabul",
	"Nuristan", "Baghlan",
	"Konduz", "Badakhshan", "Samangan",
	"Balkh", "Faryab", "Ghowr",
	"Sar-e-Pol", "Bamian", "Kandahar"
];
var kSpaces = [
	"Balochistan (Pakistan)", "Nimruz", "Farah",
	"Herat", "Badghis", "Helmand",
	"Zabol", "Oruzgan", "Paktika",
	"Waziristan (Pakistan)", "Khowst", "Ghazni",
	"Kabul",
	"Nuristan", "Baghlan", "Northwest Frontier (Pakistan)",
	"Konduz", "Badakhshan", "Samangan",
	"Balkh", "Faryab", "Ghowr",
	"Sar-e-Pol", "Bamian", "Kandahar"
];
var kLoCSpaces = [
    "Kabul-Tor Kham LOC",
    "Kabul-Aibak LOC",
    "Shibirghan-Aibak LOC",
    "Farah-Kandahar LOC",
    "Toraghondi-Farah LOC",
    "Kandahar-Spin Boldak LOC",
    "Kandahar-Kabul LOC"
];
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
    "Kabul-Aibak LOC": { econ: 1, adjacencies: [ "Kabul", "Baghlan", "Balkh", "Samangan" ] },
    "Shibirghan-Aibak LOC": { econ: 1, adjacencies: [ "Baghlan", "Balkh", "Faryab", "Sar-e-Pol", "Samangan" ] },
    "Farah-Kandahar LOC": { econ: 1, adjacencies: [ "Farah", "Nimruz", "Helmand", "Kandahar", "Zabol", "Oruzgan", "Ghowr" ] },
    "Toraghondi-Farah LOC": { econ: 1, adjacencies: [ "Badghis", "Ghowr", "Nimruz", "Farah", "Herat" ] },
    "Kandahar-Spin Boldak LOC": { econ: 3, adjacencies: [ "Oruzgan", "Kandahar", "Zabol", "Waziristan (Pakistan)" ] },
    "Kandahar-Kabul LOC": { econ: 1, adjacencies: [ "Kandahar", "Zabol", "Paktika", "Khowst", "Kabul", "Bamian", "Ghazni", "Oruzgan" ] }
};

// utility functions

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

function findResources() {
	for (var i = 0; i < zoneCount; i++) {
		var zone = zones[i];
		var zoneName = zone.name;
		for (var j = 0; j < zone.pieces.length; j++) {
			var pieceName = zone.pieces[j].name;
			if (pieceName.substring(0,14) == "GOVT Resources")
				governmentResources = parseInt(zoneName);
			if (pieceName.substring(0,17) == "Taliban Resources")
				talibanResources = parseInt(zoneName);
			if (pieceName.substring(0,18) == "Warlords Resources")
				warlordsResources = parseInt(zoneName);
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
        if (isVerbose) msg.push('Population ' + key + ' = ' + provinces[key].pop);
    }
}

function zoneContains(zone, pieceName) {
	for (var i = 0; i < zone.pieces.length; i++) {
		if (zone.pieces[i].name.startsWith(pieceName))
			return true;
	}
	return false;
}

function deactivateZonePieces(zoneName, pieceName) {
    var zone = getZone(zoneName);
    var activePieceName = pieceName + ' Active';
    for (var i = 0; i < zone.pieces.length; i++) {
		if (zone.pieces[i].name == activePieceName)
			zone.pieces[i].name = pieceName;
	}
}

function removePiece(zoneName, pieceName) {
    var zone = getZone(zoneName);
    var activePieceName = pieceName + ' Active';
    for (var i = 0; i < zone.pieces.length; i++) {
		if (zone.pieces[i].name == activePieceName) {
			zone.pieces.splice(i, 1);
			return;
		}
	}
	for (var i = 0; i < zone.pieces.length; i++) {
		if (zone.pieces[i].name == pieceName) {
			zone.pieces.splice(i, 1);
			return;
		}
	}
}

function countAtZone(zoneName, pieceName) {
	var count = 0;
	var zone = getZone(zoneName);
	if (zone) {
		if (pieceName == "*") {
			count = zone.pieces.length;
		}
		else
		{
			for (var j = 0; j < zone.pieces.length; j++) {
				if (zone.pieces[j].name.startsWith(pieceName)) count++;
			}
		}
	}
	if (isVerbose) msg.push("countAtZone() " + pieceName + " @ " + zoneName + " = " + count);
	return count;
}

function countBasesAtZone(zoneName) {
	var count = 0;
	var zone = getZone(zoneName);
	if (zone) {
		for (var j = 0; j < zone.pieces.length; j++) {
			var pieceName = zone.pieces[j].name;
			if (pieceName.substring(pieceName.length - 4) == "Base") count++;
		}
	}
	if (isVerbose) msg.push("countBasesAtZone() " + zoneName + " = " + count);
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
//		if (isVerbose) msg.push("getCurrentCard() " + piece.name + " at " + piece.y + " (" + periodIndex + ", " + piece.name.substring(0, periodIndex) + "); " + currentCard + " at " + y);
		if (piece.name.charAt(0) != ' ' && periodIndex > 0 && periodIndex < 3 && piece.y > y) {
			y = piece.y;
			var cardNumber = piece.name.substring(0, periodIndex);
			if (cardNumber.charAt(0) == '0') cardNumber = cardNumber.substring(1);
			currentCard = parseInt(cardNumber);
		}
	}
	if (isVerbose) msg.push("Current Card #" + currentCard);
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
	if (isVerbose) msg.push("Next Card #" + nextCard);
	return nextCard;
}

function getMomentumCards() {
	// TODO!
	if (isVerbose) msg.push("getMomentumCards() TODO");
	return [];
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
	
	if (isVerbose) msg.push("pickRandomZone() BLACK=" + blackDie + ", TAN=" + tanDie + ", GREEN=" + greenDie);
	
	blackDie = Math.ceil(blackDie / 2) - 1;
	tanDie = Math.ceil(tanDie / 2) - 1;
	greenDie = Math.ceil(greenDie / 2) - 1;
	
	var spaceIndex = (tanDie * 9) + (blackDie * 3) + greenDie;
	var safety = kSpacesTable.length + 1;
	
	if (isVerbose) msg.push("pickRandomZone() rolled " + kSpacesTable[spaceIndex]);
	
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
		
	if (isVerbose) msg.push("pickRandomZone() selected " + kSpacesTable[spaceIndex]);
	
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
	if (isVerbose) msg.push("placePieceInsurgent(" + faction + ", " + candidates + ")");

	var availableBases = faction == "Warlords" ? availableBasesWarlords : availableBasesTaliban;
	var availableForces = faction == "Warlords" ? availableForcesWarlords : availableForcesTaliban;

	var zone = false;
	if (availableBases > 0) {
		zone = pickRandomZone(candidates, function(z) { return countBasesAtZone(z) < 2; });
		
		if (zone) {
			msg.push("# Place " + faction + " Base in " + zone);
		} else {
			if (isVerbose) msg.push("No spaces to place " + faction + " base");
		}
	}
	if (!zone && availableForces > 0) {
		zone = pickRandomZone(candidates);
		
		if (zone) {
			msg.push("# Place " + faction + " Guerilla in " + zone);
		} else {
			if (isVerbose) msg.push("No spaces to place " + faction + " guerilla");
		}
	}
	
	return zone;
}

// AI

function warlordsEvent() {
	if (isVerbose) msg.push("warlordsEvent() for card " + currentCard);

	// only do capability / islamabad if Taliban is a NP, otherwise Ops
	if ((isCardCapability() || isIslamabadCard()) && !talibanNP) {
		if (isVerbose) msg.push("Rejecting Capability/Islamabad card");
		return false;
	}
	
	if (isCardCapability()) {
		msg.push("# PLAY EVENT");
		msg.push("# PLACE CAPABILITY - SHADED");
		return true;
	}
	
	// only do momentum card (other than Mullah Omar) when next card is not propaganda
	if (isCardMomentum() && !(currentCard == kMullahOmar) && (nextCard == kPropaganda)) {
		if (isVerbose) msg.push("Rejecting Momentum card");
		return false;
	}
		
	switch (currentCard) {
		case 4: // #2 Is Dead
			if (!talibanNP) {
				if (isVerbose) msg.push("Rejecting (8.1)");
				return false;
			}
			
			msg.push("# PLAY EVENT");
			
			// place piece in Pakistan
			placePieceInsurgent("Taliban", kPakistan);
			
			// Add d6 resource to Taliban
			msg.push("# Add " + d6() + " Taliban Resources");
			
			return true;
		
		case 6: // US-Pakistan Talks
		case 8: // SEAL Team 6
			if (zoneContains(getZone("Islamabad: Sponsorship"), "Islamabad")) return false;
			msg.push("# PLAY EVENT");
			msg.push("# Shift Islamabad 2 boxes toward Sponsorship");
			return true;
			
		case 9: // Special Forces
			if (zoneContains(getZone("Islamabad: Sponsorship"), "Islamabad")) return false;
			if (filterZones([ "Zabol", "Paktika", "Khowst", "Nuristan", "Badakhshan", "Kandahar" ],
				function (zone) {
					return zoneContains(zone, "Coalition Troops") || zoneContains(zone, "Coalition Base");
				}).length > 0) {
				msg.push("# PLAY EVENT");
				msg.push("# Shift Islamabad 2 boxes toward Sponsorship");
				return true;
			}
			return false;
			
		case 13: // Anti-Corruption Drive
			return false;
			
		case 14: // Economic Project
			var count = filterZones(kSpaces, function (zone) {
				return ((zoneContains(zone, "Coalition Base") || zoneContains(zone, "GOVT Base")) &&
					(zoneContains(zone, "Warlords Guerrilla") || zoneContains(zone, "Warlords Base")));
			}).length;
			
			if (count > 0) {
				msg.push("# PLAY EVENT");
				msg.push("# Warlords gain " + (count * 3) + " Resources");
				return true;
			}
			
			return false;
			
		case 15: // One Tribe at a Time
			
		
			return false;
			
		case 59: // Local Truce
			if (governmentResources == 0) return false;
			msg.push("# PLAY EVENT");
			msg.push("# Transfer " + (governmentResources > 6 ? 6 : governmentResources) + " Government Resources to Warlords");
			return true;
			
		default:
			msg.push("ERROR: unknown event card");
			return false;
	}
}

function warlordsOperation() {
    // check for 0 resources
    if (warlordsResources == 0) {
        // no Resources to do any ops
        msg.push('# PASS');
        return;
    }
    
    var loopCount = 1;
    var activatedProvinces = false;
    while (loopCount > 0 && loopCount <= 2) {
        // available warlord forces
        var tryRally = false;
        var didRally = false;
        if (availableForcesWarlords >= 6) {
            // Rally, in up to three provinces
            tryRally = true;
            if (isVerbose) msg.push("Should Rally");
            didRally = activatedProvinces = warlordsRally();
        }
    
        var tryMarch = false;
        var didMarch = false;
        if (true || !didRally && (tryRally || ((12 - availableBasesWarlords) + warlordsResources) <= 50)) {
            // March?
            tryMarch = true;
            if (isVerbose) msg.push("Should March");
            didMarch = activatedProvinces = warlordsMarch();
        }
    
        var tryTerror = false;
        var didTerror = false;
        if (!didRally && !didMarch) {
            // Terror?
            tryTerror = true;
            if (isVerbose) msg.push("Should Terror");
            didTerror = warlordsTerror();
        }
        
        if (!didRally && !didMarch && !didTerror) {
            loopCount++;
        } else {
            loopCount = -1;
        }
    }
	
	if (loopCount > 0) {
	    // Couldn't do any operation twice
	    msg.push('# PASS');
        return;
	}
	
	// special operation
	var didCultivateTraffic = false;
	if (didRally || didMarch) {
	    // Cultivate
	    if (!warlordsCultivate(activatedProvinces)) {
	        // Traffic
	        if (warlordsTraffic())
	            didCultivateTraffic = true;
	    } else {
	        didCultivateTraffic = true;
	    }
	}
	
	if (didTerror || !didCultivateTraffic) {
	    // Suborn
	    warlordsSuborn();
	}
}

function warlordsRallyActivateZone(zoneName) {
    var baseCount = countAtZone(zoneName, 'Warlords Base');
    if (baseCount > 0 && contains(kNonPashtun, zoneName)) {
        // place pop + bases
        var addforces = provinces[zoneName].pop + baseCount;
        var count = 0;
        while (count < addforces && availableForcesWarlords > 0) {
            getZone(zoneName).pieces.push({name: 'Warlords Guerrilla'}); availableForcesWarlords--;
            count++;
        }
        msg.push('# Place ' + count + ' Warlords Guerrillas in ' + zoneName);
    } else {
        // place 1
        msg.push('# Place 1 Warlords Guerrilla in ' + zoneName);
        getZone(zoneName).pieces.push({name: 'Warlords Guerrilla'}); availableForcesWarlords--;
    }
    warlordsResources--;
}

// return true is Rally performance, false is couldn't Rally
function warlordsRally() {
    msg.push('# Rally');
    provinces = 3;
    
    var activatedProvinces = [];
    
    while (provinces > 0 && warlordsResources > 0) {
        var selected = false;
        
        // condition 1: Find province with Warlord Guerrillas Active, Warlords Base, and Cube
        var activeGuerrillaProvinces = filterZones(kNonPashtunNonPakistan, function (zone) {
            if (contains(activatedProvinces, zone.name)) return false;
            
            var base = false;
            var cube = false;
            var guerilla = false;
            var allactive = true;
            
            for (var i = 0; i < zone.pieces.length; i++) {
                if (zone.pieces[i].name == "Warlords Base")
                    base = true;
                if (zone.pieces[i].name == "Coalition Troops" || zone.pieces[i].name == "Troops" || zone.pieces[i].name == "Police")
                    cube = true;
                if (zone.pieces[i].name.startsWith("Warlords Guerrilla")) {
                    guerilla = true;
                    if (zone.pieces[i].name != "Warlords Guerrilla Active")
                        allactive = false;
                }
            }
            return base && cube && guerilla && allactive;
        });
        if (activeGuerrillaProvinces.length > 0) {
            selected = pickRandomZone(activeGuerrillaProvinces);
            activatedProvinces.push(selected);
            msg.push('# Flip all Guerrillas Underground in ' + selected);
            deactivateZonePieces(selected, 'Warlords Guerrilla');
            warlordsResources--;
            provinces--;
        }
        
        if (!selected && availableBasesWarlords > 0) {
            // condition 2: Find province where 2 Warlords Guerrillas can create a Warlords Base
            var baseProvinces = filterZones(kSpacesNonPakistan, function (zone) {
                if (contains(activatedProvinces, zone.name)) return false;
                return countBasesAtZone(zone.name) < 2 && countAtZone(zone.name, "Warlords Guerrilla") >= 2;
            });
            if (baseProvinces.length > 0) {
                selected = pickRandomZone(baseProvinces);
                activatedProvinces.push(selected);
                msg.push('# Replace 2 Warlords Guerrillas with Warlords Base in ' + selected);
                removePiece(selected, 'Warlords Guerrilla'); availableForcesWarlords++;
                removePiece(selected, 'Warlords Guerrilla'); availableForcesWarlords++;
                getZone(selected).pieces.push({name: 'Warlords Base'}); availableBasesWarlords--;
                warlordsResources--;
                provinces--;
            }
        }
        
        // condition 3: weighted random
        if (!selected && availableForcesWarlords > 0) {
            // 3.1: Base but no Guerrillas
            var baseProvinces = filterZones(kSpacesNonPakistan, function (zone) {
                if (contains(activatedProvinces, zone.name)) return false;
                return countAtZone(zone.name, "Warlords Base") > 0 && countAtZone(zone.name, 'Warlords Guerrilla') == 0;
            });
            if (baseProvinces.length > 0) {
                selected = pickRandomZone(baseProvinces);
                activatedProvinces.push(selected);
                warlordsRallyActivateZone(selected);
                provinces--;
            }
        }
        
        if (!selected && availableForcesWarlords > 0) {
            // 3.2: Guerrillas but no Bases
            var baseProvinces = filterZones(kSpacesNonPakistan, function (zone) {
                if (contains(activatedProvinces, zone.name)) return false;
                return countAtZone(zone.name, "Warlords Base") == 0 && zoneContains(zone, 'Warlords Guerrilla');
            });
            if (baseProvinces.length > 0) {
                selected = pickRandomZone(baseProvinces);
                activatedProvinces.push(selected);
                warlordsRallyActivateZone(selected)
                provinces--;
            }
        }
        
        if (!selected) {
            // 3.3: Somewhere to Cultivate if not yet possible
            // check to see if Cultivate can already be done
            var baseProvinces = filterZones(activatedProvinces, function (zone) {
                return countBasesAtZone(zone.name) < 2 && countAtZone(zone.name, 'Warlords Guerrilla') > countAtZone(zone.name, 'Police');
            });
            if (baseProvinces.length == 0) {
                // check to see if we can activate a province to make it Cultivate-able
                var baseProvinces = filterZones(kSpacesNonPakistan, function (zone) {
                    if (contains(activatedProvinces, zone.name)) return false;
                    return countBasesAtZone(zone.name) < 2 && countAtZone(zone.name, 'Warlords Guerrilla') >= countAtZone(zone.name, 'Police');
                });
                if (baseProvinces.length > 0) {
                    // found a province that we can activate to cultivate at
                    selected = pickRandomZone(baseProvinces);
                    activatedProvinces.push(selected);
                    warlordsRallyActivateZone(selected);
                    provinces--;
                }
            }
        }
        
        if (!selected && availableForcesWarlords > 0) {
            // 3.4: Random
            var baseProvinces = filterZones(kSpacesNonPakistan, function (zone) {
                if (contains(activatedProvinces, zone.name)) return false;
                return true;
            });
            if (baseProvinces.length > 0) {
                selected = pickRandomZone(baseProvinces);
                activatedProvinces.push(selected);
                warlordsRallyActivateZone(selected)
                provinces--;
            }
        }
        
        if (!selected) {
            if (provinces == 3) {
                msg.pop();
                return false;
            }
            provinces = 0;
        }
    }
    
    msg.push('# Set Warlords Resources to ' + warlordsResources);
    return activatedProvinces;
}

function warlordsMarch() {
    msg.push('# March');
    
    var activatedProvinces = [];
    
    console.log(kSpacesNonPakistan);
    // find valid origin provinces for March
    var origin = filterZones(kSpacesNonPakistan, function (zone) {
        return true;
    });
    
    // march to 1 empty LoC
}

function warlordsTerror() {

}

function warlordsCultivate(activatedProvinces) {
    var selected = false;

    // find province to Cultivate
    msg.push('# Cultivate');
    
    var baseProvinces = filterZones(activatedProvinces, function (zone) {
        return countBasesAtZone(zone.name) < 2 && countAtZone(zone.name, 'Warlords Guerrilla') > countAtZone(zone.name, 'Police');
    });
    if (baseProvinces.length > 0) {
        // found a province that we can activate to cultivate at
        var withBase = filterZones(baseProvinces, function (zone) {
            return countAtZone(zone.name, 'Warlords Base') > 0;
        });
        if (withBase.length > 0)
            baseProvinces = withBase;
        selected = pickRandomZone(baseProvinces);
        
        msg.push('# Place 1 Warlords Base in ' + selected);
        getZone(selected).pieces.push({name: 'Warlords Base'}); availableBasesWarlords--;
    } else {
        msg.pop();
    }
    
    return selected;
}

function warlordsTraffic() {

}

function warlordsSuborn() {

}

// should consider event?

var considerEvent = !((countAtZone("1st Faction Op Only", "*") > 0) || (countAtZone("1st Faction Event", "*") > 0));

// find cards

var currentCard = getCurrentCard();
var nextCard = getNextCard();
var momentum = getMomentumCards();

// init functions

findResources();
findAvailableForces();
adjustForReturnees();

// verbose setup

msg.push("# Activated Bot: " + action);

if (isVerbose) {
	msg.push("Propaganda cards left in deck = " + propagandaCount);
	msg.push("Consider playing event = " + considerEvent);
	msg.push("Resources: GOVT=" + governmentResources + ", Taliban=" + talibanResources + ", Warlords=" + warlordsResources);
	
	var np = "";
	if (coalitionNP) np = "Coalition";
	if (governmentNP) {
		if (np > "") np += ", ";
		np += "Government";
	}
	if (warlordsNP) {
		if (np > "") np += ", ";
		np += "Warlords";
	}
	if (talibanNP) {
		if (np > "") np += ", ";
		np += "Taliban";
	}
	if (np > "") msg.push("Non-Player = " + np);
// 	msg.push("******************"); 
// 	msg.push(JSON.stringify(inputData));
// 	msg.push("******************");
}

// Warlords

if (action == "Warlords") {
	// event card
	var playedEvent = false;
	/*
	if (considerEvent) {
		if (isVerbose) msg.push("Evaluating event");
		playedEvent = warlordsEvent();
	}
	*/
	
	if (!playedEvent) {
		if (isVerbose) msg.push("Finding operation to perform");
		warlordsOperation();
	}
}

// final

msg.push('# Bot Complete');

msg = msg.join("\n");
