module.exports = function(settings, msg) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const emojiList = msg.guild.emojis.map(e=>e.toString()).join(' ')
  if (args[1] === 'escape') {
    msg.channel.send(`\`\`\`${emojiList}\`\`\``)
  } else {
    msg.channel.send(`${emojiList}`)
  }
}