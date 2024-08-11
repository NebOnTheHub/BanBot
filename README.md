# Discord Ban Bot

A Discord bot built with Discord.js v14 that automates the banning and kicking of users based on predefined rules. The bot pulls banned usernames from a JSON file and automatically bans users when they join the server. It also includes a feature to kick accounts that are younger than a specified age.

## Features

- **Ban Management:**
  - Ban users upon joining if their ID is listed in a JSON file.
  - Send a direct message to banned users before they are banned.
  - Easily add or remove users from the ban list using slash commands.

- **Account Age Kicking:**
  - Kick accounts that are younger than a specified time period.
  - Configure the minimum account age for each server.
  - Ability to disable the age kick feature for specific servers.

- **Guild-Specific Configuration:**
  - Store configurations for each guild in individual JSON files.
  - Customize settings like the minimum account age required to join.

## Commands

- `/addban <user_id>`: Add a user ID to the ban list.
- `/removeban <user_id>`: Remove a user ID from the ban list.
- `/agekick <duration>`: Set the minimum account age required to join the server (e.g., `1w`, `10m`). If not specified, defaults to 1 week.

## Configuration
 - The bot will automatically create a configuration file for each guild in the guild_configs directory. You can manually edit these files to adjust settings like the ageKick value.

Directory Structure

```perl
discord-ban-bot/
│
├── node_modules/            # Installed Node.js packages
├── guild_configs/           # Folder to store per-guild configuration files
│   ├── 123456789012345678.json  # Example config file for a guild with ID 123456789012345678
│   └── 987654321098765432.json  # Another example config file for a different guild
│
├── bannedUsers.json         # JSON file storing banned user IDs
├── src/                     # Source files directory
│   ├── index.js             # Main bot script
│   └── ...                  # Other source files (if any)
├── package.json             # Project metadata and dependencies
└── package-lock.json        # Automatically generated for dependency management
```

## License
- This project is licensed under the MIT License. See the LICENSE file for details.

## Contributing
- Feel free to open issues or submit pull requests if you'd like to contribute to this project.

## Contact
- For any questions or issues, you can contact me via Discord: nebby.dev.
