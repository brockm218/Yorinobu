import Discord from 'discord.js';
import { RefreshableAuthProvider, StaticAuthProvider } from 'twitch-auth';
import { ChatClient } from 'twitch-chat-client';
import { PubSubClient } from 'twitch-pubsub-client';
import { ApiClient } from 'twitch';
import { promises as fs} from 'fs';
import * as dotenv from 'dotenv';

import { TwitchPrivateMessage } from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage';

dotenv.config();

async function main() {
	const tokenData = JSON.parse(await fs.readFile('./tokens.json', 'utf-8'));
	const loginInfo = {
		clientId: process.env.twitchClientId || '',
		clientSecret: process.env.twitchClientSecret || '',
		botToken: process.env.discordBotToken || '' 
	}
	
	const authProvider = new RefreshableAuthProvider(
		new StaticAuthProvider(loginInfo.clientId, tokenData.accessToken),
		{
			clientSecret: loginInfo.clientSecret,
			refreshToken: tokenData.refreshToken,
			expiry: tokenData.expiryTimestamp === null ? null : new Date(tokenData.expiryTimestamp),
			onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
				const newTokenData = {
					accessToken,
					refreshToken,
					expiryTimestamp: expiryDate === null ? null : expiryDate.getTime()
				};
				await fs.writeFile('./tokens.json', JSON.stringify(newTokenData, null, 4), 'utf-8');
			}
		}
		);
		
	const twitchChannels = ['spoodah', 'azfura', 'dexter0'];
	const chatClient = new ChatClient(authProvider, { channels: twitchChannels, logger: { minLevel: 'warning' } });
	await chatClient.connect()
	.then(() => {
		console.log('Twitch Client Connected.');
	})
	.catch(console.error);
	
	const dClient = new Discord.Client();
	dClient.on('ready', () => {
		console.log('Discord Client Connected.');
	});
	await dClient.login(loginInfo.botToken);
	
	const apiClient = new ApiClient({ authProvider });
	const pubSubClient = new PubSubClient();

	function publishMessage(channel: string, message: string) {
    console.log(channel, '-', message);
    chatClient.action(channel, message);
	}
	
	function computeDickSize(msg: TwitchPrivateMessage): string {
		const user = msg.userInfo;

		if(user.isBroadcaster) {
			let botMsg = 'spoodWYA CRITICAL ERROR: User\'s dick is too gigantic and broke the scale. System reboot in progress... spoodDab';
			return botMsg;
		} if(user.isMod) {
			const size = Math.floor((Math.random() * 10) + 11);
			const botMsg = `PogChamp @${user.displayName} has a dick size of ${size} inches. TwitchUnity`;
			return botMsg;
		} else if(user.isVip) {
			const size = Math.floor((Math.random() * 5) + 7);
			const botMsg = `PogChamp @${user.displayName} has a dick size of ${size} inches. TwitchUnity`;
			return botMsg;
		} else if(user.isSubscriber) {
			const size = Math.floor((Math.random() * 10) + 1);
			const botMsg = `PogChamp @${user.displayName} has a dick size of ${size} inches. TwitchUnity`;
			return botMsg;
		}

		return '';
	}

	chatClient.onMessage((channel, user, message, msg) => {
		if(msg.isCheer) {
			const botMsg = `PogChamp BITS DONATION!!! PogChamp Thank you so much @${user} for the ${msg.totalBits} bitties! You're too kind! spoodLove`;
			publishMessage(channel, botMsg);
		}

		if(message.toLowerCase() === '!myd' &&  ( msg.userInfo.isSubscriber || msg.userInfo.isVip || msg.userInfo.isMod )) {
			publishMessage(channel, computeDickSize(msg));
		}

		if(message.toLowerCase() === '!prime') {
			publishMessage(channel, `If you have Amazon Prime connect your account here -> twitch.amazon.com/prime ! Once you have linked your accounts click the sub button and sub for FREE PogChamp Need help? Click here -> https://goo.gl/VyzHCX cizzHearts`);
		}
	});

	chatClient.onSub((channel, user, subInfo) => {
		if(subInfo.isPrime) {
			const botMsg = `pokiPrime PRIME SUB!!! pokiPrime @${user} just subscribed using Twitch Prime! Welcome to the squadron <3 spoodGLB`;
			publishMessage(channel, botMsg);
		}
		else if(subInfo.plan === '1000') {
			const botMsg = `spoodHype NEW SUB!!! spoodHype @${user} just subscribed! Welcome to the squadron <3 spoodGLB`;
			publishMessage(channel, botMsg);
    }
    else if(subInfo.plan === '2000') {
			const botMsg = `spoodHype NEW TIER 2 SUB!!! spoodHype @${user} just subscribed at Tier 2 ($9.99 USD)! Welcome to the squadron <3 spoodGLB`;
			publishMessage(channel, botMsg);
    }
    else if(subInfo.plan === '3000') {
			const botMsg = `spoodHype NEW TIER 3 SUB!!! spoodHype @${user} just subscribed at Tier 3 ($24.99 USD)! Welcome to the squadron <3 spoodGLB`;
			publishMessage(channel, botMsg);
		}
  });

  chatClient.onResub((channel, user, subInfo) => {
    if(subInfo.isPrime) {
      const botMsg = `pokiPrime PRIME RESUB!!! pokiPrime Welcome back @${subInfo.displayName} for ${subInfo.months} months spoodGLB`;
      publishMessage(channel, botMsg);
    }
    else if(subInfo.plan === '1000') {
			const botMsg = `spoodHype RESUB!!! spoodHype @${user} just subscribed! Welcome to the squadron <3 spoodGLB`;
			publishMessage(channel, botMsg);
    }
    else if(subInfo.plan === '2000') {
			const botMsg = `spoodHype RESUB!!! spoodHype @${user} just subscribed at Tier 2 ($9.99 USD)! Welcome to the squadron <3 spoodGLB`;
			publishMessage(channel, botMsg);
    }
    else if(subInfo.plan === '3000') {
			const botMsg = `spoodHype RESUB!!! spoodHype @${user} just subscribed at Tier 3 ($24.99 USD)! Welcome to the squadron <3 spoodGLB`;
			publishMessage(channel, botMsg);
		}
  });
  
  chatClient.onHosted((channel, byChannel, auto, viewers) => {
    if (viewers && viewers >= 50) {
      const botMsg = `spoodWYA NEW HOST!!! spoodWYA Thank you so much ${byChannel} for the host with ${viewers} viewers! spoodLove Check them out at https://twitch.tv/${byChannel}`;
      publishMessage(channel, botMsg);
    }
    else if (auto) {
      const botMsg = `spoodWYA NEW HOST!!! spoodWYA Thank you so much for the automatic host from ${byChannel}! spoodLove Thank you for adding us to your automatic host list <3`;
      publishMessage(channel, botMsg);
    }
    else if (!viewers) {
      const botMsg = `spoodWYA NEW HOST!!! spoodWYA Thank you so much ${byChannel} for the host! spoodLove`;
      publishMessage(channel, botMsg);
    }
    else {
      const botMsg = `spoodWYA NEW HOST!!! spoodWYA Thank you so much ${byChannel} for the host with ${viewers} viewers! spoodLove`;
      publishMessage(channel, botMsg);
    }
  });

  chatClient.onRaid((channel, user, raidInfo) => {
    const botMsg = `spoodWYA NEW RAID!!! spoodWYA Thank you so much @${raidInfo.displayName} for the ${raidInfo.viewerCount} viewer raid! spoodLove`;
    publishMessage(channel, botMsg);
  });

	const giftCounts = new Map<string | undefined, number>();
  chatClient.onCommunitySub((channel, user, subInfo, msg) => {
    const previousGiftCount = giftCounts.get(user) ?? 0;
		giftCounts.set(user, previousGiftCount + subInfo.count);
		if (subInfo.count === 1) {
			const botMsg = `pokiGift GIFT SUB HYPE!! pokiGift Thank you @${subInfo.gifterDisplayName} for gifting ${subInfo.count} subs to the squadron! spoodGLB`;
			publishMessage(channel, botMsg);
			const botMsg2 = `spoodHey Welcome to all the new subscribers! spoodSalute`;
			publishMessage(channel, botMsg2);
		}
		else {
			const botMsg = `spoodGLB GIFT SUB HYPE!! spoodGLB Thank you ${subInfo.gifterDisplayName} for gifting a random sub to the squadron! spoodLove!`;
      publishMessage(channel, botMsg);
		}
  });

  chatClient.onSubGift((channel, recipient, subInfo) => {
    const user = subInfo.gifter;
    const previousGiftCount = giftCounts.get(user) ?? 0;
    if (previousGiftCount > 0) {
      giftCounts.set(user, previousGiftCount - 1);
    } else {
      const botMsg = `spoodGLB GIFT SUB HYPE!! spoodGLB Thank you ${subInfo.gifterDisplayName} for gifting a sub to ${recipient} spoodLove!`;
      publishMessage(channel, botMsg);
    }
	});

	chatClient.onAction((channel, user, message, msg) => {
		if(channel === '#spoodah') {
			if(!msg.userInfo.isSubscriber && !msg.userInfo.isMod) {
				chatClient.deleteMessage(channel, msg);
			}
		}
	});
	
	const userId = await pubSubClient.registerUserListener(apiClient);
	const spoodId = await apiClient.helix.users.getUserByName(twitchChannels[0]) ?? 0; // replace desired index from twitchChannels
	const logChannel = (await dClient.guilds.fetch('788709812711456798')).channels.cache.get('788711449219694612');

	const modListener = await pubSubClient.onModAction(userId, spoodId, message => {
		if (message.channelId === spoodId.toString()) {
			if (message.action === 'timeout') {
				const [target, duration, reason] = message.args;
				const moderator = message.userName;
				console.log(`${target} was timed out for ${duration} seconds by ${moderator}. (Reason: ${reason || 'not specified.'})`);
	
				const embed = new Discord.MessageEmbed()
					.setTitle('**Spoodah** - New Chat Event')
					.setColor('0xff9600')
					.setTimestamp()
					.addField('Timeout', `${target} was timed out for ${duration} seconds by ${moderator}.`)
					.addField('Reason', `${reason || 'not specified.'}`);
					//@ts-ignore
				logChannel.send(embed);
			}
	
			if(message.action === 'ban') {
				const [target, reason] = message.args;
				const moderator = message.userName;
				console.log(`${target} was banned by ${moderator}. (Reason: ${reason || 'not specified.'})`);
	
				const embed = new Discord.MessageEmbed()
					.setTitle('**Spoodah** - New Chat Event')
					.setColor('0xff0000')
					.setTimestamp()
					.addField('Ban', `${target} was banned by ${moderator}.`)
					.addField('Reason', `${reason || 'not specified.'}`);
					//@ts-ignore
				logChannel.send(embed);
			}
			
			if (message.action == 'unban') {
				const target = message.args[0];
				const moderator = message.userName;
				console.log(`${target} was un-banned by ${moderator}.`);
				
				const embed = new Discord.MessageEmbed()
					.setTitle('**Spoodah** - New Chat Event')
					.setColor('0x00ff7f')
					.setTimestamp()
					.addField('Unban', `${target} was un-banned by ${moderator}.`);
				// @ts-ignore
				logChannel.send(embed);
			}
	
			if (message.action == 'untimeout') {
				const target = message.args[0];
				const moderator = message.userName;
				console.log(`${target} was un-banned by ${moderator}.`);
				
				const embed = new Discord.MessageEmbed()
					.setTitle('**Spoodah** - New Chat Event')
					.setColor('0x00ff7f')
					.setTimestamp()
					.addField('Unban', `${target} was un-banned by ${moderator}.`);
				// @ts-ignore
				logChannel.send(embed);
			}
		}
	});
}

main();
