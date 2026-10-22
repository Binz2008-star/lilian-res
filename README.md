# Lilian Restaurant — Premium V2

Een Nederlandse, statische restaurantwebsite voor Lilian in Leeuwarden. De herkenbare zwart-rood-witte identiteit en het officiële logo blijven behouden. De nieuwe compositie gebruikt een groot sfeerbeeld, warme editorial secties, een doorzoekbare menukaart en duidelijke informatie voor bestellen en bezoeken.

## De menukaart

Alle 125 menu-items en 14 categorieën blijven behouden. Met JavaScript begint de kaart bij Burgers; **Alles** toont de volledige kaart. Zoeken doorzoekt naam en officiële beschrijving in alle categorieën, ongeacht hoofdletters en accenten. Daarna kan een categorie de zoekresultaten verder beperken. Wis de zoekopdracht of gebruik de resetknop als er geen resultaten zijn.

De complete kaart, categorieën, prijzen en uren staan ook in het oorspronkelijke HTML-document. Zonder JavaScript kan een bezoeker de volledige kaart lezen en de algemene officiële bestelknoppen gebruiken; zoeken en de lokale detailvensters vereisen JavaScript.

`restaurant-data.js` is de bron van waarheid. Na een gecontroleerde gegevenswijziging:

```bash
node scripts/sync-menu.mjs
```

Dit genereert de statische kaart, categorieknoppen, uren en Restaurant/Menu JSON-LD opnieuw tussen gemarkeerde blokken in `index.html`. Het controleert 125 unieke producten en 14 niet-lege categorieën. Er is geen build vereist bij het publiceren: het gegenereerde HTML-bestand wordt meegestuurd.

## Bestellen: officiële Lilian / Sitedish-integratie

Dit is een ontdek- en menukaartwebsite, geen aangesloten winkelwagen. Een gerecht opent een toegankelijk detailvenster met precies de officiële naam, omschrijving en prijs. **Open dit gerecht bij Lilian** opent `https://www.lilianrestaurant.nl/#product{id}` voor hetzelfde item in een nieuw tabblad.

De bezoeker voegt het gerecht daar zelf aan de officiële winkelwagen toe. Lilian / Sitedish beheert de bestelling, gegevens, beschikbare bezorg- of afhaaltijden, betaalwijzen en bevestiging. Deze website voegt niets aan de winkelwagen toe, verzendt geen bestelling en verwerkt geen betaling. Beschikbare tijden kunnen veranderen of ontbreken.

Algemene bestelknoppen openen `https://www.lilianrestaurant.nl/#menu`. Het bestaande besteloverzicht blijft beschikbaar via `https://www.lilianrestaurant.nl/bestellen`. Alle 125 ID-ankers, namen, categorieën, omschrijvingen en prijzen worden bij updates tegen de officiële kaart gecontroleerd.

## Informatie en beeldbronnen

Adres: Voorstreek 86, 8911 JT Leeuwarden. Telefoon: 0647789977. De officiële website vermeldde bij controle op 23 oktober 2026 openings- en bezorgtijden van 07:00–12:00 op alle weekdagen. Dit wordt als gepubliceerde broninformatie getoond, niet als live openingsstatus; laat de eigenaar deze opvallende uren bevestigen vóór een definitieve commerciële overdracht.

De foto is het gedeelde Sitedish-cafetaria-sfeerbeeld dat de officiële Lilian-site gebruikt, geen geverifieerde foto van een specifiek Lilian-gerecht. Daarom staat de foto alleen in de hero, met bronvermelding, en niet bij individuele producten. Het logo wordt niet vervormd of opnieuw getekend. Zie `brand-spec.md` voor assetbronnen en de lokaal meegeleverde SIL OFL-fontlicenties.

## Bestanden en techniek

- `index.html`: semantische secties, volledig statisch menu/uren, metadata, Restaurant/Menu JSON-LD en native detailvenster.
- `styles.css`: responsieve charcoal/rood/crème-compositie, leesbare cards, focus, touch-targets, beperkte CSS-3D-diepte en reduced-motion/print.
- `app.js`: categorieën/zoeken, exacte productvensters, focusherstel en mobiele navigatie.
- `motion.js`: selectieve IntersectionObserver-reveals, begrensde desktopparallax en hero-entree via Web Animations.
- `restaurant-data.js`: behouden officiële catalogus en URLs.
- `scripts/sync-menu.mjs`: reproduceerbare statische kaart/schema-generatie, uitsluitend Node ingebouwde modules.
- `assets/`: originele logo/foto plus geoptimaliseerde lokale WebP-, icon- en lettertypebestanden.
- `site.webmanifest`, `sitemap.xml`, `manus-routes.json`, `.nojekyll`: relatieve statische compatibiliteit en pagina-/iconmetadata.

Geen nieuwe runtime-dependencies, GSAP, WebGL of Three.js. Zoek- en toetsenbordreacties zijn direct; pointerfiltering animeert maximaal zes kaarten. Dialogen ondersteunen Escape, buitenklik en focusherstel. Motion wordt uitgeschakeld bij `prefers-reduced-motion`; hover is nergens noodzakelijk.

## Lokaal en GitHub Pages

```bash
python3 -m http.server 3000 --bind 0.0.0.0
```

De productiehost is [GitHub Pages](https://binz2008-star.github.io/lilian-res/), vanuit `main` en de repository-root van [Binz2008-star/lilian-res](https://github.com/Binz2008-star/lilian-res). Alle applicatie- en assetpaden zijn relatief en werken onder `/lilian-res/`. Een gewone push naar `main` werkt de site bij; er is geen wijziging aan de bestaande Pages-configuratie nodig.

Canonical en OG URL verwijzen naar deze Pages-publicatie. Als Lilian dit ontwerp later op zijn officiële domein zet, wijzig dan canonical/OG/schema/sitemap naar dat domein en controleer de Sitedish-routes opnieuw. `robots.txt` op een repository-subpad bestuurt niet de GitHub-gebruikersdomeinroot; er worden daarom geen misleidende crawlerregels toegevoegd.
