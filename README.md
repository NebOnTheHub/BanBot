# BanBot
 - yes I know this looks rushed, It's caused it was. The code is compacted and more of me testing a template.
## Overview

**BanBot** is a Discord bot designed to help server administrators manage banned users across multiple guilds. With BanBot, you can easily ban or unban users from all servers the bot is a member of, set minimum account age requirements for new members, and provide ban appeal links.

## Features

- **Add Ban:** Ban a user from all guilds the bot is a member of, with an optional reason.
- **Remove Ban:** Unban a user from all guilds the bot is a member of.
- **Age Kick:** Automatically kick members whose accounts are younger than a specified duration.
- **Ban Appeal Link:** Configure a link for banned users to appeal their ban.
- **List Bans:** Display a list of all banned users.
- **GitHub Repository:** Command to display a link to the bot's GitHub repository.

## Commands

### `/addban`
- **Description:** Add a user to the ban list and ban them from all guilds.
- **Options:**
  - `userid` (required): The ID of the user to ban.
  - `reason` (optional): The reason for banning the user.

### `/removeban`
- **Description:** Remove a user from the ban list and unban them from all guilds.
- **Options:**
  - `userid` (required): The ID of the user to unban.

### `/agekick`
- **Description:** Set the minimum account age required to join the server.
- **Options:**
  - `duration` (optional): The minimum account age (e.g., 1d, 10m). Default is `1w`.

### `/config`
- **Description:** Set the ban appeal link.
- **Options:**
  - `appeallink` (optional): The URL where banned users can appeal their ban.

### `/listbans`
- **Description:** List all users currently banned.

### `/github`
- **Description:** Display the GitHub repository link for BanBot.

## Configuration
- The bot stores guild-specific configurations in the guild_configs directory.
- Banned users are stored in bannedUsers.json.
- The default minimum account age for joining is set to 1w (1 week). You can adjust this using the /agekick command.

## Contributing
Feel free to open issues or submit pull requests to improve the bot.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Author
BanBot was created by nebby.dev.
