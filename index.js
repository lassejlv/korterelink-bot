require("dotenv").config();
const { Client } = require("discord.js");
const bot = new Client({ disableMentions: "everyone" });
const axios = require("axios");
const url = "https://korterelink.dk/api";

bot.on("ready", () => {
  console.log(`Klienten er startet!`);
  bot.user.setActivity("Jeg laver dine lange links kortere!", {
    type: "WATCHING",
  });
});

bot.on("message", async (message) => {
  let prefix = process.env.PREFIX;

  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  let command = message.content.split(" ")[0];
  command = command.slice(prefix.length);

  let args = message.content.split(" ").slice(1);

  if (command === "forkort") {
    let linkArgs = args.join(" ");

    // Hvis brugeren ikke skriver noget link, så sender vi en error.
    if (!linkArgs) {
      return message.channel.send("Du skal angive en link");
    }

    // Link validation.
    if (!linkArgs.includes("http" || "https")) {
      return message.channel.send("Du angav ikke et link!");
    }

    async function createLink() {
      await axios
        .put(`${url}/create?url=${linkArgs}`)
        .then(function (response) {
          let link = response.data.shortlink;
          return message.channel.send(
            `Dit link er nu blevet forkortet til: ${link}`
          );
        })
        .catch(function (error) {
          message.channel.send(error);
          console.log(error);
        });
    }

    createLink();
  } else if (command === "check") {
    let checkArgs = args.join(" ");

    // Hvis brugeren ikke skriver noget link, så sender vi en error.
    if (!checkArgs) {
      return message.channel.send(
        "Du skal angive en link til at checke, f.eks <https://ktlk.dk/gxNoTf4>"
      );
    }

    // Link validation.
    if (!checkArgs.includes("http" || "https")) {
      return message.channel.send("Du angav ikke et link!");
    }

    async function checkLink() {
      await axios
        .get(`${url}/check?url=${checkArgs}`)
        .then(function (response, err) {
          if (err) {
            return;
          } else {
            let originalLink = response.data.url;
            let shortedLink = response.data.shorturl;

            return message.channel.send(
              `Du har angivet: <${checkArgs}> \nForkortet link: <${shortedLink}> \nOriginal link er: <${originalLink}>`
            );
          }
        })
        .catch(function (error) {
          return;
        });
    }

    checkLink();
  }
});

bot.login(process.env.TOKEN);
