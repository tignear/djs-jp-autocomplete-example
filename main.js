import { ApplicationIntegrationType, Client, InteractionContextType, Locale, SlashCommandBuilder } from "discord.js";
/**
 * @type {import("moment").Moment}
 */
import moment from 'moment';
import 'moment-timezone';
import "moment/locale/id.js";
import "moment/locale/en-gb.js";
import "moment/locale/bg.js";
import "moment/locale/zh-cn.js";
import "moment/locale/zh-tw.js";
import "moment/locale/hr.js";
import "moment/locale/cs.js";
import "moment/locale/da.js";
import "moment/locale/nl.js";
import "moment/locale/fi.js";
import "moment/locale/fr.js";
import "moment/locale/de.js";
import "moment/locale/el.js";
import "moment/locale/hi.js";
import "moment/locale/hu.js";
import "moment/locale/it.js";
import "moment/locale/ja.js";
import "moment/locale/ko.js";
import "moment/locale/lt.js";
import "moment/locale/nb.js";
import "moment/locale/pl.js";
import "moment/locale/pt-br.js";
import "moment/locale/ro.js";
import "moment/locale/ru.js";
import "moment/locale/es.js";
import "moment/locale/sv.js";
import "moment/locale/th.js";
import "moment/locale/tr.js";
import "moment/locale/uk.js";
import "moment/locale/vi.js";

const discordMomentLocaleMapping = {
  "id": "id",
  "en-US": "en",
  "en-GB": "en-gb",
  "bg": "bg",
  "zh-CN": "zh-cn",
  "zh-TW": "zh-tw",
  "hr": "hr",
  "cs": "cs",
  "da": "da",
  "nl": "nl",
  "fi": "fi",
  "fr": "fr",
  "de": "de",
  "el": "el",
  "hi": "hi",
  "hu": "hu",
  "it": "it",
  "ja": "ja",
  "ko": "ko",
  "lt": "lt",
  "no": "nb",
  "pl": "pl",
  "pt-BR": "pt-br",
  "ro": "ro",
  "ru": "ru",
  "es-ES": "es",
  "es-419": "es",
  "sv-SE": "sv",
  "th": "th",
  "tr": "tr",
  "uk": "uk",
  "vi": "vi"
};
moment.relativeTimeThreshold("ss", 0);

const client = new Client({
  intents: [],
});
const id = x => x;
const styles = ["f", "F", "d", "D", "t", "T", "R"];
/**
 * @type {Array<[string,function(number):number,function(function():import("moment").Moment):number]>}
 */
const schema = [
  ["year", id, t => t().year()],
  ["month", x => x - 1, t => t().month()],
  ["date", id, t => t().date()],
  ["hour", id, _t => 0],
  ["minute", id, _t => 0],
  ["second", id, _t => 0],
];
/**
 * 
 * @param {Omit<import("discord.js").CommandInteractionOptionResolver, "getMessage" | "getChannel" | "getUser" | "getMember" | "getRole" | "getAttachment" | "getMentionable">} options 
 * @param {function():import("moment").Moment} lazy_now 
 * @param {string?} timezone 
 * @returns {import("moment").Moment}
 */
function createDateTimeFromInteractionOptions(options, lazy_now, timezone) {
  const tz = timezone ?? options.getString("timezone") ?? "Asia/Tokyo";
  return moment.tz(schema.map(([k, fix_func, default_func]) => {
    const v = options.getInteger(k);
    if (v != null) {
      return fix_func(v);
    } else {
      return default_func(lazy_now);
    }
  }
  ), tz);
}
/**
 * @param {Omit<import("discord.js").CommandInteractionOptionResolver, "getMessage" | "getChannel" | "getUser" | "getMember" | "getRole" | "getAttachment" | "getMentionable">} options 
 * @param {string} locale 
 * @param {function():import("moment").Moment} lazy_now 
 * @param {Record<string,string|null>?} overwrite
 */
function createTimeString(options, locale, lazy_now, overwrite = {}) {
  const time = createDateTimeFromInteractionOptions(options, lazy_now, overwrite.timezone).locale([discordMomentLocaleMapping[overwrite.locale ?? options.getString("locale") ?? locale]]);
  const style = overwrite.style ?? options.getString("style") ?? "f";
  switch (style) {
    case "R": return time.from(lazy_now());
    case "t": return time.format("HH:mm");
    case "T": return time.format("HH:mm:ss");
    case "d": return time.format("HH:mm:ss");
    case "D": return time.format("LL");
    case "f": return time.format("L HH:mm");
    case "F": return time.format("LL HH:mm");
  }
}
function createLazyNow() {
  let lazy_time_cache = null;
  return () => {
    lazy_time_cache ??= moment.utc();
    return lazy_time_cache;
  };
}
/**
 * 
 * @param {import("discord.js").ChatInputCommandInteraction} interaction 
 */
async function handleTimeCommand(interaction) {

  const v = ["t", createDateTimeFromInteractionOptions(interaction.options, createLazyNow()).unix().toString()];
  const style = interaction.options.getString("style");
  if (style != null) {
    v.push(style);
  }
  const text = `<${v.join(":")}>`;

  await interaction.reply({
    content: `${text}`
  });
}
/**
 * 
 * @param {import("discord.js").AutocompleteInteraction} interaction 
 */
async function handleTimeCommandAutocomplete(interaction) {
  const AUTOCOMPLETE_ENTRY_MAX_LENGTH = 25;
  const { name, value } = interaction.options.getFocused(true);
  const lazy_now = createLazyNow();
  if (name === "style") {
    await interaction.respond(styles.filter(e => e.startsWith(value)).map(k => { return { name: k + ":" + createTimeString(interaction.options, interaction.locale, lazy_now, { style: k }), value: k }; }));
  } else if (name === "locale") {
    const autocomplete = Object.values(Locale).filter(e => e.toLowerCase().startsWith(value.toLowerCase()));
    await interaction.respond(autocomplete.slice(0, Math.min(autocomplete.length, AUTOCOMPLETE_ENTRY_MAX_LENGTH)).map(e => {
      return { name: e + ":" + createTimeString(interaction.options, interaction.locale, lazy_now, { locale: e }), value: e }
    }));
  } else if (name === "timezone") {
    const autocomplete = moment.tz.names().filter(e => e.toLowerCase().startsWith(value.toLowerCase()));
    await interaction.respond(autocomplete.slice(0, Math.min(autocomplete.length, AUTOCOMPLETE_ENTRY_MAX_LENGTH)).map(e => {
      return { name: e + ":" + createTimeString(interaction.options, interaction.locale, lazy_now, { timezone: e }), value: e }
    }));
  } else {
    const valid = schema.map(([k]) => k).includes(name) ? Number.isInteger(+value) && (+value > 0) : true;
    if (valid) {
      const time = createTimeString(interaction.options, interaction.locale, lazy_now);
      await interaction.respond([
        {
          name: value + ":" + time,
          value
        }
      ]);
    } else {
      await interaction.respond([]);
    }
  }
}
const command = new SlashCommandBuilder()
  .setName("time")
  .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
  .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
  .setDescription("unix timestamp<t:TIMESTAMP:STYLE>を生成します。")
  .addIntegerOption(option => option.setName("year").setMinValue(0).setMaxValue(2099).setDescription("年").setRequired(false).setAutocomplete(true))
  .addIntegerOption(option => option.setName("month").setMinValue(1).setMaxValue(12).setDescription("月").setRequired(false).setAutocomplete(true))
  .addIntegerOption(option => option.setName("date").setMinValue(1).setMaxValue(31).setDescription("日").setRequired(false).setAutocomplete(true))
  .addIntegerOption(option => option.setName("hour").setMinValue(0).setMaxValue(47).setDescription("時").setRequired(false).setAutocomplete(true))
  .addIntegerOption(option => option.setName("minute").setMinValue(0).setMaxValue(59).setDescription("分").setRequired(false).setAutocomplete(true))
  .addIntegerOption(option => option.setName("second").setMinValue(0).setMaxValue(59).setDescription("秒").setRequired(false).setAutocomplete(true))
  .addStringOption(option => option.setName("style").setDescription("スタイル。デフォルトはf。").setAutocomplete(true))
  .addStringOption(option => option.setName("timezone").setDescription("タイムゾーン。入力の解釈に影響します。デフォルトはAsia/Tokyo。").setAutocomplete(true))
  .addStringOption(option => option.setName("locale").setDescription("言語。これはオートコンプリートにのみ影響し、結果に影響しません。").setAutocomplete(true));

/**
 * @param {import("discord.js").Interaction} interaction 
 */
async function handleInteraction(interaction) {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "time") {
      await handleTimeCommand(interaction);
    }
  }
  if (interaction.isAutocomplete()) {
    await handleTimeCommandAutocomplete(interaction);
  }

}
client.on("interactionCreate", i => handleInteraction(i).catch(err => console.error(err)));

await client.login(process.env.DISCORD_BOT_TOKEN);
await client.application.commands.set([
  command
]);