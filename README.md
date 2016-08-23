# ADPBot

ADPBot is a VASSAL extension to the A Distant Plain VASSAL module. It adds an "AI" window to the interface with buttons for each faction. Using these buttons you can automatically resolve flowchart decisions for Non-Player bots.

The script gets its game data from the game setup in VASSAL, and the output from the script is written to the VASSAL chat area. The player(s) then manually implement the instructions from the bot.

A Distant Plain is a game designed by Volko Ruhnke and Brian Train, published by GMT Games as part of the COIN Series. Game material is &copy; 2013-2015 GMT Games.

http://www.gmtgames.com/p-481-a-distant-plain-2nd-printing.aspx
https://boardgamegeek.com/boardgame/127518/distant-plain

### Status

| Faction | Operations | Special Activities | Events | Verification
| :-- | :-- | :-- | :-- | :--
| Coalition  | _nothing_ | _nothing_ | _nothing_ | _nothing_
| Government | _nothing_ | _nothing_ | _nothing_ | _nothing_
| Taliban    | _nothing_ | _nothing_ | _nothing_ | _nothing_
| Warlords   | :white_check_mark: Rally, March, Terror | :white_check_mark: Cultivate, Traffic, Suborn | _nothing_ | Needs playtesting

### How to Install

Download the A_Distant_Plain_Bot.vmdx. In the VASSAL Module Manager, right-click on _A Distant Plain_ and choose _Add Extension..._. For more information consult your VASSAL documentation.

### How to Use

In the "AI" window there are 4 checkboxes: "Coalition NP", "Government NP", "Warlords NP", "Taliban NP". These let the bot know which factions in the game are not played by human players but by the bots (NP, Non Player). Some decisions by the bot depend on if a faction is human controlled or not, so these should be set correctly before using any of the bot faction buttons. The "AI" window state is not saved with your VASSAL save game, so these checkboxes have to be reset on each reload of the game.

Using the "Game State" button the bot will write to the chat area a summary of how it sees the game (i.e. the game situation it gets from VASSAL on which it bases its decisions).

You have to decide based on the current card and eligibility when the bot should play. Since bots are not yet aware of any events or their effectiveness the event on the card has to be manually evualated, and if effective manually implemented. If the event is ineffective or the bot is not eligible to play the event then the button for the applicable faction should be pushed in the "AI" window. The bot will read through the current game situation and decide based on the bot flowchart which actions it should take. Its decisions are written as textual instruction to the VASSAL chat area. You should then manually implement each instruction as directed.

The bot does not have a memory. Every time the button is pushed it will read the VASSAL game situation, and work through it's decision tree. Since sometimes die rolls are made the outcome can vary from run to run. The bot does not change anything in the game in VASSAL, so you can safely push the bot button and still ignore the result if you wish.

### Under Development

This bot is still under development and not yet completed. The completed code needs further testing for correctness and stability, and the non-completed code needs to be further completed.

On each AI action the bot extension writes a _vassal-raw.json_ file to your Home/User folder. This is the game communication between the VASSAL game and the bot script. This file can be deleted safely. If there is an issue this file can be helpful to find the source game state that led to the issue.

On the wishlist for the future is the addition of events to the bots, so they can also automatically decide on event effectiveness and event resolution.

### Report Issues

If you encounter any errors or problems running this bot, please report them here using _Issues_ so they can be fixed. If possible save the game in VASSAL (.vsav), copy the _vassal-raw.json_ file from your Home/User directory, copy the bot output from the chat area, and describe what action you took that led to the problem.
