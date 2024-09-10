### Usage
* Main (Run server): `node dist/app.js`
* Frontend: `npm run dev`
* Initialize database: `npx ts-node src/database/initDatabase.ts`
* Fill database with given assignments and answers: `npx ts-node src/database/SeedDatabase.ts`

### Notes:

chatrtx ei toiminut, koska sovellus vaatisi rajapintaa. Siihen olisi ollut mahdollisuutena 2 github projektia, joista toinen on typescript pohjainen ja toinen python. Kumpikaan ei enään nykyään toimi, koska nvidia poisti mahdollisuuden käyttää chatrtx siihen käyttötarkoitukseen. Siispä siirryin ensin openai:n chatgpt ja se toimii suht hyvin tehtävien tarkastamiseen. Rakensin sovelluksen Vite js ympäristössä ractilla ja typescriptilllä. Tehtävät ja niiden oikeat vastaukset tallensin sqlite tietokantaan. Frontend pyörii portissa 5173 ja lukee serveriä (backendia), joka pyörii portissa 3000. 