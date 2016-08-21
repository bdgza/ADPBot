// AI

function warlordsEvent() {
	console.log("warlordsEvent() for card " + currentCard);

	// only do capability / islamabad if Taliban is a NP, otherwise Ops
	if ((isCardCapability() || isIslamabadCard()) && !talibanNP) {
		console.log("Rejecting Capability/Islamabad card");
		return false;
	}
	
	if (isCardCapability()) {
		msgPush("# PLAY EVENT");
		msgPush("# PLACE CAPABILITY - SHADED");
		return true;
	}
	
	// only do momentum card (other than Mullah Omar) when next card is not propaganda
	if (isCardMomentum() && !(currentCard == kMullahOmar) && (nextCard == kPropaganda)) {
		console.log("Rejecting Momentum card");
		return false;
	}
		
	switch (currentCard) {
		case 4: // #2 Is Dead
			if (!talibanNP) {
				console.log("Rejecting (8.1)");
				return false;
			}
			
			msgPush("# PLAY EVENT");
			
			// place piece in Pakistan
			placePieceInsurgent("Taliban", kPakistan);
			
			// Add d6 resource to Taliban
			msgPush("# Add " + d6() + " Taliban Resources");
			
			return true;
		
		case 6: // US-Pakistan Talks
		case 8: // SEAL Team 6
			if (zoneContains(getZone("Islamabad: Sponsorship"), "Islamabad")) return false;
			msgPush("# PLAY EVENT");
			msgPush("# Shift Islamabad 2 boxes toward Sponsorship");
			return true;
			
		case 9: // Special Forces
			if (zoneContains(getZone("Islamabad: Sponsorship"), "Islamabad")) return false;
			if (filterZones([ "Zabol", "Paktika", "Khowst", "Nuristan", "Badakhshan", "Kandahar" ],
				function (zone) {
					return zoneContains(zone, "Coalition Troops") || zoneContains(zone, "Coalition Base");
				}).length > 0) {
				msgPush("# PLAY EVENT");
				msgPush("# Shift Islamabad 2 boxes toward Sponsorship");
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
				msgPush("# PLAY EVENT");
				msgPush("# Warlords gain " + (count * 3) + " Resources");
				return true;
			}
			
			return false;
			
		case 15: // One Tribe at a Time
			
		
			return false;
			
		case 59: // Local Truce
			if (governmentResources == 0) return false;
			msgPush("# PLAY EVENT");
			msgPush("# Transfer " + (governmentResources > 6 ? 6 : governmentResources) + " Government Resources to Warlords");
			return true;
			
		default:
			msgPush("ERROR: unknown event card");
			return false;
	}
}

function warlordsOperation() {
    // check for 0 resources
    if (warlordsResources == 0) {
        // no Resources to do any ops
        msgPush('# PASS');
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
            console.log("Should Rally");
            // didRally = activatedProvinces = warlordsRally();
        }
    
        var tryMarch = false;
        var didMarch = false;
        if (true || !didRally && (tryRally || ((12 - availableBasesWarlords) + warlordsResources) <= 50)) {
            // March?
            tryMarch = true;
            console.log("Should March");
            didMarch = activatedProvinces = warlordsMarch();
        }
    
        var tryTerror = false;
        var didTerror = false;
        if (!didRally && !didMarch) {
            // Terror?
            tryTerror = true;
            console.log("Should Terror");
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
	    msgPush('# PASS');
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
        msgPush('# Place ' + count + ' Warlords Guerrillas in ' + zoneName);
    } else {
        // place 1
        msgPush('# Place 1 Warlords Guerrilla in ' + zoneName);
        getZone(zoneName).pieces.push({name: 'Warlords Guerrilla'}); availableForcesWarlords--;
    }
    warlordsResources--;
}

// return true is Rally performance, false is couldn't Rally
function warlordsRally() {
    msgPush('# Rally');
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
            msgPush('# Flip all Guerrillas Underground in ' + selected);
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
                msgPush('# Replace 2 Warlords Guerrillas with Warlords Base in ' + selected);
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
                msgPop();
                return false;
            }
            provinces = 0;
        }
    }
    
    msgPush('# Set Warlords Resources to ' + warlordsResources);
    return activatedProvinces;
}

function warlordsCanMarch(zone) {
    zone = fixZoneParameter(zone);

    var coinCount = countAtZone(zone.name, "Coalition ") + countAtZone(zone.name, "Troops") +
        countAtZone(zone.name, "Police") + countAtZone(zone.name, "GOVT Base");
    var talibanCount = countAtZone(zone.name, "Taliban ");
    var warlordsCount = countAtZone(zone.name, "Warlords ");
    var controlDifference = Math.abs(coinCount - talibanCount);
    var canMove = warlordsCount;
    if (warlordsCount > controlDifference)
        canMove = warlordsCount - controlDifference;
    else
        canMove = 0;
    if (canMove > 0 && zoneContains(zone, "Warlords Base"))
        canMove--;
    console.log("warlordsCanMarch() " + zone.name + ": " + coinCount + ", " + talibanCount + ", " + warlordsCount + " -> " + controlDifference + " => " + canMove);
    return canMove;
}

function warlordsMarchToLOC(origin, loc) {
    var locOrigin = filterZones(origin, function (zone) {
        console.log('filter ' + loc + ';' + zone.name + ': ' + isAdjacent(locs[loc], zone)); 
        return isAdjacent(locs[loc], zone);
    })
    for (var i = 0; i < locOrigin.length; i++) {
        console.log('warlordsMarchToLOC() ' + loc + ' -> ' + warlordsCanMarch(loc));
    }
    if (locOrigin.length > 0) {
        // move to LOC
        var selected = pickRandomZone(locOrigin);

        var pieceMoved = movePiece(selected, loc, 'Warlords Guerrilla', true);
        msgPush("# Move 1 " + pieceMoved + " from " + selected + " to " + loc);
        if (!pieceMoved.endsWith("Active")) {
            msg[msg.length-1] += " and flip Active";
        }
        return true;
    }
    return false;
}

function warlordsMarch() {
    msgPush('# March');
    
    var activatedProvinces = [];
    
    // find valid origin provinces for March
    var origin = filterZones(kSpacesNonPakistan, function (zone) {
        return warlordsCanMarch(zone) > 0;
    });
    for (var i = 0; i < origin.length; i++) {
        console.log(origin[i] + ' -> ' + warlordsCanMarch(getZone(origin[i])));
    }
    
    // march to 1 empty LoC
    var movedLOC = false;
    // try (4) LoC
    if (!movedLOC) {
        console.log('LOC(4)');
        if (countAtZone(kLoCSpaces[0], "*") == 1)
            movedLOC = warlordsMarchToLOC(origin, kLoCSpaces[0]);
    }
    // try (3) LoC
    if (!movedLOC) {
        console.log('LOC(3)');
        if (countAtZone(kLoCSpaces[1], "*") == 1)
            movedLOC = warlordsMarchToLOC(origin, kLoCSpaces[1]);
    }
    // try random LoC
    if (!movedLOC) {
        console.log('LOC(random)');
        startLOC = Math.floor((Math.random() * (kLoCSpaces.length-2)) + 2);
        indexLOC = startLOC;
        do {
            if (countAtZone(kLoCSpaces[indexLOC], "*") == 1)
                movedLOC = warlordsMarchToLOC(origin, kLoCSpaces[indexLOC]);
            indexLOC++;
            if (indexLOC > (kLoCSpaces.length-1)) indexLOC = 2;
        } while (!movedLOC && indexLOC != startLOC);
    }

    return true;
}

function warlordsTerror() {

}

function warlordsCultivate(activatedProvinces) {
    var selected = false;

    // find province to Cultivate
    msgPush('# Cultivate');
    
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
        
        msgPush('# Place 1 Warlords Base in ' + selected);
        getZone(selected).pieces.push({name: 'Warlords Base'}); availableBasesWarlords--;
    } else {
        msgPop();
    }
    
    return selected;
}

function warlordsTraffic() {

}

function warlordsSuborn() {

}