const f = require('string-format')
const util = require('../util')
const logger = require('../logger').getLogger('commands:autorole', 'green')

module.exports.args = '[add/remove] <Role>'

module.exports.name = 'autorole'

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = async function(msg, settings, lang, guildSettings) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  if (args[1] === 'remove') {
    const localSettings = settings
    localSettings.autorole = null
    await util.writeSettings(guildSettings, localSettings, msg.channel, 'autorole')
  } else if (args[1] === 'add') {
    const localSettings = settings
    if (/\d{18,}/.test(args[2])) {
      localSettings.autorole = args[2]
    } else {
      try {
        settings.autorole = msg.mentions.roles.first().id.toString() || msg.guild.roles.find(n => n.name === args[2]).id
      } catch(e) {
        msg.channel.send(lang.invalid_args); logger.error(e)
      }
    }
    await util.writeSettings(guildSettings, localSettings, msg.channel, 'autorole')
  } else {
    if (settings.autorole != null) {
      msg.channel.send(f(lang.autorole_enabled, msg.guild.roles.get(settings.autorole).name))
    } else if (!settings.autorole) {
      msg.channel.send(lang.autorole_disabled)
    }
  }
}
