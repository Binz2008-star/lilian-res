# Lilian Restaurant — website

Website voor Lilian Restaurant in Leeuwarden. Het ontwerp volgt de door de klant aangeleverde menukaart als visuele richting: houtskoolzwart, rood en wit, compacte menukoppen en duidelijk leesbare prijzen. De site gebruikt de officiële restaurantnaam en het logo.

## Bestellen en menu-interactie

De lijst op deze website is een menukaart, geen aangesloten winkelwagen. Klik of tik op een gerecht om de naam, officiële beschrijving en prijs in een detailvenster te bekijken. De knop **Bekijk dit gerecht bij Lilian** opent hetzelfde gerecht op de officiële menukaart via de unieke `#product{id}`-ankerlink. De 125 productankers zijn gecontroleerd op de officiële site.

Op de officiële menukaart voegt de bezoeker het gerecht zelf toe met de prijs-/toevoegknop. Daarna gaat de bestelling verder in de winkelwagen van Lilian/Sitedish: de bezoeker controleert de bestelling, vult de gevraagde gegevens in, kiest een beschikbare bezorg- of afhaaltijd en betaalwijze, en rondt de bestelling daar af. Deze website verstuurt geen bestelling, vult geen winkelwagen vooraf en verwerkt geen betaling. De beschikbaarheid van besteltijden kan wijzigen; controleer die op het officiële bestelsysteem.

Algemene knoppen zoals **Bestel online** beginnen op [de officiële menukaart](https://www.lilianrestaurant.nl/#menu). De link onderaan de menukaart opent [het besteloverzicht](https://www.lilianrestaurant.nl/bestellen) voor bezoekers die al iets hebben toegevoegd. Het officiële restaurant vermeldt Voorstreek 86, 8911JT Leeuwarden en telefoon 0647789977.

## Officiële informatie

Menu-items, categorieën, beschrijvingen en prijzen zijn overgenomen van de actuele officiële website van [Lilian Restaurant](https://www.lilianrestaurant.nl/). De officiële website vermeldt openingstijden en bezorgtijden van 07:00 tot 12:00 voor alle weekdagen. Controleer prijzen en openingstijden voordat je een wijziging publiceert; de restaurantwebsite en voorraad kunnen veranderen. De website claimt niet dat de zaak op dit moment geopend is.

## Bestanden

- `index.html`: Nederlandse site, navigatie, introductie, menukaart, productdetailvenster en contactgegevens.
- `styles.css`: zwart-rood-witte stijl, menu-boardcomponenten, productknoppen, detailvenster en mobiele weergave.
- `restaurant-data.js`: gegevens voor 125 producten, 14 categorieën, adres, telefoon, officiële menu-, product- en checkoutlinks en openingstijden.
- `app.js`: categorieknoppen, toegankelijke productdetails, focusherstel, mobiele navigatie en uren.
- `assets/lilian-official-logo.jpg` en `assets/official-food.jpg`: lokaal gebundelde afbeeldingen van de officiële Lilian-website.

## Lokaal bekijken

Open `index.html` of start een statische server:

```bash
python3 -m http.server 8000
```

Open daarna `http://localhost:8000`.

## GitHub Pages

De website wordt gehost vanuit de hoofdmap van de `main`-branch in [Binz2008-star/lilian-res](https://github.com/Binz2008-star/lilian-res). GitHub Pages is ingesteld op `main` en `/(root)`. Het publieke adres is [https://binz2008-star.github.io/lilian-res/](https://binz2008-star.github.io/lilian-res/). Een push naar `main` werkt de gepubliceerde site bij.
