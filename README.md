# CSCI 3330 Homework 4

GameBrain API integration using the supplied HTML and CSS.

## Run

Serve this folder with a local static web server and open index.html in a current browser. To configure the key before loading, paste it between the quotes in the API_KEY constant near the top of js/source.js. The checked-in placeholder is empty. If it is empty, the app can use an existing api_key in local storage or prompt for a key. A key entered through the prompt stays in memory until the page closes or reloads.

The default game is 33313, the example ID in the similar-games documentation. A previously configured game_id in local storage can override it.

The page loads game details, up to three news articles, and up to four similar games. If the selected game has no news, it uses game 1261640 from the documentation and labels those articles as the documentation example. The existing more button reloads the data.

## API references

- https://gamebrain.co/api/docs/game-detail
- https://gamebrain.co/api/docs/game-news
- https://gamebrain.co/api/docs/similar-games
