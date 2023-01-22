module.exports = (client, message) => {

  if (message.author.bot || message.channel.type === 'dm') return;

  const prefix = client.config.prefix;

  if (message.content.indexOf(prefix) !== 0) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const prefixcommand = args.shift().toLowerCase();

  const cmd = require(`../prefix/${prefixcommand}.js`)

  if (cmd) cmd.execute({ client, message, args });
  };