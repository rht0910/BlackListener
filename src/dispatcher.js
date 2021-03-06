const f = require('string-format')
const logger = require(__dirname + '/logger').getLogger('commands', 'yellow')
const { commands } = require(__dirname + '/commands')
const levenshtein = require('fast-levenshtein').get
const util = require(__dirname + '/util')
const isTravisBuild = process.argv.includes('--travis-build')
const s = isTravisBuild ? require(__dirname + '/travis.yml') : require(__dirname + '/config.yml')

async function runCommand(command, settings, msg, lang) {
  if (!command.enabled) return msg.channel.send(f(lang._disabled_command, command.name))
  if (!command.isAllowed(msg, s.owners)) return msg.channel.send(lang._udonthaveperm)
  logger.info(`${msg.author.tag} sent command: ${msg.content}`)
  try { // eslint-disable-line
    const args = msg.content.replace(settings.prefix, '').split(' ')
    await command.run(msg, settings, lang, args)
  } catch (e) {
    await msg.channel.send(f(lang._error_occurred, command.name))
    logger.info(f(lang._error_occurred, command.name))
    throw e
  }
}

module.exports = async function(settings, msg, lang) {
  if ((msg.content === `<@${msg.client.user.id}>` || msg.content === `<@!${msg.client.user.id}>`) && msg.attachments.length === 0)
    return msg.channel.send(f(lang._prefixis, settings.prefix))
  if (msg.content.startsWith(settings.prefix)) {
    const [cmd] = msg.content.replace(settings.prefix, '').split(' ')
    if (settings.banned) return msg.channel.send(f(lang._error, 'Your server is banned.\nPlease contact to the this server -> https://discord.gg/xQQXp4B'))
    if (commands[cmd]) {
      await runCommand(commands[cmd], settings, msg, lang)
    } else if (await util.exists(`${__dirname}/plugins/commands/${cmd}.js`)) {
      const plugin = require(`${__dirname}/plugins/commands/${cmd}.js`)
      await runCommand(plugin, settings, msg, lang)
    } else {
      const commandList = Object.keys(commands).map(cmd => ({ cmd, args: commands[cmd].args }))
      const similarCommand = commandList.map(item => ({ ...item, no: levenshtein(cmd, item.cmd) }))
      const cmds = similarCommand.sort((a, b) => a.no - b.no).filter(item => item.no <= 2)
      const list = cmds.map(item => `・\`${settings.prefix}${item.cmd} ${item.args || ''}\``)
      msg.channel.send(f(lang._no_command, settings.prefix, cmd))
      if (list.length) msg.channel.send(f(lang._didyoumean, list.join('\n')))
    }
  }
}
