// setup
var inputData = JSON.parse(inputString);
var msg = [];
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

var aid = 0;
var patronage = 0;
var supportAvailable = 0;
var coinPatronage = 0;
var oppositionBases = 0;
var uncontrolledPop = 0;
var islamabad = '';

var cardIndex = {
	1: {name: '01. ISR *'},
	2: {name: '02. Predators *'},
	3: {name: '03. Reapers *'},
	4: {name: '04. #2 Is Dead'},
	5: {name: '05. Aerostats *'},
	6: {name: '06. US-Pakistan Talks'},
	7: {name: '07. Find Fix Finish *'},
	8: {name: '08. SEAL Team 6'},
	9: {name: '09. Special Forces'},
	10: {name: '10. Partnering Policy'},
	11: {name: '11. Strategic Release'},
	12: {name: '12. Village Stability Operations *'},
	13: {name: '13. Anti-Corruption Drive'},
	14: {name: '14. Economic Project'},
	15: {name: '15. One Tribe at a Time'},
	16: {name: '16. Amnesty'},
	17: {name: '17. NATO'},
	18: {name: '18. PRTs *'},
	19: {name: '19. Al-Qaeda'},
	20: {name: '20. Errant Air Strike'},
	21: {name: '21. Operation Iraqi Freedom'},
	22: {name: '22. Border Incident'},
	23: {name: '23. Roadside IEDs *'},
	24: {name: '24. US-Taliban Talks'},
	25: {name: '25. Koran Burning'},
	26: {name: '26. MANPADS Scare'},
	27: {name: '27. Tehrik-i-Taliban Pakistan'},
	28: {name: '28. Karzai to Islamabad'},
	29: {name: '29. Night Letters *'},
	30: {name: '30. Urban Specialists *'},
	31: {name: '31. Car Bombs *'},
	32: {name: '32. Haqqani'},
	33: {name: '33. Suicide Bombers *'},
	34: {name: '34. Accidental Guerrillas *'},
	35: {name: '35. Gulbuddin Hekmatyar'},
	36: {name: '36. Mullah Omar'},
	37: {name: '37. Afghan Commandos'},
	38: {name: '38. Night Raids'},
	39: {name: '39. Trilateral Summit'},
	40: {name: '40. Line Item'},
	41: {name: '41. NATO Politics'},
	42: {name: '42. NGOs'},
	43: {name: '43. Pakistani Offensive'},
	44: {name: '44. Pakistani Politics'},
	45: {name: '45. Tribal Elders'},
	46: {name: '46. ID Cards *'},
	47: {name: '47. Loya Jirga'},
	48: {name: '48. Strategic Partners'},
	49: {name: '49. Crop Substitution'},
	50: {name: '50. Development Aid'},
	51: {name: '51. Karzai'},
	52: {name: '52. Power Shuffle'},
	53: {name: '53. Prison Break'},
	54: {name: '54. Profit Sharing'},
	55: {name: '55. Breaktime'},
	56: {name: '56. Fratricide'},
	57: {name: '57. Sandstorms'},
	58: {name: '58. Counter-Narc'},
	59: {name: '59. Local Truce'},
	60: {name: '60. Tajiks'},
	61: {name: '61. Desertions & Defections'},
	62: {name: '62. Local Understanding'},
	63: {name: '63. Teetotalers'},
	64: {name: '64. Hazara'},
	65: {name: '65. Islamabad Blocks Resupply'},
	66: {name: '66. Mountain Fastness'},
	67: {name: '67. Change in Tactics'},
	68: {name: '68. Dostum'},
	69: {name: '69. Mine Removal'},
	70: {name: '70. Contractor Surge'},
	71: {name: '71. Coup!'},
	72: {name: '72. Poppy Crop Failure'}
};

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
	"Kandahar-Spin Boldak LOC",
    "Kabul-Aibak LOC",
    "Shibirghan-Aibak LOC",
    "Farah-Kandahar LOC",
    "Toraghondi-Farah LOC",
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
	"Kandahar-Spin Boldak LOC": { econ: 3, adjacencies: [ "Oruzgan", "Kandahar", "Zabol", "Waziristan (Pakistan)" ] },
    "Kabul-Aibak LOC": { econ: 1, adjacencies: [ "Kabul", "Baghlan", "Balkh", "Samangan" ] },
    "Shibirghan-Aibak LOC": { econ: 1, adjacencies: [ "Baghlan", "Balkh", "Faryab", "Sar-e-Pol", "Samangan" ] },
    "Farah-Kandahar LOC": { econ: 1, adjacencies: [ "Farah", "Nimruz", "Helmand", "Kandahar", "Zabol", "Oruzgan", "Ghowr" ] },
    "Toraghondi-Farah LOC": { econ: 1, adjacencies: [ "Badghis", "Ghowr", "Nimruz", "Farah", "Herat" ] },
    "Kandahar-Kabul LOC": { econ: 1, adjacencies: [ "Kandahar", "Zabol", "Paktika", "Khowst", "Kabul", "Bamian", "Ghazni", "Oruzgan" ] }
};



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

console.log("Propaganda cards left in deck = " + propagandaCount);
console.log("Consider playing event = " + considerEvent);
console.log("Resources: GOVT=" + governmentResources + ", Taliban=" + talibanResources + ", Warlords=" + warlordsResources);

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
if (np > "") console.log("Non-Player = " + np);
// 	msgPush("******************"); 
// 	msgPush(JSON.stringify(inputData));
// 	msgPush("******************");

// Actions

if (action == "Game State") {
	showGameState();
} else {

	msgPush("# Activated Bot: " + action);

	// Warlords

	if (action == "Warlords") {
		// event card
		var playedEvent = false;
		/*
		if (considerEvent) {
			console.log("Evaluating event");
			playedEvent = warlordsEvent();
		}
		*/
		
		if (!playedEvent) {
			console.log("Finding operation to perform");
			warlordsOperation();
		}
	}

	// final

	msgPush('# Bot Complete');
}

msg = msg.join("\n");
