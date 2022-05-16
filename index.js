require("dotenv").config();
const { Client, MessageEmbed } = require("discord.js");
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
      return message.channel.send(
        new MessageEmbed()
          .setColor("RED")
          .setDescription("Du skal skrive et link, som jeg kan forkorte!")
      );
    }

    // Link validation.
    if (!linkArgs.includes("http" || "https")) {
      return message.channel.send(
        new MessageEmbed()
          .setColor("RED")
          .setDescription(
            "Du skal skrive et link som er gyldigt. Prøv med **http://** eller **https://**"
          )
      );
    }

    async function createLink() {
      await axios
        .put(`${url}/create?url=${linkArgs}`)
        .then(function (response) {
          let link = response.data.shortlink;
          return message.channel.send(
            new MessageEmbed()
              .setColor("BLUE")
              .setTitle("Link forkortet!")
              .setDescription(
                `Jeg har nu forkortet **${linkArgs}**, information nedenunder 🥳`
              )
              .addField("Original link", `${linkArgs}`, true)
              .addField("Forkortet link", `${link}`, true)
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
        new MessageEmbed()
          .setColor("RED")
          .setDescription(
            "Du skal angive en link til at checke, f.eks <https://ktlk.dk/gxNoTf4>"
          )
      );
    }

    // Link validation.
    if (!checkArgs.includes("http" || "https")) {
      return message.channel.send(
        new MessageEmbed()
          .setColor("RED")
          .setDescription(
            "Du skal skrive et link som er gyldigt. Prøv med **http://** eller **https://**"
          )
      );
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
              new MessageEmbed()
                .setColor("BLUE")
                .setTitle("Link checked!")
                .setDescription(
                  `Jeg har tjekket linket: **${checkArgs}**, og der var bingo 🥳`
                )
                .addField("Original link", `${originalLink}`, true)
                .addField("Forkortet link", `${shortedLink}`, true)
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
