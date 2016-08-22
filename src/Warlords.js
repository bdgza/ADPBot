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
	    // Cultivate or Traffic
	    didCultivateTraffic = warlordsCultivate(activatedProvinces) || warlordsTraffic();
	}
	
    var didSuborn = false;
	if (didTerror || !didCultivateTraffic) {
	    // Suborn
	    didSuborn = warlordsSuborn();
	}

    if (!didCultivateTraffic && !didSuborn) {
        msgPush('# No Special Activity');
    }
}

function warlordsRallyActivateZone(zone) {
    zone = fixZoneParameter(zone);
    var baseCount = zone.warlords_base;
    if (baseCount > 0 && contains(kNonPashtun, zone.name)) {
        // place pop + bases
        var addforces = zone.pop + baseCount;
        var count = addforces > availableForcesWarlords ? availableForcesWarlords : addforces;
        zone.warlords_guerrilla_underground += count;
        availableForcesWarlords -= count;
        msgPush('# Place ' + count + ' Warlords Guerrillas in ' + zone.name);
    } else {
        // place 1
        msgPush('# Place 1 Warlords Guerrilla in ' + zone.name);
        zone.warlords_guerrilla_underground++;
        availableForcesWarlords--;
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
            
            return zone.warlords_base && 
                (zone.coalition_troops + zone.troops + zone.police) &&
                zone.warlords_guerrilla_active &&
                !zone.warlords_guerrilla_underground;
        });
        if (activeGuerrillaProvinces.length > 0) {
            selected = pickRandomZone(activeGuerrillaProvinces);
            activatedProvinces.push(selected.name);
            msgPush('# Flip all Guerrillas Underground in ' + selected.name);
            selected.warlords_guerrilla_underground += selected.warlords_guerrilla_active;
            selected.warlords_guerrilla_active = 0;
            warlordsResources--;
            provinces--;
        }
        
        if (!selected && availableBasesWarlords > 0) {
            // condition 2: Find province where 2 Warlords Guerrillas can create a Warlords Base
            var baseProvinces = filterZones(kSpacesNonPakistan, function (zone) {
                if (contains(activatedProvinces, zone.name)) return false;
                return zone.bases() < 2 && zone.warlords_guerrilla() >= 2;
            });
            if (baseProvinces.length > 0) {
                selected = pickRandomZone(baseProvinces);
                activatedProvinces.push(selected.name);
                
                var removed = selected.removeForce('warlords_guerrilla', 2);
                
                selected.warlords_base++; availableBasesWarlords--;
                msgPush('# Add a Warlords base in ' + selected.name);
                 
                warlordsResources--;
                provinces--;
            }
        }
        
        // condition 3: weighted random
        if (!selected && availableForcesWarlords > 0) {
            // 3.1: Base but no Guerrillas
            var baseProvinces = filterZones(kSpacesNonPakistan, function (zone) {
                if (contains(activatedProvinces, zone.name)) return false;
                return zone.warlords_base > 0 && zone.warlords_guerrilla() == 0;
            });
            if (baseProvinces.length > 0) {
                selected = pickRandomZone(baseProvinces);
                activatedProvinces.push(selected.name);
                warlordsRallyActivateZone(selected);
                provinces--;
            }
        }
        
        if (!selected && availableForcesWarlords > 0) {
            // 3.2: Guerrillas but no Bases
            var baseProvinces = filterZones(kSpacesNonPakistan, function (zone) {
                if (contains(activatedProvinces, zone.name)) return false;
                return zone.warlords_base == 0 && zone.warlords_guerrilla();
            });
            if (baseProvinces.length > 0) {
                selected = pickRandomZone(baseProvinces);
                activatedProvinces.push(selected.name);
                warlordsRallyActivateZone(selected)
                provinces--;
            }
        }
        
        if (!selected) {
            // 3.3: Somewhere to Cultivate if not yet possible
            // check to see if Cultivate can already be done
            var baseProvinces = filterZones(activatedProvinces, function (zone) {
                return zone.bases() < 2 && zone.warlords_guerrilla() > zone.police;
            });
            if (baseProvinces.length == 0) {
                // check to see if we can activate a province to make it Cultivate-able
                var baseProvinces = filterZones(kSpacesNonPakistan, function (zone) {
                    if (contains(activatedProvinces, zone.name)) return false;
                    return zone.bases() < 2 && zone.warlords_guerrilla() >= zone.police;
                });
                if (baseProvinces.length > 0) {
                    // found a province that we can activate to cultivate at
                    selected = pickRandomZone(baseProvinces);
                    activatedProvinces.push(selected.name);
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
                activatedProvinces.push(selected.name);
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

    var warlordsBases = zone.warlords_base;
    var warlordsForces = zone.warlords_guerrilla();
    var controlDifference = zone.getControlValue();
    var warlordAdvantage =  zone.warlords() + Math.min(zone.taliban(), zone.coin()) -
        Math.max(zone.taliban(), zone.coin());
    if (warlordAdvantage < 0) warlordAdvantage = 0;
    var canMove = (controlDifference != 0) ? warlordsForces : Math.min(warlordAdvantage, warlordsForces);
    if (canMove > 0 && warlordsBases && canMove == warlordsForces)
        canMove--;
    console.log("warlordsCanMarch(" + zone.name + "): F=" + warlordsForces + ", B=" + warlordsBases + " -> " +
        warlordAdvantage + "/" + controlDifference + " => " + canMove);
    return canMove;
}

function warlordsMarchToLOC(origin, loc) {
    loc = fixZoneParameter(loc);

    var locOrigin = filterZones(origin, function (zone) {
        console.log('filter ' + loc.name + ';' + zone.name + ': ' + isAdjacent(loc, zone)); 
        return isAdjacent(loc, zone);
    })
    for (var i = 0; i < locOrigin.length; i++) {
        console.log('warlordsMarchToLOC() ' + loc.name + ' -> ' + warlordsCanMarch(loc));
    }
    if (locOrigin.length > 0) {
        // move to LOC
        var selected = pickRandomZone(locOrigin);

        selected.moveForce(loc, 'warlords_guerrilla', 1, false, true);

        return selected;
    }
    return false;
}

function warlordsMarchCanChangeControl(zone, activatedProvinces) {
    zone = fixZoneParameter(zone);

    var controlDifference = Math.abs(zone.getControlValue());
    var availableForces = warlordsAdjacentForMarch(zone, activatedProvinces);
    
    console.log('avail ' + zone.name + ': ' + availableForces + ' >= ' + controlDifference);
    return availableForces >= controlDifference;
}

function warlordsAdjacentForMarch(zone, activatedProvinces) {
    zone = fixZoneParameter(zone);
    var adjacencies = zone.adjacencies;

    var availableForces = 0;
    for (var i = 0; i < adjacencies.length; i++)
        if (!contains(activatedProvinces, adjacencies[i]))
            availableForces += warlordsCanMarch(getZone(adjacencies[i]));

    console.log('adj ' + zone.name + ': ' + availableForces);

    return availableForces;
}

function warlordsMarchAllAdjacent(zone, activatedProvinces) {
    zone = fixZoneParameter(zone);
    var adjacencies = zone.adjacencies;
    var movedAny = false;

    for (var i = 0; i < adjacencies.length; i++)
        if (!contains(activatedProvinces, adjacencies[i])) {
            var availableForces = warlordsCanMarch(getZone(adjacencies[i]));
            if (availableForces > 0) {
                console.log('warlordsMarchAllAdjacent(' + zone.name + '): ' + adjacencies[i] + ' == ' + availableForces);
                var mustActivate = contains(kNonPashtun, zone.name); // must activate if going to Pashtun
                if (!mustActivate) {
                    // count the number of Guerrillas to see if must activate
                    var destCount = zone.taliban_guerrilla();
                    mustActivate = (availableForces + destCount) > 3;
                }
                
                var p = getZone(adjacencies[i]).moveForce(zone, 'warlords_guerrilla', availableForces, !mustActivate, mustActivate);
                movedAny = movedAny || p.underground || p.active;
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
        var zone = getZone(kLoCSpaces[0]);
        if (zone.empty())
            movedLOC = selected = warlordsMarchToLOC(origin, zone);
        if (movedLOC)
            activatedProvinces.push(selected.name);
    }
    // try (3) LoC
    if (!movedLOC) {
        var selected = false;
        console.log('LOC(3)');
        var zone = getZone(kLoCSpaces[1]);
        if (zone.empty())
            movedLOC = selected = warlordsMarchToLOC(origin, zone);
        if (movedLOC)
            activatedProvinces.push(selected.name);
    }
    // try random LoC
    if (!movedLOC) {
        console.log('LOC(random)');
        startLOC = Math.floor((Math.random() * (kLoCSpaces.length-2)) + 2);
        indexLOC = startLOC;
        do {
            var selected = false;
            var zone = getZone(kLoCSpaces[indexLOC]);
            if (zone.empty())
                movedLOC = selected = warlordsMarchToLOC(origin, zone);
            if (movedLOC)
                activatedProvinces.push(selected.name);
            indexLOC++;
            if (indexLOC > (kLoCSpaces.length-1)) indexLOC = 2;
        } while (!movedLOC && indexLOC != startLOC);
    }

    // move to Provinces where doing so removes COIN/Taliban Control
    var movedForControl = false;
    if (warlordsResources > 0) {
        var origin = filterZones(kSpacesNonPakistan, function (zone) {
            return zone.getControlValue();
        });
        var p = 4;
        while (p >= 0 && warlordsResources > 0) {
            var popZones = filterZones(origin, function (zone) {
                if (contains(activatedProvinces, zone.name)) return false;
                return (zone.pop == p && warlordsMarchCanChangeControl(zone, activatedProvinces));
            });
            if (popZones.length == 0) {
                p--;
            } else {
                var selected = pickRandomZone(popZones);
                activatedProvinces.push(selected.name);
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
            var cnt = zone.warlords_guerrilla();
            if (cnt + adj == 0) return false;
            return zone.bases() < 2 && 
                (cnt + adj) > zone.police;
        });
        if (baseProvinces.length > 0) {
            // found a province that we can activate to cultivate at
            selected = pickRandomZone(baseProvinces);
            console.log('RandomCultivate ' + selected.name);
            activatedProvinces.push(selected.name);
            var movedAny = warlordsMarchAllAdjacent(selected, activatedProvinces);
            warlordsResources--;
            movedRandom = true;
            if (!movedAny)
                msgPush('# Activate ' + selected.name + ' for March');
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
                console.log('RandomAny ' + selected.name);
                var movedAny = warlordsMarchAllAdjacent(selected, activatedProvinces);
                if (movedAny) {
                    activatedProvinces.push(selected.name);
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
            return zone.warlords_guerrilla_underground && zone.supportlevel == 'Opposition';
        });
        if (baseProvinces.length > 0) {
            // found a province that we can terror
            selected = pickRandomZone(baseProvinces);
            
            selected.activatePiece('warlords_guerrilla');
            selected.addTerror();
            selected.setSupportLevel('Neutral');
            warlordsResources--;
            msgPush('# Set Warlords Resources to ' + warlordsResources);
            return true;
        }
    }

    // if NP Taliban at Support space
    if (talibanNP) {
        var baseProvinces = filterZones(kSpacesNonPakistan, function (zone) {
            return zone.warlords_guerrilla_underground && zone.supportlevel == 'Support';
        });
        if (baseProvinces.length > 0) {
            // found a province that we can terror
            selected = pickRandomZone(baseProvinces);
            
            selected.activatePiece('warlords_guerrilla');
            selected.addTerror();
            selected.setSupportLevel('Neutral');
            warlordsResources--;
            msgPush('# Set Warlords Resources to ' + warlordsResources);
            return true;
        }
    }

    // random support or opposition space
    var baseProvinces = filterZones(kSpacesNonPakistan, function (zone) {
        return zone.warlords_guerrilla_underground && zone.supportlevel != 'Neutral';
    });
    if (baseProvinces.length > 0) {
        // found a province that we can terror
        selected = pickRandomZone(baseProvinces);

        selected.activatePiece('warlords_guerrilla');
        selected.addTerror();
        selected.setSupportLevel('Neutral');
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
        return zone.pop > 0 && zone.bases() < 2 && zone.warlords_guerrilla() > zone.police;
    });
    if (baseProvinces.length > 0) {
        // found a province that we can activate to cultivate at
        var withBase = filterZones(baseProvinces, function (zone) {
            return zone.warlords_base;
        });
        if (withBase.length > 0)
            baseProvinces = withBase;
        selected = pickRandomZone(baseProvinces);
        
        msgPush('# Place 1 Warlords Base in ' + selected.name);
        selected.warlords_base++; availableBasesWarlords--;
    } else {
        msgPop();
    }
    
    return selected;
}

function warlordsTraffic() {
    if (contains(momentum, '59. Local Truce')) return false;
    var halfIncome = contains(momentum, '58. Counter-Narc');

    var temp = [];
    var resources = 0;
    var taliban = 0;
    var addpatronage = 0;

    var baseProvinces = filterZones(kSpacesNonPakistan, function (zone) {
        return zone.warlords_base && !zone.coalition();
    });
    for (var i = 0; i < baseProvinces.length; i++) {
        var zone = getZone(baseProvinces[i]);
        resources += zone.warlords_base;
        var control = zone.getControlValue();
        if (control < 0) taliban++;
        if (control > 0) addpatronage++;
        temp.push(zone.name);
    }

    if (halfIncome)
        resources = Math.floor(resources / 2);

    if (baseProvinces.length == 0 || resources + warlordsResources >= 75) return false;

    warlordsResources += resources;

    msgPush("# Traffic:");
    for (var i = 0; i < temp.length; i++)
        msgPush((i+1) + ". " + temp[i]);
    msgPush("# Set Warlords Resources to " + warlordsResources);
    if (taliban > 0) {
        talibanResources += taliban;
        msgPush("# Set Taliban Resources to " + talibanResources);
    }
    if (addpatronage > 0) {
        patronage += addpatronage;
        msgPush("# Set Patronage to " + patronage);
    }

    return true;
}

function warlordsCanRemoveControlWithSuborn(zone) {
    var control = zone.getControlValue();

    if (control == 1 && zone.government_base) return 'base';
    if (control > 0 && control <= 3 && control >= (zone.police + zone.troops)) return 'cubes';
    if (control == -1 && zone.taliban_guerrilla()) return 'taliban';

    return false;
}

function warlordsRemoveRandomSuborn(zone) {
    zone = fixZoneParameter(zone);

    if (coalitionNP) {
        // remove Taliban Guerrilla
        zone.removeForce('taliban_guerrilla', 1, true);
    } else {
        // remove GOVT Piece
        if (selected.government_base) {
            msgPush('# Remove 1 GOVT Base from ' + zone.name);
            zone.government_base--;
        } else if (zone.police) {
            msgPush('# Remove 1 Police from ' + zone.name);
            zone.police--;
        } else {
            msgPush('# Remove 1 Troops from ' + zone.name);
            zone.troops--;
        }
    }
}

function warlordsSuborn() {
    if (contains(momentum, '59. Local Truce')) return false;

    msgPush('# Suborn');
    provinces = 3;
    
    var activatedProvinces = [];
    
    while (provinces > 0 && warlordsResources > 1) {
        var selected = false;
        
        // condition 1: Random province where Control can be removed, prefer removing GOVT Base
        if (!selected) {
            var baseProvinces = filterZones(kSpaces, function (zone) {
                if (contains(activatedProvinces, zone.name)) return false;

                var canRemove = warlordsCanRemoveControlWithSuborn(zone);
                if (canRemove)
                    console.log(zone.name + '? ' + canRemove);
                
                return zone.getControlValue() != 0 && canRemove;
            });
            if (baseProvinces.length > 0) {
                var withBase = filterZones(baseProvinces, function (zone) {
                    return warlordsCanRemoveControlWithSuborn(zone) == 'base';
                });
                if (withBase.length > 0)
                    baseProvinces = withBase;
                selected = pickRandomZone(baseProvinces);

                switch (warlordsCanRemoveControlWithSuborn(selected)) {
                    case 'base':
                        msgPush('# Remove 1 GOVT Base from ' + selected.name);
                        selected.government_base--;
                        break;
                    case 'cubes':
                        var control = selected.getControlValue();
                        var police = 0;
                        var troops = 0;
                        var removePolice = true;
                        for (var i = 0; i < control; i++) {
                            if ((removePolice && selected.police) || !selected.troops) {
                                police++;
                                selected.police--;
                            } else {
                                troops++;
                                selected.troops--;
                            }
                            removePolice = !removePolice;
                        }
                        if (police > 0)
                            msgPush('# Remove ' + police + ' Police from ' + selected.name);
                        if (troops > 0)
                            msgPush('# Remove ' + troops + ' Troops from ' + selected.name);
                        break;
                    case 'taliban':
                        selected.removeForce('taliban_guerrilla', 1, true);
                        break;
                }

                activatedProvinces.push(selected.name);
                warlordsResources -= 2;
                provinces--;
            }
        }

        // condition 2: remove Taliban Guerrilla or Govt Piece
        if (!selected) {
            // condition 2a: LOCs
            var baseProvinces = filterZones(kLoCSpaces, function (zone) {
                if (contains(activatedProvinces, zone.name)) return false;
                
                return (
                    (coalitionNP && zone.taliban_guerrilla()) ||
                    (!coalitionNP && zone.goverment())
                );
            });
            if (baseProvinces.length > 0) {
                selected = pickRandomLOC(baseProvinces);

                warlordsRemoveRandomSuborn(selected);

                activatedProvinces.push(selected.name);
                warlordsResources -= 2;
                provinces--;
            }
        }

        if (!selected) {
            // condition 2b: Non-Pakistan
            var baseProvinces = filterZones(kSpacesNonPakistan, function (zone) {
                if (contains(activatedProvinces, zone.name)) return false;
                
                return (
                    (coalitionNP && zone.taliban_guerrilla()) ||
                    (!coalitionNP && zone.goverment())
                );
            });
            if (baseProvinces.length > 0) {
                selected = pickRandomZone(baseProvinces);

                warlordsRemoveRandomSuborn(selected);

                activatedProvinces.push(selected.name);
                warlordsResources -= 2;
                provinces--;
            }
        }

        if (!selected) {
            // condition 2c: Pakistan
            var baseProvinces = filterZones(kPakistan, function (zone) {
                if (contains(activatedProvinces, zone.name)) return false;
                
                return (
                    (coalitionNP && zone.taliban_guerrilla()) ||
                    (!coalitionNP && zone.goverment())
                );
            });
            if (baseProvinces.length > 0) {
                selected = pickRandomZone(baseProvinces);

                warlordsRemoveRandomSuborn(selected);

                activatedProvinces.push(selected.name);
                warlordsResources -= 2;
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