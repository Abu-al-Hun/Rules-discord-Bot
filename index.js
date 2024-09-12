const { Client, GatewayIntentBits, Collection, Events, ActivityType } = require('discord.js');
const { token, guildId, clientId } = require('./config.json');
const fs = require('fs');
const path = require('path');
const figlet = require('figlet');
const { SlashCommandBuilder } = require('@discordjs/builders');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(__dirname, 'commands', file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

const fileIcons = {
    js: '📜',
    json: '📦',
    txt: '📄',
    default: '📁'
};

function printFilesRecursively(directory, indent = '') {
    const files = fs.readdirSync(directory);

    files.forEach((file, index) => {
        const fullPath = path.join(directory, file);
        const stats = fs.statSync(fullPath);

        if (file === 'node_modules') {
            return;
        }
        if (file === '.npm') {
            return;
        }

        const fileExtension = path.extname(file).slice(1);
        const icon = stats.isDirectory() ? fileIcons['default'] : fileIcons[fileExtension] || fileIcons['default'];

        const isLast = index === files.length - 1;
        const treeSymbol = isLast ? '└──' : '├──';

        console.log(`${indent}${treeSymbol} ${icon} ${file}`);

        if (stats.isDirectory()) {
            printFilesRecursively(fullPath, `${indent}${isLast ? '    ' : '│   '}`);
        }
    });
}

async function registerCommands() {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        console.error(`The bot is not in the guild with ID: ${guildId}`);
        return;
    }

    try {
        await guild.members.fetch(clientId);
    } catch {
        console.error(`Bot with ID: ${clientId} is not in the guild with ID: ${guildId}`);
        return;
    }

    try {
        console.log('Registering commands...');
        await guild.commands.set(client.commands.map(cmd => cmd.data));
        console.log('Commands registered successfully.');
    } catch (error) {
        console.error('Failed to register commands:', error);
    }
}

client.once(Events.ClientReady, async () => {
    try {
        const asciiArtText = await new Promise((resolve, reject) => {
            figlet.text('Skode Studio', (err, data) => {
                if (err) reject(err);
                resolve(data);
            });
        });

        console.log(asciiArtText);

        console.log('Project Structure:');
        printFilesRecursively(__dirname);

        client.user.setPresence({
            activities: [{ name: '/help', type: ActivityType.Streaming, url: 'https://twitch.tv/yourchannel' }],
            status: 'online'
        });

        console.log(`Logged in as ${client.user.tag}!`);

        await registerCommands();
    } catch (error) {
        console.error('Error during the ready event:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.guildId !== guildId) {
        await interaction.reply({ content: 'This command can only be used in the specified server.', ephemeral: true });
        return;
    }

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(token);
