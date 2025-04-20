# valorant-upcoming-games-bot

This is a discord bot used to display live and upcoming valorant pro matches. It's meant as a more user-friendly and extensive version of the schedule on valorantesports.com, cobbled together from multiple data sources.

## Running / Adding the bot

This bot is still relatively beta. As such, invites are not public, but if you track me down in discord I'll be happy to give you an invite link to invite it to your server.

You're also free to run your own copy of this bot if you wish. After running `npm install`, you will have to create the file `src/config.ts` which `export`s the following variables: 
- `token`: your discord bot token
- `challongeUsername`: your challonge username
- `challongeApiKey`: your challonge api key
- `liquipediaApiKey`: your liquipedia api key

Of course, you only need the config variables for the modules you use.

## Using the bot

Most interaction with the bot will be done via the `/matches` command, which displays the list of live and upcoming matches. If you want results for only specific leagues, you can include the `filter` parameter. The parameter has autocompletion (including `All` which simply returns everything) based on what you type in, but you can also provide a simple string like `game changers` or a regex like `vct .*` and it will return all matching leagues.

If you're not sure what leagues exist, you can use the `/leagues` command. It will also tell you what leagues are included in the output of `/matches` by default. The defaults can be set by a user with server manage permissions using the `/config_guild_leagues` command.

If the server-set defaults aren't to a user's liking, they can use `/config_personal_leagues` to set a filter they'd prefer and use the `/pmatches` command instead.

There is also the `/help` command which outputs what is basically in this section.

## Limitations

The schedule returned by valorant-esports.com doesn't include all pro matches, namely qualifications for challengers and game changers. I do my best to get data sources for these matches so that they're included, but it is difficult and time-consuming, so you may find some matches are missing. If you have a lead on where to get this information (in an easy-to-use format like an API), please let me know! I will be happy to add it.

Also, the current UI for selecting leagues is _awful_. I am very aware of this, but to be frank, it is not a high priority for me to make it better.

## Developing / Contributing

To keep things manageable, data sources are kept separately from each other. Each module needs to export a `getMatches` function of return type `Promise<Match[]>`. To make things easier to manage, there's both an `enabled` folder and `disabled` folder within the `modules` folder.

If you're coding a handler that can be reused by multiple modules -- such as a tournament hosting platform like battlefy -- place it in `src/modules`.

Feel free to make a PR that adds support for different platforms / tournaments!