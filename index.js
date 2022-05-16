require("dotenv").config();
const { Client, MessageEmbed } = require("discord.js");
const bot = new Client({ disableMentions: "everyone" });
const axios = require("axios");
const url = "https://korterelink.dk/api";

bot.on("ready", () => {
  console.log(`Klienten er startet!`);

  setInterval(() => {
    let status = [
      `Jeg er en bot der kan lave dine links kortere!`,
      `!hjælp for kommandoer`,
      `!info for at vide mere om mig`,
    ];
    let random = Math.floor(Math.random() * status.length);
    bot.user.setActivity(status[random], { type: "WATCHING" });
  }, 3000);
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
  } else if (command === "hjælp") {
    let logo = "https://korterelink.dk/static/images/Logo.webp";

    return message.channel.send(
      new MessageEmbed()
        .setColor("BLUE")
        .setTitle("Korterelink bot info")
        .setThumbnail(logo)
        .setDescription(
          "Jeg er en bot der kan forkorte dine links, og checke om de er gyldige.\n\n" +
            "Kommandoer:\n\n" +
            "**!forkort <link>** - Forkort link\n" +
            "**!check <link>** - Check link\n" +
            "**!info** - Info om boten"
        )
    );
  } else if (command === "info") {
    message.channel.send(
      new MessageEmbed()
        .setColor("BLUE")
        .setTitle("Korterelink bot info")
        .setThumbnail("https://korterelink.dk/static/images/Logo.webp")
        .setDescription(
          "Jeg er en bot der kan forkorte dine links, og checke om de er gyldige. Jeg er lavet ved hjælp af [Korterelinks API](https://korterelink.dk/api)\n\nJeg har ikke nogen tilknytning til ejeren af korterelink, jeg er bare en bot der lavet til discord, så det er nemere for jer her.\n\nEr du nysgerrig eller en udvikler, så tjek min [GitHub](https://github.com/lassv/korterelink-bot) ud."
        )
    );
  }
});

bot.login(process.env.TOKEN);
