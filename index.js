const { Client, GatewayIntentBits, REST, Routes, Collection, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

/*
###############################################################################################################################
SIMPLE BOT DESIGNED BY NEBBY.DEV
###############################################################################################################################
*/

// Configurable constants
let banAppeal = '';  // Initialized as empty; can be updated via the config command.
const YOUR_BOT_TOKEN = '';
const YOUR_CLIENT_ID = '';

const guildConfigsPath = path.join(__dirname, 'guild_configs');
if (!fs.existsSync(guildConfigsPath)) {
    fs.mkdirSync(guildConfigsPath);
}

let bannedUsers = {};
const bannedUsersPath = path.join(__dirname, 'bannedUsers.json');
if (fs.existsSync(bannedUsersPath)) {
    bannedUsers = JSON.parse(fs.readFileSync(bannedUsersPath));
}

bot.commands = new Collection();

const commands = [
    {
        name: 'addban',
        description: 'Add a user to the ban list',
        options: [
            {
                name: 'userid',
                type: 3,
                description: 'The ID of the user to ban',
                required: true,
            },
            {
                name: 'reason',
                type: 3,
                description: 'The reason for their ban',
                required: false,
            }
        ],
    },
    {
        name: 'removeban',
        description: 'Remove a user from the ban list',
        options: [
            {
                name: 'userid',
                type: 3,
                description: 'The ID of the user to unban',
                required: true,
            }
        ],
    },
    {
        name: 'agekick',
        description: 'Set the account age required to join the server',
        options: [
            {
                name: 'duration',
                type: 3,
                description: 'The minimum age of the account (e.g., 1d, 10m)',
                required: false,
            }
        ],
    },
    {
        name: 'config',
        description: 'Set the ban appeal link',
        options: [
            {
                name: 'appeallink',
                type: 3,
                description: 'The link to appeal the ban',
                required: false,
            }
        ],
    },
    {
        name: 'listbans',
        description: 'List all banned users',
        options: [],
    },
    {
        name: 'github',
        description: 'Displays the GitHub repository',
        options: [],
    }
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
        console.error('Failed to reload application commands:', error);
    }
})();

bot.once('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`);
});

bot.on('guildMemberAdd', async (member) => {
    const guildConfigFile = path.join(guildConfigsPath, `${member.guild.id}.json`);
    let guildConfig = { ageKick: '1w' };

    if (fs.existsSync(guildConfigFile)) {
        guildConfig = JSON.parse(fs.readFileSync(guildConfigFile));
    }

    if (bannedUsers[member.user.id]) {
        try {
            const banEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Banned')
                .setDescription(`You have been banned from "${member.guild.name}". Reason: ${bannedUsers[member.user.id].reason}`)
                .setTimestamp()
                .setFooter({ text: `Sent From "${member.guild.name}" Id: "${member.guild.id}"` });
            await member.send({ embeds: [banEmbed] });
        } catch (err) {
            console.error('Failed to send DM to the user:', err);
        }
        return member.ban({ reason: `Time: ${new Date().toString()}. Reason: "${bannedUsers[member.user.id].reason}"` });
    }

    if (guildConfig.ageKick !== 'off') {
        const accountAge = Date.now() - member.user.createdAt;
        const ageLimit = parseDuration(guildConfig.ageKick);

        if (accountAge < ageLimit) {
            try {
                const kickEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('Kicked')
                    .setDescription(`Your account is too new to join ${member.guild.name}.`)
                    .setTimestamp()
                    .setFooter({ text: `Sent From "${member.guild.name}" Id: "${member.guild.id}"` });
                await member.send({ embeds: [kickEmbed] });
            } catch (err) {
                console.error('Failed to send DM to the user:', err);
            }
            return member.kick(`Time: ${new Date().toString()}. Reason: Account is too new.`);
        }
    }
});

bot.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;
    const guildConfigFile = path.join(guildConfigsPath, `${interaction.guild.id}.json`);
    let guildConfig = { ageKick: '1w' };

    if (fs.existsSync(guildConfigFile)) {
        guildConfig = JSON.parse(fs.readFileSync(guildConfigFile));
    }
    try {
        switch (commandName) {
            case 'addban':
                await interaction.deferReply();

                const userIdToAdd = options.getString('userid');
                const reason = options.getString('reason') || 'No reason provided';

                bannedUsers[userIdToAdd] = { reason: reason };
                fs.writeFileSync(bannedUsersPath, JSON.stringify(bannedUsers, null, 2));
            
                const addbanEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('User Banned')
                    .setDescription(`User <@${userIdToAdd}> *(${userIdToAdd})* has been added to the ban list\nReason: "${reason}".`)
                    .setTimestamp();
            
                await interaction.editReply({ embeds: [addbanEmbed] });

                for (const [guildId, guild] of bot.guilds.cache) {
                    try {
                        const member = await guild.members.fetch(userIdToAdd);
                        if (member) {
                            const banEmbed = new EmbedBuilder()
                                .setColor('#ff0000')
                                .setTitle('Banned')
                                .setDescription(`You have been banned from "${guild.name}". Reason: ${reason}`)
                                .setTimestamp()
                                .setFooter({ text: `Sent From "${guild.name}" Id: "${guild.id}"` });
            
                            try {
                                await member.send({ embeds: [banEmbed] });
                            } catch (err) {
                                console.error(`Failed to send DM to the user in guild ${guild.name}:`, err);
                            }
            
                            await member.ban({ reason: `Time: ${new Date().toString()}. Reason: "${reason}"` });
                            console.log(`Successfully banned user ${userIdToAdd} from guild ${guild.name}.`);
                        }
                    } catch (err) {
                        if (err.code === 10007) { // DiscordAPIError[10007]: Unknown Member (fucking hate this shi smm)
                            console.log(`User ${userIdToAdd} not found in guild ${guild.name}, skipping...`);
                        } else {
                            console.error(`Failed to ban user ${userIdToAdd} in guild ${guild.name}:`, err);
                        }
                    }
                }
                break;

            case 'removeban':
                await interaction.deferReply();

                const userIdToRemove = options.getString('userid');

                if (!bannedUsers[userIdToRemove]) {
                    await interaction.editReply(`${userIdToRemove} isn't in the ban DB.`);
                    return;
                }

                delete bannedUsers[userIdToRemove];
                fs.writeFileSync(bannedUsersPath, JSON.stringify(bannedUsers, null, 2));

                const removebanEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('User Unbanned')
                    .setDescription(`User <@${userIdToRemove}> *(${userIdToRemove})* has been removed from the ban list.`)
                    .setTimestamp();
                
                await interaction.editReply({ embeds: [removebanEmbed] });

                bot.guilds.cache.forEach(async (guild) => {
                    try {
                        const ban = await guild.bans.fetch(userIdToRemove).catch(() => null);
                        if (ban) {
                            await guild.bans.remove(userIdToRemove, `Removed from list.`);
                            console.log(`Successfully unbanned the user in guild ${guild.name}`);
                        } else {
                            console.log(`User is not banned in guild ${guild.name}`);
                        }
                    } catch (error) {
                        console.error(`Failed to unban the user in guild ${guild.name}:`, error);
                    }
                });
                break;

        case 'agekick':
            const duration = options.getString('duration') || '1w';
            guildConfig.ageKick = duration;
            fs.writeFileSync(guildConfigFile, JSON.stringify(guildConfig, null, 2));

            const agekickEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('Age Kick Updated')
                .setDescription(`Minimum account age required to join is now set to "${duration}".`)
                .setTimestamp();
            await interaction.reply({ embeds: [agekickEmbed], ephemeral: true });
            break;

        case 'config':
            const appealLink = options.getString('appeallink') || banAppeal;
            banAppeal = appealLink;

            const configEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('Configuration Updated')
                .setDescription(`Ban appeal link is now set to: ${banAppeal}`)
                .setTimestamp();
            await interaction.reply({ embeds: [configEmbed], ephemeral: true });
            break;

        case 'listbans':
            const banList = Object.keys(bannedUsers).map(userId => `<@${userId}>, `).join('\n') || 'No banned users.';
            const listbansEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('Banned Users')
                .setDescription(`**Banned Users:**\n${banList}`)
                .setTimestamp();
            await interaction.reply({ embeds: [listbansEmbed], ephemeral: true});
            break;

        case 'github':
            const githubEmbed = new EmbedBuilder()
                .setColor('#6e5494')
                .setTitle('GitHub Repository')
                .setDescription('Visit the GitHub repository at: [BanBot Repository](https://github.com/NebOnTheHub/BanBot)')
                .setTimestamp();
            await interaction.reply({ embeds: [githubEmbed] });
            break;

        default:
            await interaction.reply({ content: 'Unknown Command', ephemeral: true });
        }
    } catch (error) {
        console.error('Error handling interaction:', error);
        if (!interaction.replied) {
            await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
        }
    }
});
    
function parseDuration(duration) {
    const durationRegex = /^(\d+)([dhms])$/;
    const match = duration.match(durationRegex);
    if (!match) return 0;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case 'y': return value * 365 * 30 * 7 * 24 * 60 * 60 * 1000;
        case 'mo': return value * 30 * 7 * 24 * 60 * 60 * 1000;
        case 'w': return value * 7 * 24 * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'm': return value * 60 * 1000;
        case 's': return value * 1000;
        default: return 0;
    }
}

bot.login(YOUR_BOT_TOKEN);
