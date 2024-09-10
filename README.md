# BanBot

## Overview

**BanBot** is a Discord bot designed by nebby.dev to manage user bans and account age restrictions across multiple servers. The bot maintains a ban list and performs various ban-related actions, including adding/removing users from the ban list and enforcing account age restrictions.

## Features

- **Ban Users**: Add users to the ban list and apply bans across all guilds the bot is in.
- **Unban Users**: Remove users from the ban list and lift bans.
- **Age Kick**: Configure a minimum account age required to join your server.
- **Configuration**: Set up ban appeal links and log channels.
- **List Bans**: Display a list of banned users with pagination support.
- **Status Updates**: The bot regularly updates its status to show various information, including the number of banned users.

## Setup

### Prerequisites

- Node.js (v16.0.0 or higher)
- Discord Bot Token
- Your Discord Client ID

### Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/NebOnTheHub/BanBot.git
    cd BanBot
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Configure the bot**:
    - Replace `YOUR_BOT_TOKEN` and `YOUR_CLIENT_ID` in the `index.js` file with your actual Discord bot token and client ID.

4. **Run the bot**:
    ```bash
    node index.js
    ```

## Commands

- `/db-ban <userid> [reason]`: Add a user to the ban list with an optional reason.
- `/db-unban <userid>`: Remove a user from the ban list.
- `/age-kick [duration]`: Set the minimum account age required to join the server (e.g., `1w`, `10m`).
- `/config [appeallink] [logchannel]`: Set or update the ban appeal link and log channel.
- `/list-bans`: Display a paginated list of banned users.
- `/github`: Get the link to the GitHub repository.

## Configuration

- **`bannedUsers.json`**: Contains the list of banned users with reasons.
- **`guild_configs/`**: Directory containing configuration files for each guild.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on [GitHub](https://github.com/NebOnTheHub/BanBot).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

Contact me @nebby.dev, or join [Build-A-Realm](https://discord.gg/d4KpNaXM9v).

## Acknowledgements

- [discord.js](https://discord.js.org/) for the Discord API wrapper.
- [Node.js](https://nodejs.org/) for the runtime environment.

