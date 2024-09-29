### Usage
* Main (Run server): `node dist/app.js`
* Frontend: `npm run dev`
* Initialize database: `npx ts-node src/database/initDatabase.ts`
* Fill database with given assignments and answers: `npx ts-node src/database/SeedDatabase.ts`

### Notes:

chatrtx ei toiminut, koska sovellus vaatisi rajapintaa. Siihen olisi ollut mahdollisuutena 2 github projektia, joista toinen on typescript pohjainen ja toinen python. Kumpikaan ei enään nykyään toimi, koska nvidia poisti mahdollisuuden käyttää chatrtx siihen käyttötarkoitukseen. Siispä siirryin ensin openai:n chatgpt ja se toimii suht hyvin tehtävien tarkastamiseen. Rakensin sovelluksen Vite js ympäristössä ractilla ja typescriptilllä. Tehtävät ja niiden oikeat vastaukset tallensin sqlite tietokantaan. Frontend pyörii portissa 5173 ja lukee serveriä (backendia), joka pyörii portissa 3000. Chat rtx.


AI:n käyttö syötteiden tulkitsemiseen. Voisi käyttää esim. ohjelmointitenttien tarkastelemiseen

Tekoälyjen historiaa, muiltakin aloilta. Teoriaa kielimalleista ja tekoälystä.
Suunnittelussa voi kerrota testauksesta
Metropolia moodlessa coderunner
Olemassa olevat palvelut
lokaali vai ulkoinen api
Eettisyys
Virhemarginaalit

koodiin vai voiko käyttää esim. historian kokeisiin?
voiko käyttää ilman laajaa kouluttamista?

ChatRTX - voisi rakentaa Rest APIn, jotta sitä voisi käyttää muutoinkin kuin lokaalisti. Tälläisen löysin siihen liittyen:https://github.com/rpehkone/Chat-With-RTX-python-api. Sovellus voisi olla tuo tenttien tarkastaminen. Tai jotain muuta, esim. voisi verrata muihin sovelluksiin, jotka pyörittävät kielimalleja, kuten Ollama ja LM Studio

vektoritietokanta?

Ollaama sekä meta llama, azure AI, gemini, openAI spännäriltä

3 versioo, jokaselle AI:lle omat kutsut

dedikset. jossain 1.11. ilkalla

console.log("kala")