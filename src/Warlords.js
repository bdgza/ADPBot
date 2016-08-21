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
    var activatedProvinces = [];
    while (loopCount > 0 && loopCount <= 2) {
        // available warlord forces
        var tryRally = false;
        var didRally = false;
        if (availableForcesWarlords >= 6) {
            // Rally, in up to three provinces
            tryRally = true;
            console.log("Should Rally");
            didRally = activatedProvinces = warlordsRally();
        }
    
        var tryMarch = false;
        var didMarch = false;
        if (!didRally && (tryRally || ((12 - availableBasesWarlords) + warlordsResources) <= 50)) {
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

    var warlordsBases = countAtZone(zone.name, "Warlords Base");
    var warlordsForces = countAtZone(zone.name, "Warlords Guerrilla");
    var controlCounts = zoneControlCounts(zone);
    var controlDifference = controlCounts.controlDifference;
    var warlordAdvantage =  controlCounts.warlords + Math.min(controlCounts.taliban, controlCounts.coin) -
        Math.max(controlCounts.taliban, controlCounts.coin);
    if (warlordAdvantage < 0) warlordAdvantage = 0;
    var canMove = (controlDifference != 0) ? warlordsForces : Math.min(warlordAdvantage, warlordsForces);
    if (canMove > 0 && zoneContains(zone, "Warlords Base") && canMove == warlordsForces)
        canMove--;
    console.log("warlordsCanMarch(" + zone.name + "): F=" + warlordsForces + ", B=" + warlordsBases + " -> " +
        warlordAdvantage + "/" + controlDifference + " => " + canMove);
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

        movePieces(selected, loc, 1, 'Warlords Guerrilla', false, true);
        return selected;
    }
    return false;
}

function warlordsMarchCanChangeControl(zone, activatedProvinces) {
    zone = fixZoneParameter(zone);
    var province = provinces[zone.name];
    var adjacencies = province.adjacencies;

    var controlDifference = Math.abs(zoneControl(zone));
    var availableForces = warlordsAdjacentForMarch(zone, activatedProvinces);
    
    console.log('avail ' + zone.name + ': ' + availableForces + ' >= ' + controlDifference);
    return availableForces >= controlDifference;
}

function warlordsAdjacentForMarch(zone, activatedProvinces) {
    zone = fixZoneParameter(zone);
    var province = provinces[zone.name];
    var adjacencies = province.adjacencies;

    var availableForces = 0;
    for (var i = 0; i < adjacencies.length; i++)
        if (!contains(activatedProvinces, adjacencies[i]))
            availableForces += warlordsCanMarch(getZone(adjacencies[i]));

    console.log('adj ' + zone.name + ': ' + availableForces);

    return availableForces;
}

function warlordsMarchAllAdjacent(zone, activatedProvinces) {
    zone = fixZoneParameter(zone);
    var province = provinces[zone.name];
    var adjacencies = province.adjacencies;
    var movedAny = false;

    for (var i = 0; i < adjacencies.length; i++)
        if (!contains(activatedProvinces, adjacencies[i])) {
            var availableForces = warlordsCanMarch(getZone(adjacencies[i]));
            if (availableForces > 0) {
                console.log('warlordsMarchAllAdjacent(' + zone.name + '): ' + adjacencies[i] + ' == ' + availableForces);
                var mustActivate = contains(kNonPashtun, zone.name); // must activate if going to Pashtun
                if (!mustActivate) {
                    // count the number of Guerrillas to see if must activate
                    var destCount = countAtZone(zone, 'Taliban Guerrilla');
                    mustActivate = (availableForces + destCount) > 3;
                }
                var p = movePieces(adjacencies[i], zone, availableForces, "Warlords Guerrilla", !mustActivate, mustActivate);
                movedAny = movedAny || p.length > 0;
            }
        }

    return movedAny;
}

function warlordsMarch() {
    msgPush('# March');
    
    var activatedProvinces = [];
    
    // find valid origin provinces for March
    var origin = filterZones(kSpacesNonPakistan, function (zone) {
        return warlordsCanMarch(zone) > 0;
    });
    for (var i = 0; i < origin.length; i++) {
        console.log(origin[i] + ' -> ' + warlordsCanMarch(origin[i]));
    }
    
    // march to 1 empty LoC
    var movedLOC = false;
    // try (4) LoC
    if (!movedLOC) {
        var selected = false;
        console.log('LOC(4)');
        if (countAtZone(kLoCSpaces[0], "*") == 1)
            movedLOC = selected = warlordsMarchToLOC(origin, kLoCSpaces[0]);
        if (movedLOC)
            activatedProvinces.push(selected);
    }
    // try (3) LoC
    if (!movedLOC) {
        var selected = false;
        console.log('LOC(3)');
        if (countAtZone(kLoCSpaces[1], "*") == 1)
            movedLOC = selected = warlordsMarchToLOC(origin, kLoCSpaces[1]);
        if (movedLOC)
            activatedProvinces.push(selected);
    }
    // try random LoC
    if (!movedLOC) {
        console.log('LOC(random)');
        startLOC = Math.floor((Math.random() * (kLoCSpaces.length-2)) + 2);
        indexLOC = startLOC;
        do {
            var selected = false;
            if (countAtZone(kLoCSpaces[indexLOC], "*") == 1)
                movedLOC = selected = warlordsMarchToLOC(origin, kLoCSpaces[indexLOC]);
            if (movedLOC)
                activatedProvinces.push(selected);
            indexLOC++;
            if (indexLOC > (kLoCSpaces.length-1)) indexLOC = 2;
        } while (!movedLOC && indexLOC != startLOC);
    }

    // move to Provinces where doing so removes COIN/Taliban Control
    var movedForControl = false;
    if (warlordsResources > 0) {
        var origin = filterZones(kSpacesNonPakistan, function (zone) {
            return zoneControl(zone);
        });
        var p = 4;
        while (p >= 0 && warlordsResources > 0) {
            var popZones = filterZones(origin, function (zone) {
                if (contains(activatedProvinces, zone.name)) return false;
                return (provinces[zone.name].pop == p && warlordsMarchCanChangeControl(zone, activatedProvinces));
            });
            if (popZones.length == 0) {
                p--;
            } else {
                var selected = pickRandomZone(popZones);
                activatedProvinces.push(selected);
                warlordsMarchAllAdjacent(selected, activatedProvinces);
                warlordsResources--;
                movedForControl = true;
            }
        }
    }

    // move to random province, first look for random province that can support Cultivate
    var movedRandom = false;
    if (warlordsResources > 0) {
        // find random province that can be activated for Cultivate
        var baseProvinces = filterZones(kSpacesNonPakistan, function (zone) {
            if (contains(activatedProvinces, zone.name)) return false;
            var adj = warlordsAdjacentForMarch(zone, activatedProvinces);
            var cnt = countAtZone(zone.name, 'Warlords Guerrilla');
            if (cnt + adj == 0) return false;
            return countBasesAtZone(zone.name) < 2 && 
                (cnt + adj) > countAtZone(zone.name, 'Police');
        });
        if (baseProvinces.length > 0) {
            // found a province that we can activate to cultivate at
            selected = pickRandomZone(baseProvinces);
            console.log('RandomCultivate ' + selected);
            activatedProvinces.push(selected);
            var movedAny = warlordsMarchAllAdjacent(selected, activatedProvinces);
            warlordsResources--;
            movedRandom = true;
            if (!movedAny)
                msgPush('# Activate ' + selected + ' for March');
        }
        if (!movedRandom) {
            // just find a random zone to activate for march
            var baseProvinces = filterZones(kSpacesNonPakistan, function (zone) {
                if (contains(activatedProvinces, zone.name)) return false;
                return warlordsAdjacentForMarch(zone, activatedProvinces) > 0;
            });
            if (baseProvinces.length > 0) {
                // found a province that we can activate randomly
                selected = pickRandomZone(baseProvinces);
                console.log('RandomAny ' + selected);
                var movedAny = warlordsMarchAllAdjacent(selected, activatedProvinces);
                if (movedAny) {
                    activatedProvinces.push(selected);
                    warlordsResources--;
                    movedRandom = true;
                }
            }
        }
    }

    if (!movedLOC && !movedForControl && !movedRandom) {
        msgPop();
        return false;
    }

    msgPush('# Set Warlords Resources to ' + warlordsResources);
    return activatedProvinces;
}

function warlordsTerror() {
    msgPush('# Terror');

    if (warlordsResources == 0) return false;

    // if NP Coalition at Opposition space
    if (coalitionNP) {
        var baseProvinces = filterZones(kSpacesNonPakistan, function (zone) {
            return zoneContainsExact(zone, 'Warlords Guerrilla') && zoneContains(zone, 'Opposition');
        });
        if (baseProvinces.length > 0) {
            // found a province that we can terror
            selected = pickRandomZone(baseProvinces);
            
            msgPush('# Activate 1 Warlords Guerrilla in ' + selected);
            msgPush('# Place Terror marker in ' + selected);
            msgPush('# Set Opposition in ' + selected + ' to Neutral');
            activatePiece(selected, 'Warlords Guerrilla');
            warlordsResources--;
            msgPush('# Set Warlords Resources to ' + warlordsResources);
            return true;
        }
    }

    // if NP Taliban at Support space
    if (talibanNP) {
        var baseProvinces = filterZones(kSpacesNonPakistan, function (zone) {
            return zoneContainsExact(zone, 'Warlords Guerrilla') && zoneContains(zone, 'Support');
        });
        if (baseProvinces.length > 0) {
            // found a province that we can terror
            selected = pickRandomZone(baseProvinces);
            
            msgPush('# Activate 1 Warlords Guerrilla in ' + selected);
            msgPush('# Place Terror marker in ' + selected);
            msgPush('# Set Support in ' + selected + ' to Neutral');
            activatePiece(selected, 'Warlords Guerrilla');
            warlordsResources--;
            msgPush('# Set Warlords Resources to ' + warlordsResources);
            return true;
        }
    }

    // random support or opposition space
    var baseProvinces = filterZones(kSpacesNonPakistan, function (zone) {
        return zoneContainsExact(zone, 'Warlords Guerrilla') && 
            (zoneContains(zone, 'Support') || zoneContains(zone, 'Opposition'));
    });
    if (baseProvinces.length > 0) {
        // found a province that we can terror
        selected = pickRandomZone(baseProvinces);

        var level = zoneContains(selected, 'Opposition') ? 'Opposition' : 'Support';
        
        msgPush('# Activate 1 Warlords Guerrilla in ' + selected);
        msgPush('# Place Terror marker in ' + selected);
        msgPush('# Set ' + level + ' in ' + selected + ' to Neutral');
        activatePiece(selected, 'Warlords Guerrilla');
        warlordsResources--;
        msgPush('# Set Warlords Resources to ' + warlordsResources);
        return true;
    }

    msgPop();

    return false;
}

function warlordsCultivate(activatedProvinces) {
    var selected = false;

    if (availableBasesWarlords == 0) return false;

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
    if (contains(momentum, '59. Local Truce')) return false;
    var halfIncome = contains(momentum, '58. Counter-Narc');
    
}

function warlordsSuborn() {

}