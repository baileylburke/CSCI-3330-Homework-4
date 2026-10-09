# CSCI 3330 Homework 4

GameBrain API integration using the supplied HTML and CSS.

## Run

Serve this folder with a local static web server and open index.html in a current browser. Enter your GameBrain API key when prompted. The code does not contain an API key and keeps a newly entered key only in memory until the page closes or reloads. Never commit a real key.

The default game is 1273796. A previously configured game_id in local storage can override it. The app also accepts an existing api_key in local storage for compatibility with the starter.

The page loads game details, up to three news articles, and up to four similar games. If the selected game has no news, it uses game 1261640 from the documentation and labels those articles as the documentation example. The existing more button reloads the data.

## API references

- https://gamebrain.co/api/docs/game-detail
- https://gamebrain.co/api/docs/game-news
- https://gamebrain.co/api/docs/similar-games
