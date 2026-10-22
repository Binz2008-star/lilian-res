# Lilian Restaurant — website

Website voor Lilian Restaurant in Leeuwarden. Het ontwerp volgt de door de klant aangeleverde menukaart als visuele richting: houtskoolzwart, rood en wit, compacte menukoppen en duidelijk leesbare prijzen. De site gebruikt de officiële restaurantnaam en het logo.

## Officiële informatie

Menu-items, categorieën, beschrijvingen en prijzen zijn overgenomen van de actuele officiële website van [Lilian Restaurant](https://www.lilianrestaurant.nl/). De weergegeven contactgegevens zijn Voorstreek 86, 8911JT Leeuwarden en 0647789977. De officiële website vermeldt openingstijden en bezorgtijden van 07:00 tot 12:00 voor alle weekdagen. De site verwijst voor actuele beschikbaarheid en bestellen door naar [de officiële bestelpagina](https://www.lilianrestaurant.nl/bestellen).

Controleer prijzen en openingstijden voordat je een wijziging publiceert; de restaurantwebsite en voorraad kunnen veranderen. De website claimt niet dat de zaak op dit moment geopend is.

## Bestanden

- `index.html`: Nederlandse site, navigatie, introductie, menukaart en contactgegevens.
- `styles.css`: zwart-rood-witte stijl, menu-boardcomponenten en mobiele weergave.
- `restaurant-data.js`: gegevens voor 125 producten, 14 categorieën, adres, telefoon en uren.
- `app.js`: categorieknoppen, prijspresentatie en mobiele navigatie.
- `assets/lilian-official-logo.jpg` en `assets/official-food.jpg`: lokaal gebundelde afbeeldingen van de officiële Lilian-website.

## Lokaal bekijken

Open `index.html` of start een statische server:

```bash
python3 -m http.server 8000
```

Open daarna `http://localhost:8000`.

## GitHub Pages

De website wordt gehost vanuit de hoofdmap van de `main`-branch in [Binz2008-star/lilian-res](https://github.com/Binz2008-star/lilian-res). GitHub Pages is ingesteld op `main` en `/(root)`. Het publieke adres is [https://binz2008-star.github.io/lilian-res/](https://binz2008-star.github.io/lilian-res/). Een push naar `main` werkt de gepubliceerde site bij.
