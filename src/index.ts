import Discord, { TextChannel } from 'discord.js';
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
		
	const twitchChannels = ['spoodah', 'azfura', 'dexter0', 'pacopaco', 'jg7tv', 'sirkenbo'];
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
			const chnl = channel.trim();
			switch (chnl) {
				case '#spoodah':
					let botMsg = `PogChamp BITS DONATION!!! PogChamp Thank you so much @${user} for the ${msg.totalBits} bitties! You're too kind! alexiaLove`;
					publishMessage(channel, botMsg);
					break;
				case '#jg7tv':
					botMsg = `classCheer BITS DONATION!!! classCheer Thank you so much @${user} for the ${msg.totalBits} bitties! You're too kind! jg7tvWee`;
					publishMessage(channel, botMsg);
					break;
				case '#pacopaco':
					botMsg = `pacopaChamp BITS DONATION!!! pacopaChamp Thank you so much @${user} for the ${msg.totalBits} bitties! You're too kind! pacopaSmile`;
					publishMessage(channel, botMsg);
					break;
				default:
					botMsg = `PogChamp BITS DONATION!!! PogChamp Thank you so much @${user} for the ${msg.totalBits} bitties! You're too kind! alexiaLove`;
					publishMessage(channel, botMsg);
					break;
			}
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
			const chnl = channel.trim();
			switch (chnl) {
				case '#spoodah':
					let botMsg = `pokiPrime PRIME SUB!!! pokiPrime @${user} just subscribed using Twitch Prime! Welcome to the squadron <3 spoodGLB`;
					publishMessage(channel, botMsg);
					break;
				case '#jg7tv':
					botMsg = `classMob PRIME SUB!!! classMob @${user} just subscribed using Twitch Prime! Welcome to the Sub 7's! dazeriNlove`;
					publishMessage(channel, botMsg);
					break;
				case '#pacopaco':
					botMsg = `pokiPrime PRIME SUB!!! pokiPrime @${user} just subscribed using Twitch Prime! Welcome to the family pacopaSmile`;
					publishMessage(channel, botMsg);
					break;
				default:
					botMsg = `pokiPrime PRIME SUB!!! pokiPrime @${user} just subscribed using Twitch Prime! Welcome to the squadron <3 spoodGLB`;
					publishMessage(channel, botMsg);
					break;
			}
			publishMessage(channel, botMsg);
		}
		else if(subInfo.plan === '1000') {
			const chnl = channel.trim();
			switch(chnl) {
				case '#spoodah':
					let botMsg = `spoodHype NEW SUB!!! spoodHype @${user} just subscribed! Welcome to the squadron <3 spoodGLB`;
					publishMessage(channel, botMsg);
					break;
				case '#jg7tv':
					botMsg = `jg7tvHype NEW SUB!! jg7tvHype @${user} just subbed! jg7tvPog7 What color do you want the lights, @{user} ? alexiaPeek`;
					publishMessage(channel, botMsg);
					break;
				case '#pacopaco':
					botMsg = `pacopaChamp NEW SUB!!! pacopaChamp @${user} just subscribed! Enjoy the emotes and the vibes pacopaSmile`;
					publishMessage(channel, botMsg);
					break;
				default:
					botMsg = `PogChamp NEW SUB!!! PogChamp @${user} just subscribed! Welcome to the sub squad and stay a while! alexiaLove`;
					publishMessage(channel, botMsg);
					break;
			}
    }
    else if(subInfo.plan === '2000') {
			const chnl = channel.trim();
			switch(chnl) {
				case '#spoodah':
					let botMsg = `spoodHype NEW TIER 2 SUB!!! spoodHype @${user} just subscribed at Tier 2 ($9.99 USD)! THE STREAM IS FREE!!1! alexiaMega`;
					publishMessage(channel, botMsg);
					break;
				case '#jg7tv':
					botMsg = `jg7tvPog7 NEW TIER 2 SUB!!! jg7tvPog7 @${user} just subscribed at Tier 2 ($9.99 USD)! Thank you so freaking much for the support!!! alexiaLove`;
					publishMessage(channel, botMsg);
					break;
				case '#pacopaco':
					botMsg = `alexiaWow NEW TIER 2 SUB!!! alexiaWow @${user} just subscribed at Tier 2 ($9.99 USD)! Thank you so freaking much for the support!!! pacopaSmile`;
					publishMessage(channel, botMsg);
					break;
				default:
					botMsg = `alexiaWow NEW TIER 2 SUB!!! alexiaWow @${user} just subscribed at Tier 2 ($9.99 USD)! Thank you so freaking much for the support!!! alexiaLove`;
					publishMessage(channel, botMsg);
					break;
			}
    }
    else if(subInfo.plan === '3000') {
			const chnl = channel.trim();
			switch(chnl) {
				case '#spoodah':
					let botMsg = `spoodHype NEW TIER 3 SUB!!! spoodHype @${user} just subscribed at Tier 3 ($24.99 USD)! THE STREAM IS FREE!!1! alexiaMega`;
					publishMessage(channel, botMsg);
					break;
				case '#jg7tv':
					botMsg = `jg7tvPog7 NEW TIER 3 SUB!!! jg7tvPog7 @${user} just subscribed at Tier 3 ($24.99 USD)! Thank you so freaking much for the support!!! alexiaLove`;
					publishMessage(channel, botMsg);
					break;
				case '#pacopaco':
					botMsg = `alexiaWow NEW TIER 3 SUB!!! alexiaWow @${user} just subscribed at Tier 3 ($24.99 USD)! Thank you so freaking much for the support!!! pacopaSmile`;
					publishMessage(channel, botMsg);
					break;
				default:
					botMsg = `alexiaWow NEW TIER 3 SUB!!! alexiaWow @${user} just subscribed at Tier 3 ($24.99 USD)! Thank you so freaking much for the support!!! alexiaLove`;
					publishMessage(channel, botMsg);
					break;
			}
		}
  });

  chatClient.onResub((channel, user, subInfo) => {
    if(subInfo.isPrime) {
      const botMsg = `pokiPrime PRIME RESUB!!! pokiPrime Welcome back @${subInfo.displayName} for ${subInfo.months} months spoodGLB`;
      publishMessage(channel, botMsg);
    }
    else if(subInfo.plan === '1000') {
			const botMsg = `spoodHype RESUB!!! spoodHype @${subInfo.displayName} just resubscribed! Welcome back and thanks for the support <3 spoodGLB`;
			publishMessage(channel, botMsg);
    }
    else if(subInfo.plan === '2000') {
			const botMsg = `spoodHype RESUB!!! spoodHype @${subInfo.displayName} just resubscribed at Tier 2 ($9.99 USD)! Welcome back and thanks for the support <3 spoodGLB`;
			publishMessage(channel, botMsg);
    }
    else if(subInfo.plan === '3000') {
			const botMsg = `spoodHype RESUB!!! spoodHype @${subInfo.displayName} just resubscribed at Tier 3 ($24.99 USD)! Welcome back and thanks for the support <3 spoodGLB`;
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
    const botMsg = `spoodWYA NEW RAID!!! spoodWYA Thank you so much @${raidInfo.displayName} for the ${raidInfo.viewerCount} viewer raid! jg7tvWee`;
    publishMessage(channel, botMsg);
  });

	const giftCounts = new Map<string | undefined, number>();
  chatClient.onCommunitySub((channel, user, subInfo, msg) => {
    const previousGiftCount = giftCounts.get(user) ?? 0;
		giftCounts.set(user, previousGiftCount + subInfo.count);
		if (subInfo.count > 1) {
			const chnl = channel.trim();
			switch(chnl) {
					case '#spoodah':
						let botMsg = `xqcGift GIFT SUB HYPE!! xqcGift Thank you @${subInfo.gifterDisplayName} for gifting ${subInfo.count} subs to the squadron! alexiaLove`;
						publishMessage(channel, botMsg);
						let botMsg2 = `spoodHey Welcome to all the new subscribers! spoodSalute`;
						publishMessage(channel, botMsg2);
						break;
					case '#jg7tv':
						botMsg = `pokiGift GIFT SUB HYPE!! pokiGift Thank you @${subInfo.gifterDisplayName} for gifting ${subInfo.count} new people into the Sub 7's! jg7tvHype`;
						publishMessage(channel, botMsg);
						botMsg2 = `spoodHey Welcome to all the new subscribers! spoodSalute`;
						publishMessage(channel, botMsg2);
						break;
					case '#pacopaco':
						botMsg = `xqcGift GIFT SUB HYPE!! xqcGift Thank you @${subInfo.gifterDisplayName} for gifting ${subInfo.count} subs to the chat! alexiaLove`;
						publishMessage(channel, botMsg);
						botMsg2 = `spoodHey Welcome to all the new subscribers! spoodSalute`;
						publishMessage(channel, botMsg2);
						break;
					default:
						botMsg = `alexiaGift GIFT SUB HYPE!! alexiaGift Thank you @${subInfo.gifterDisplayName} for gifting ${subInfo.count} subs to the chat! alexiaLove`;
						publishMessage(channel, botMsg);
						botMsg2 = `spoodHey Welcome to all the new subscribers! spoodSalute`;
						publishMessage(channel, botMsg2);
						break;
				}
		}
		else {
			const botMsg = `alexiaGift RANDOM GIFT SUB HYPE!! alexiaGift Thank you ${subInfo.gifterDisplayName} for gifting a random sub to the chat! spoodLove`;
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
	const logChannel = (await dClient.guilds.fetch('788709812711456798')).channels.cache.get('788711449219694612') as TextChannel;

	const modListener = await pubSubClient.onModAction(userId, spoodId, message => {
		if (message.channelId === spoodId.toString()) {
			if (message.action === 'timeout') {
				const [target, duration, reason] = message.args;
				const moderator = message.userName;
				console.log(`${target} was timed out for ${duration} seconds by ${moderator}. (Reason: ${reason || 'not specified.'})`);
	
				const embedVar = new Discord.MessageEmbed()
					.setTitle('**Spoodah** - New Chat Event')
					.setColor('0xff9600')
					.setTimestamp()
					.addField('Timeout', `${target} was timed out for ${duration} seconds by ${moderator}.`)
					.addField('Reason', `${reason || 'not specified.'}`);
				if(logChannel.isText()) {
					(logChannel as TextChannel).send({ embed: embedVar});
				}
			}
	
			if(message.action === 'ban') {
				const [target, reason] = message.args;
				const moderator = message.userName;
				console.log(`${target} was banned by ${moderator}. (Reason: ${reason || 'not specified.'})`);
	
				const embedVar = new Discord.MessageEmbed()
					.setTitle('**Spoodah** - New Chat Event')
					.setColor('0xff0000')
					.setTimestamp()
					.addField('Ban', `${target} was banned by ${moderator}.`)
					.addField('Reason', `${reason || 'not specified.'}`);
					//@ts-ignore
				logChannel.send({ embed: embed});
			}
			
			if (message.action == 'unban') {
				const target = message.args[0];
				const moderator = message.userName;
				console.log(`${target} was un-banned by ${moderator}.`);
				
				const embedVar = new Discord.MessageEmbed()
					.setTitle('**Spoodah** - New Chat Event')
					.setColor('0x00ff7f')
					.setTimestamp()
					.addField('Unban', `${target} was un-banned by ${moderator}.`);
				// @ts-ignore
				logChannel.send({ embed: embed});
			}
	
			if (message.action == 'untimeout') {
				const target = message.args[0];
				const moderator = message.userName;
				console.log(`${target} was un-banned by ${moderator}.`);
				
				const embedVar = new Discord.MessageEmbed()
					.setTitle('**Spoodah** - New Chat Event')
					.setColor('0x00ff7f')
					.setTimestamp()
					.addField('Unban', `${target} was un-banned by ${moderator}.`);
				// @ts-ignore
				logChannel.send({ embed: embed});
			}
		}
	});
}

main();
