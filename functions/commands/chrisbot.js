const lib = require('lib')({ token: process.env.STDLIB_TOKEN });
const gsheet = require('gsheet-web');
const google = require('googleapis');
const _ = require('lodash');
const authentication = require('./authentication');

const config = require('./config.json');

function appendData(auth, image, description, callback) {
  const sheets = google.sheets('v4');

  sheets.spreadsheets.values.append({
    auth: auth,
    spreadsheetId: config.spreadsheetId,
    range: 'Feuille1!A2:B', //Change Sheet1 if your worksheet's name is something else
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[image, description]],
    },
  }, (err, response) => {
    if (err) {
      throw err;
    } else {
      callback(null, {
        response_type: 'in_channel',
        text: `Ton meme a été ajouté à la liste: ${image} avec la description : ${description}`
      });  
      console.log('Appended');    
    }
  });
}

/**
 * @param {string} user The user id of the user that invoked this command (name is usable as well)
 * @param {string} channel The channel id the command was executed in (name is usable as well)
 * @param {string} text The text contents of the command
 * @param {Array} attachments The attachments contents of the command
 * @param {object} command The full Slack command object
 * @param {string} botToken The bot token for the Slack bot you have activated
 * @returns {object}
 */
module.exports = (user, channel, text = '', attachments = [], command = {}, botToken = null, callback) => {
  const [action, ...options] = text.split(' ');
  const help = [
    'Tape `/chrisbot help` pour obtenir de l\'aide.',
    'Tape `/chrisbot png` pour avoir la photo de ma tête découpée.',
    'Tape `/chrisbot master` pour avoir la photo originale.',
    'Tape `/chrisbot random` pour obtenir un meme aléatoire.',
    'Tape `/chrisbot upload url_de_ton_image description_de_ton_image` pour la rajouter à la base de données.',
    'Tape `/chrisbot credits` pour les crédits.'
  ];
  switch (action) {
    case 'png':
      callback(null, {
        response_type: 'ephemeral',
        attachments: [
          {
            fallback: 'PNG.',
            image_url: 'http://i.imgur.com/qVZcDKR.png',
            thumb_url: 'http://i.imgur.com/qVZcDKR.png',
          },
        ],
      });
      break;
    case 'master': 
      callback(null, {
        response_type: 'ephemeral',
        attachments: [
          {
            fallback: 'Image originale',
            image_url: 'http://i.imgur.com/7qu5yML.jpg',
            thumb_url: 'http://i.imgur.com/7qu5yML.jpg'
          },
        ],
      });
      break;
    case 'help':
      callback(null, {
        response_type: 'ephemeral',
        text: help.join('\n'),
      });
      break;
    case 'random':
      gsheet(config.spreadsheetId, (data) => {
        const randomLine = _.sample(data);

        callback(null, {
          response_type: 'in_channel',
          text: `Salut <@${user}>, ${randomLine.description}`,
          attachments: [
            {
              fallback: randomLine.description,
              image_url: randomLine.image,
              thumb_url: randomLine.image,
            },
          ],
        });
      });
      break;
    case 'upload':
      const url = options.shift();
      const description = options.join(' ');

      authentication().authenticate()
        .then((auth) => {
          appendData(auth, url, description, callback);
        })
        /*.then(() => {
          callback(null, {
            response_type: 'ephemeral',
            'text': `Meme added: ${url} ${description}`,
          });
        })*/
        .catch((err) => {
         callback(err);
       });
      break;
    default:
      callback(null, {
        response_type: 'ephemeral',
        text: [
          `Salut <@${user}> c'est moi Chrisbot.`,
          ...help,
        ].join('\n'),
      });
      break;
  }
};
