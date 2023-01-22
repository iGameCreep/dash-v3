const Discord = require("discord.js");
const { Intents, Collection } = require("discord.js")
const fs = require("fs");

const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES], fetchAllMembers: true});
const config = require('./config/config.json')
const settings = require('./config/settings.json')
chalk = require('chalk');
client.config = config;

client.commands = new Collection();
CommandsArray = [];

const events = fs.readdirSync('./events/').filter(file => file.endsWith('.js'));

console.log(chalk.red("Loading events..."))

for (const file of events) {
    const event = require(`./events/${file}`);
    console.log(chalk.green(`[+] ${file.split('.')[0]}`));
    console.log(file.split('.')[0])
    client.on(file.split('.')[0], event.bind(null, client));
    delete require.cache[require.resolve(`./events/${file}`)];
};

fs.readdir("./commands/", (err, files) => {
  console.log(chalk.red('Loading Commands...'))
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js") || file === "index.js") return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    if (settings.includes(commandName)) return;
    console.log(chalk.green(`[+] ${commandName}`));
    client.commands.set(commandName, props);
  });
});

client.on("ready", () => {
  client.user.setActivity('Set Activity', { type: 'WATCHING' });
});

client.login(config.token)

exports.client = client;
