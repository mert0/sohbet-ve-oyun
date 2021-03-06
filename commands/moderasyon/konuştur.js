const { Command } = require('discord.js-commando');
const Discord = require('discord.js');

module.exports = class ModerationMuteCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'konuştur',
			aliases: ['konuşturaç', 'sunucuda konuştur', 'unmute', 'unmuteat', 'susturaç'],
			group: 'moderasyon',
			memberName: 'konuştur',
			description: 'İstediğiniz kişiyi konuşturur.',
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 3
			},

			args: [
				{
					key: 'member',
					label: 'kullanıcı',
					prompt: 'Kimi konuşturmak istersin?',
					type: 'member'
				},
				{
					key: 'sebep',
					label: 'sebep',
					prompt: 'Neden bu kişiyi konuşturmak istiyorsun?',
					type: 'string'
				}
			]
		});
	}

	hasPermission(msg) {
		return this.client.isOwner(msg.author) || msg.member.hasPermission("KICK_MEMBERS")
	}

	async run(msg, args) {
		let guild = msg.guild
		const member = args.member;
		const user = member.user;
		const reason = args.sebep;
		const kasa = this.client.provider.get(msg.guild.id, 'modKasa', []);
		const eskikasano = Number(kasa);
		const kasano = parseInt(eskikasano) + 1;
		this.client.provider.set(msg.guild.id, 'modKasa', kasano);
		const vt = this.client.provider.get(msg.guild.id, 'modLog', []);
		const db = this.client.provider.get(msg.guild.id, 'modLogK', []);
		const mL = this.client.provider.get(msg.guild.id, 'muteList', []);
		if (db ==! "evet") return msg.channel.send(client.config.customEmojis.basarisiz + ' Lütfen `mod-log-ayarla` komutu ile mod-log kanalı belirleyiniz.');
		let modlog = vt;
		if (!modlog) return msg.channel.send(client.config.customEmojis.basarisiz + ' Mod-log olarak belirlediğiniz kanal silinmiş, lütfen yeni  bir mod-log kanalı açıp `mod-log-ayarla` komutu ile mod-log olarak ayarlayınız.');
		if (!msg.guild.member(user).kickable) return msg.channel.send(client.config.customEmojis.basarisiz + ' Bu kişiyi susturamıyorum çünkü `benden daha yüksek bir role sahip` ya da `bana gerekli yetkileri vermedin`.');
		if (!mL.includes(user.id)) return msg.channel.send(client.config.customEmojis.basarisiz + ' Bu kişi susturulmamış ki konuşturalım?!?!? _şizofren misin krdş?_');
		if (member.highestRole.calculatedPosition > msg.member.highestRole.calculatedPosition - 1) {
			return msg.say(client.config.customEmojis.basarisiz + ' Bu kişinin senin rollerinden/rolünden daha yüksek rolleri/rolü var.');
		}
		
		const index = mL.indexOf(user.id);
		mL.splice(index, 1);

		if (mL.length === 0) this.client.provider.remove(msg.guild.id, 'muteList');
		else this.client.provider.set(msg.guild.id, 'muteList', mL);

		msg.channel.overwritePermissions(user.id, {
			SEND_MESSAGES: true
		});

		let embed = {
			color: 3447003,
			author: {
				name: `${msg.author.tag} (${msg.author.id})`,
				icon_url: msg.author.avatarURL
			},
			fields: [
				{
					name: "❯ Eylem:",
					value: "Konuşturma",
					inline: false
				},
				{
					name: "❯ Kullanıcı:",
					value: `${user.tag} (${user.id})`,
					inline: false
				},
				{
					name: "❯ Yetkili:",
					value: `${msg.author.tag} (${msg.author.id})`,
					inline: false
				},
				{
					name: "❯ Sebep:",
					value: reason,
					inline: false
				}
			],
			timestamp: new Date(),
			footer: {
				text: `Sohbet ve Oyun | Kasa: ${kasano}`,
				icon_url: this.client.user.avatarURL
			},
			thumbnail: {
				url: user.avatarURL
			},
		};
		guild.channels.get(modlog).send({embed});
		member.send('**' + msg.guild.name + '** sunucusunda `' + msg.author.tag + '` adlı kişi/yetkili tarafından ___' + reason + '___ sebebi ile susturman açıldı.')
		return msg.channel.send(client.config.customEmojis.basarili + ' İşlem başarılı!');
	}
};
