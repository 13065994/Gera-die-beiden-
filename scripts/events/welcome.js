const p = global.utils.getPrefix(threadID);
const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "1.7",
		author: "NTKhang",
		category: "events"
	},

	langs: {
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối",
			welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",
			multiple1: "bạn",
			multiple2: "các bạn",
			defaultWelcomeMessage: "Xin chào {userName}.\nChào mừng bạn đến với {boxName}.\nChúc bạn có buổi {session} vui vẻ!"
		},
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",
			welcomeMessage: "Thank you for inviting me to the group!\nBot prefix: %1\nTo view the list of commands, please enter: %1help",
			multiple1: "you",
			multiple2: "you guys",
			defaultWelcomeMessage: `──━ 👑│𝗪𝗘𝗟𝗖𝗢𝗠𝗘 ━──\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n┏━━━━━━━━━━━━━━━━━━━━━━┓\n┃ ━ 𝙷𝚎𝚕𝚕𝚘 {userName} .\n┃ ━ 𝚠𝚎𝚕𝚌𝚘𝚖𝚎 𝚝𝚘 𝚘𝚞𝚛 {boxName} 𝚐𝚛𝚘𝚞𝚙 𝚠𝚎 𝚊𝚛𝚎 𝚙𝚕𝚎𝚊𝚜𝚎𝚍 𝚝𝚘 𝚑𝚊𝚟𝚎 𝚢𝚘𝚞 𝚠𝚒𝚝𝚑 𝚞𝚜.\n┃ ━ {multiple} 𝚖𝚊𝚔𝚎 𝚢𝚘𝚞𝚛 𝚜𝚎𝚕𝚏 𝚌𝚘𝚖𝚏𝚘𝚛𝚝𝚊𝚋𝚕𝚎 𝚒𝚗 𝚝𝚑𝚒𝚜 𝚐𝚛𝚘𝚞𝚙 𝚏𝚎𝚎𝚕 𝚏𝚛𝚎𝚎 𝚝𝚘 𝚍𝚒𝚜𝚌𝚞𝚜𝚜 𝚊𝚋𝚘𝚞𝚝 𝚊𝚗𝚢𝚝𝚑𝚒𝚗𝚐 𝚎𝚡𝚌𝚎𝚙𝚝 𝚗𝚞𝚍𝚎, 𝚙𝚘𝚛𝚗, 𝚑𝚎𝚗𝚝𝚎𝚒.\n┃ ━ 𝚖𝚢 𝚙𝚛𝚎𝚏𝚒𝚡 𝚒𝚜 ${p}\n┗━━━━━━━━━━━━━━━━━━━━━━┛\n➤ 𝗠𝗔𝗧𝗘𝗢 𝗖𝗛𝗔𝗧𝗕𝗢𝗧 𝗧𝗠`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const hours = getTime("HH");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;
				// if new member is bot
				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					return message.send(getLang("welcomeMessage", prefix));
				}
				// if new member:
				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};

				// push new member to array
				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				// if timeout is set, clear it
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				// set new timeout
				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);
					if (threadData.settings.sendWelcomeMessage == false)
						return;
					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const dataBanned = threadData.data.banned_ban || [];
					const threadName = threadData.threadName;
					const userName = [],
						mentions = [];
					let multiple = false;

					if (dataAddedParticipants.length > 1)
						multiple = true;

					for (const user of dataAddedParticipants) {
						if (dataBanned.some((item) => item.id == user.userFbId))
							continue;
						userName.push(user.fullName);
						mentions.push({
							tag: user.fullName,
							id: user.userFbId
						});
					}
					// {userName}:   name of new member
					// {multiple}:
					// {boxName}:    name of group
					// {threadName}: name of group
					// {session}:    session of day
					if (userName.length == 0) return;
					let { welcomeMessage = getLang("defaultWelcomeMessage") } =
						threadData.data;
					const form = {
						mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
					};
					welcomeMessage = welcomeMessage
						.replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
						.replace(/\{boxName\}|\{threadName\}/g, threadName)
						.replace(
							/\{multiple\}/g,
							multiple ? getLang("multiple2") : getLang("multiple1")
						)
						.replace(
							/\{session\}/g,
							hours <= 10
								? getLang("session1")
								: hours <= 12
									? getLang("session2")
									: hours <= 18
										? getLang("session3")
										: getLang("session4")
						);

					form.body = welcomeMessage;

					if (threadData.data.welcomeAttachment) {
						const files = threadData.data.welcomeAttachment;
						const attachments = files.reduce((acc, file) => {
							acc.push(drive.getFile(file, "stream"));
							return acc;
						}, []);
						form.attachment = (await Promise.allSettled(attachments))
							.filter(({ status }) => status == "fulfilled")
							.map(({ value }) => value);
					}
					message.send(form);
					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};
			
