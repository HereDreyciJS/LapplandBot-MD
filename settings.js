import APIs from './lib/apis.js'

const settings = {
  bot: {
    name: 'Lappland Bot',
    prefix: '/',
    public: true,
    autoread: false,

    owners: [
      '239754268389439',
      '44981293158503'
    ],

    
    mods: [
      ''
    ],

    image: 'https://files.catbox.moe/t1e8hp.jpeg',

    newsletter: {
      jid: '120363392571425662@newsletter',
      name: 'Lappland Channel'
    }
  }
}

global.APIs = APIs

export default settings
