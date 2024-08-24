/*
###############################################################################################################################
SIMPLE BOT DESIGNED BY NEBBY.DEV
______  _____  _____  _____  _____  _   _  _____ ______    ______ __   __ 
|  _  \|  ___|/  ___||_   _||  __ \| \ | ||  ___||  _  \   | ___ \\ \ / / 
| | | || |__  \ `--.   | |  | |  \/|  \| || |__  | | | |   | |_/ / \ V /  
| | | ||  __|  `--. \  | |  | | __ | . ` ||  __| | | | |   | ___ \  \ /   
| |/ / | |___ /\__/ / _| |_ | |_\ \| |\  || |___ | |/ /    | |_/ /  | |   
|___/  \____/ \____/  \___/  \____/\_| \_/\____/ |___/     \____/   \_/   
 _   _  _____ ______ ______ __   __   ______  _____  _   _ 
| \ | ||  ___|| ___ \| ___ \\ \ / /   |  _  \|  ___|| | | |
|  \| || |__  | |_/ /| |_/ / \ V /    | | | || |__  | | | |
| . ` ||  __| | ___ \| ___ \  \ /     | | | ||  __| | | | |
| |\  || |___ | |_/ /| |_/ /  | |   _ | |/ / | |___ \ \_/ /
\_| \_/\____/ \____/ \____/   \_/  (_)|___/  \____/  \___/ 
                                                               
join Build-A-Realm for more bots, minecraft addons and more
https://discord.gg/d4KpNaXM9v
###############################################################################################################################
*/
// Set up basic configurations

const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder, PermissionsBitField, ActivityType, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Initialize the bot client
const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

let bannedUsers = {};
const bannedUsersPath = path.join(__dirname, 'bannedUsers.json');
if (fs.existsSync(bannedUsersPath)) bannedUsers = JSON.parse(fs.readFileSync(bannedUsersPath));

const YOUR_BOT_TOKEN = '';
const YOUR_CLIENT_ID = ''; 
const USERS_PER_PAGE = 5; // /list-bans

// Set bot status messages
const statuses = [
    //{ name: 'over 7.8k+ Members', type: ActivityType.Watching },
    { name: 'with a laser 🐱', type: ActivityType.Playing },
    { name: 'Minecraft', type: ActivityType.Playing },
    //{ name: 'over discord.gg/d4KpNaXM9v', type: ActivityType.Watching },
    //{ name: 'over discord.gg/realmhub', type: ActivityType.Watching },
    { name: `${Object.keys(bannedUsers).length}+ Banned Users!!`, type: ActivityType.Watching },
];


const guildConfigsPath = path.join(__dirname, 'guild_configs');
if (!fs.existsSync(guildConfigsPath)) fs.mkdirSync(guildConfigsPath);

// Set up slash commands using SlashCommandBuilder for better maintainability
const commands = [
    new SlashCommandBuilder()
        .setName('db-ban')
        .setDescription('Add a user to the ban list')
        .addStringOption(option => 
            option.setName('userid')
                .setDescription('The ID of the user to ban')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for their ban')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('db-unban')
        .setDescription('Remove a user from the ban list')
        .addStringOption(option => 
            option.setName('userid')
                .setDescription('The ID of the user to unban')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('age-kick')
        .setDescription('Set the account age required to join the server')
        .addStringOption(option => 
            option.setName('duration')
                .setDescription('The minimum age of the account (e.g., 1w, 10m)')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('config')
        .setDescription('Set the ban appeal link and log channel')
        .addStringOption(option => 
            option.setName('appeallink')
                .setDescription('The link to appeal the ban')
                .setRequired(false))
        .addChannelOption(option => 
            option.setName('logchannel')
                .setDescription('The channel to log ban notifications')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('github')
        .setDescription('Sends the GitHub link.'),

    //new SlashCommandBuilder() | To buggy
    //    .setName('list-bans') | To add, lmk if you can fix it! @nebby.dev
    //    .setDescription('Sends the list of banned users.'),
];

// Register slash commands
const rest = new REST({ version: '10' }).setToken(YOUR_BOT_TOKEN);
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationCommands(YOUR_CLIENT_ID), { body: commands.map(cmd => cmd.toJSON()) });
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Failed to reload application commands:', error);
    }
})();

bot.once('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`);
    setInterval(() => {
        let status = statuses[Math.floor(Math.random() * statuses.length)];
        bot.user.setActivity(status.name, { type: status.type });
    }, 10000);
});

// Handle user joining a guild
bot.on('guildMemberAdd', async (member) => await handleNewMember(member));

// Handle the bot joining a new guild
bot.on('guildCreate', async (guild) => await banUsersInGuild(guild));

/*
###############################################################################################################################
_____  _____ ___  ______  ___  ___   _   _ ______  _____ 
/  __ \|  _  ||  \/  ||  \/  | / _ \ | \ | ||  _  \/  ___|
| /  \/| | | || .  . || .  . |/ /_\ \|  \| || | | |\ `--. 
| |    | | | || |\/| || |\/| ||  _  || . ` || | | | `--. \
| \__/\\ \_/ /| |  | || |  | || | | || |\  || |/ / /\__/ /
 \____/ \___/ \_|  |_/\_|  |_/\_| |_/\_| \_/|___/  \____/ 
                                                          
 ###############################################################################################################################
*/

bot.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const guildConfigFile = path.join(guildConfigsPath, `${interaction.guild.id}.json`);
    let guildConfig = { ageKick: '1w', appealLink: '', logChannel: '' };
    if (fs.existsSync(guildConfigFile)) guildConfig = JSON.parse(fs.readFileSync(guildConfigFile));
    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    try {
        switch (interaction.commandName) {
            case 'db-ban':
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) 
                    return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
                bannedUsers[userId] = { reason };
                fs.writeFileSync(bannedUsersPath, JSON.stringify(bannedUsers, null, 2));
                await banUserFromAllGuilds(userId, reason, interaction.guild, guildConfig.appealLink);
                interaction.reply({ embeds: [new EmbedBuilder().setColor('#ff0000').setTitle('User Banned').setDescription(`User <@${userId}> has been banned for "${reason}".`)] });
                break;
            case 'db-unban':
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) 
                    return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
                delete bannedUsers[userId];
                fs.writeFileSync(bannedUsersPath, JSON.stringify(bannedUsers, null, 2));
                interaction.reply({ embeds: [new EmbedBuilder().setColor('#00ff00').setTitle('User Unbanned').setDescription(`User <@${userId}> has been unbanned.`)] });
                break;
            case 'age-kick':
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) 
                    return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
                guildConfig.ageKick = interaction.options.getString('duration') || '1w';
                fs.writeFileSync(guildConfigFile, JSON.stringify(guildConfig, null, 2));
                interaction.reply({ embeds: [new EmbedBuilder().setColor('#ffcc00').setTitle('Age Kick Configured').setDescription(`Account age kick has been set to: "${interaction.options.getString('duration') || '1w'}".`)] });
                break;
            case 'config':
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) 
                    return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
                const appealLink = interaction.options.getString('appeallink');
                const logChannelOption = interaction.options.getChannel('logchannel');
                if (appealLink) guildConfig.appealLink = appealLink;
                if (logChannelOption) guildConfig.logChannel = logChannelOption.id;
                fs.writeFileSync(guildConfigFile, JSON.stringify(guildConfig, null, 2));
                interaction.reply({ embeds: [new EmbedBuilder().setColor('#00ffcc').setTitle('Configuration Updated').setDescription(`Ban appeal link: "${appealLink || guildConfig.appealLink}". Log channel: ${logChannelOption ? logChannelOption.name : 'No changes'}.`)] });
                break;
            //case 'list-bans':                      |To buggy 
            //    await sendBanList(interaction, 0); | to add (mb if its in the read me still)
            //    break;                             |   If you can fix it, lmk @nebby.dev
            case 'github':
                interaction.reply({ embeds: [new EmbedBuilder().setColor('#6e5494').setTitle('GitHub Repository').setDescription(`Visit the GitHub repository at: [BanBot Repository](https://github.com/NebOnTheHub/BanBot)`).setTimestamp()], ephemeral: true });
                break;
        }
    } catch (error) {
        console.error(error);
        interaction.reply({ content: 'An error occurred while executing the command.', ephemeral: true });
    }
});


/*
###############################################################################################################################
______  _   _  _   _  _____  _____  _____  _____  _   _  _____ 
|  ___|| | | || \ | |/  __ \|_   _||_   _||  _  || \ | |/  ___|
| |_   | | | ||  \| || /  \/  | |    | |  | | | ||  \| |\ `--. 
|  _|  | | | || . ` || |      | |    | |  | | | || . ` | `--. \
| |    | |_| || |\  || \__/\  | |   _| |_ \ \_/ /| |\  |/\__/ /
\_|     \___/ \_| \_/ \____/  \_/   \___/  \___/ \_| \_/\____/ 
                                                            
###############################################################################################################################
*/
async function handleNewMember(member) {
    const guildConfigFile = path.join(guildConfigsPath, `${member.guild.id}.json`);
    let guildConfig = { ageKick: '1w', appealLink: '', logChannel: '' };
    if (fs.existsSync(guildConfigFile)) guildConfig = JSON.parse(fs.readFileSync(guildConfigFile));
    
    if (bannedUsers[member.user.id]) 
        await banUserFromAllGuilds(member.user.id, bannedUsers[member.user.id].reason, member.guild, guildConfig.appealLink);
    if (guildConfig.ageKick !== 'off' && Date.now() - member.user.createdAt < parseDuration(guildConfig.ageKick)) {
        await member.send({ embeds: [new EmbedBuilder().setColor('#ff0000').setTitle('Kicked').setDescription(`Your account is too new to join ${member.guild.name}.`).setTimestamp()]}).catch(console.error);
        return member.kick('Account is too new.');
    }
}
async function sendBanList(interaction, page = 0, initialInteraction = true) {
    const bannedUserIds = Object.keys(bannedUsers);
    const totalPages = Math.ceil(bannedUserIds.length / USERS_PER_PAGE);
    if (page < 0) page = 0;
    if (page >= totalPages) page = totalPages - 1;
    const start = page * USERS_PER_PAGE;
    const end = start + USERS_PER_PAGE;
    const pageBannedUsers = bannedUserIds.slice(start, end);
    const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Banned Users')
        .setDescription(pageBannedUsers.map(userId => `<@${userId}> *(${userId})* - ${bannedUsers[userId].reason}`).join('\n') || 'No users are currently banned.')
        .setFooter({ text: `Page ${page + 1} of ${totalPages}` })
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('prev_page')
            .setLabel('Previous')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(page === 0),
        new ButtonBuilder()
            .setCustomId('next_page')
            .setLabel('Next')
            .setStyle(ButtonStyle.Success) 
            .setDisabled(page === totalPages - 1)
    );
    if (initialInteraction) {
        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    } else {
        await interaction.followUp({ embeds: [embed], components: [row], ephemeral: true });
    }

    const filter = i => i.customId === 'prev_page' || i.customId === 'next_page';
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
        try {
            if (i.customId === 'prev_page') {
                await sendBanList(i, page - 1, false); 
            } else if (i.customId === 'next_page') {
                await sendBanList(i, page + 1, false); 
            }
        } catch (error) {
            console.error('Failed to handle interaction:', error);
            await i.reply({ content: 'Sorry, something went wrong with this interaction.', ephemeral: true });
        }
    });
}


async function banUserFromAllGuilds(userId, reason, currentGuild, appealLink) {
    for (const guild of bot.guilds.cache.values()) {
        try {
            const member = await guild.members.fetch(userId);
            if (guild.id === currentGuild.id) 
                await member.send({ embeds: [new EmbedBuilder().setColor('#ff0000').setTitle('Banned').setDescription(`You have been banned from "${guild.name}". Reason: ${reason}\n[Appeal Here](${appealLink || 'https://localhost'})`).setTimestamp()]}).catch(console.error);
            await member.ban({ reason });
        } catch (error) {
            if (error.code === 10007) console.error(`User ${userId} not found in ${guild.name}.`);
            else console.error(`Failed to ban user ${userId} from ${guild.name}:`, error);
        }
    }
}

async function banUsersInGuild(guild) {
    for (const userId of Object.keys(bannedUsers)) 
        await banUserFromAllGuilds(userId, bannedUsers[userId].reason, guild, '');
}

function parseDuration(duration) {
    const units = { y: 31557600000, mo: 2592000000, w: 604800000, d: 86400000, h: 3600000, m: 60000, s: 1000 };
    const match = duration.match(/^(\d+)([wdhms])$/);
    return match ? match[1] * units[match[2]] : 0;
}

setInterval(async () => {
    for (const guild of bot.guilds.cache.values()) await banUsersInGuild(guild);
}, 86400000);

bot.login(YOUR_BOT_TOKEN);
