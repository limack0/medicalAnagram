# Application d'Anagrammes Médicaux

Une application web interactive de jeux d'anagrammes sur le thème médical, conçue pour être intégrée à un bot Telegram.

## Fonctionnalités

- 🎮 Jeu de 20 questions avec anagrammes médicaux
- 💾 Système de sauvegarde automatique des parties
- 🏆 Classement et statistiques de performance
- 🎨 Personnalisation avec différents thèmes
- 📊 Suivi de progression avec badges et récompenses
- 📱 Interface responsive adaptée aux mobiles

## Installation sur GitHub Pages

1. Créez un nouveau repository sur GitHub
2. Téléchargez tous les fichiers dans le repository
3. Activez GitHub Pages dans les paramètres du repository
4. L'application sera accessible à l'adresse : `https://limack0.github.io/medicalAnagram/`

## Intégration avec Telegram

Pour intégrer l'application à votre bot Telegram :

```javascript
// Exemple de code pour un bot Telegram (Node.js)
bot.onText(/\/anagrammes/, (msg) => {
  const chatId = msg.chat.id;
  const keyboard = {
    inline_keyboard: [[
      {
        text: "🎮 Jouer aux anagrammes médicaux",
        web_app: { url: "https://limack0.github.io/medicalAnagram/" }
      }
    ]]
  };
  
  bot.sendMessage(chatId, "Testez vos connaissances médicales avec ce jeu d'anagrammes!", {
    reply_markup: keyboard
  });
});