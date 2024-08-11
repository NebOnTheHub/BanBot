const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

const YOUR_BOT_TOKEN = ``
const YOUR_CLIENT_ID = ``

const guildConfigsPath = path.join(__dirname, 'guild_configs');
if (!fs.existsSync(guildConfigsPath)) {
    fs.mkdirSync(guildConfigsPath);
}

// Load or create banned users list
let bannedUsers = {};
const bannedUsersPath = path.join(__dirname, 'bannedUsers.json');
if (fs.existsSync(bannedUsersPath)) {
    bannedUsers = JSON.parse(fs.readFileSync(bannedUsersPath));
}

// Register slash commands
bot.commands = new Collection();
const commands = [
    {
        name: 'addban',
        description: 'Add a user to the ban list',
        options: [{
            name: 'userid',
            type: 3,
            description: 'The ID of the user to ban',
            required: true,
        }],
    },
    {
        name: 'removeban',
        description: 'Remove a user from the ban list',
        options: [{
            name: 'userid',
            type: 3,
            description: 'The ID of the user to unban',
            required: true,
        }],
    },
    {
        name: 'agekick',
        description: 'Set the account age required to join the server',
        options: [{
            name: 'duration',
            type: 3,
            description: 'The minimum age of the account (e.g., 1d, 10m)',
            required: false,
        }],
    },
];

const rest = new REST({ version: '10' }).setToken(YOUR_BOT_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(YOUR_CLIENT_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

// Event listener for when the bot is ready
bot.once('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`);
});

// Event listener for when a member joins a guild
bot.on('guildMemberAdd', async (member) => {
    const guildConfigFile = path.join(guildConfigsPath, `${member.guild.id}.json`);
    let guildConfig = { ageKick: '1w' };

    if (fs.existsSync(guildConfigFile)) {
        guildConfig = JSON.parse(fs.readFileSync(guildConfigFile));
    }

    // Check if the user is in the banned list
    if (bannedUsers[member.user.id]) {
        try {
            await member.send('You have been banned from this server.');
        } catch (err) {
            console.error('Failed to send DM to the user:', err);
        }
        return member.ban({ reason: 'User is banned from the server.' });
    }

    // Check if age kick is enabled
    if (guildConfig.ageKick !== 'off') {
        const accountAge = Date.now() - member.user.createdAt;
        const ageLimit = parseDuration(guildConfig.ageKick);

        if (accountAge < ageLimit) {
            try {
                await member.send('Your account is too new to join this server.');
            } catch (err) {
                console.error('Failed to send DM to the user:', err);
            }
            return member.kick('Account is too new.');
        }
    }
});

// Command handling
bot.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;
    const guildConfigFile = path.join(guildConfigsPath, `${interaction.guild.id}.json`);
    let guildConfig = { ageKick: '1w' };

    if (fs.existsSync(guildConfigFile)) {
        guildConfig = JSON.parse(fs.readFileSync(guildConfigFile));
    }

    switch (commandName) {
        case 'addban':
            const userIdToAdd = options.getString('userid');
            bannedUsers[userIdToAdd] = true;
            fs.writeFileSync(bannedUsersPath, JSON.stringify(bannedUsers, null, 2));
            await interaction.reply(`User ${userIdToAdd} has been added to the ban list.`);
            break;

        case 'removeban':
            const userIdToRemove = options.getString('userid');
            delete bannedUsers[userIdToRemove];
            fs.writeFileSync(bannedUsersPath, JSON.stringify(bannedUsers, null, 2));
            await interaction.reply(`User ${userIdToRemove} has been removed from the ban list.`);
            break;

        case 'agekick':
            const ageKickSetting = options.getString('duration') || '1w';
            guildConfig.ageKick = ageKickSetting;
            fs.writeFileSync(guildConfigFile, JSON.stringify(guildConfig, null, 2));
            await interaction.reply(`Age kick has been set to ${ageKickSetting}.`);
            break;

        default:
            await interaction.reply('Unknown command.');
    }
});

function parseDuration(duration) {
    const units = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
        w: 7 * 24 * 60 * 60 * 1000,
        mo: 30 * 7 * 24 * 60 * 60 * 1000,
        y: 365 * 30 * 7 * 24 * 60 * 60 * 1000,
    };
    const match = duration.match(/(\d+)([smhdw])/);
    return match ? parseInt(match[1]) * units[match[2]] : 7 * 24 * 60 * 60 * 1000; // Default 1 week
}

bot.login(YOUR_BOT_TOKEN);
