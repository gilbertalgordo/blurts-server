exposure-landing-hero-heading = Ota selvää, ovatko henkilökohtaiset tietosi vaarantuneet
exposure-landing-hero-email-label = Sähköpostiosoite
exposure-landing-hero-email-placeholder = Kirjoita sähköpostiosoite
exposure-landing-hero-cta-label = Tarkista vuotojen varalta
exposure-landing-result-loading = Ladataan, odota hetki…
exposure-landing-result-error = Jotain meni pieleen, kun tietovuotoja tarkastettiin. Päivitä sivu ja yritä uudelleen.
# Variables:
#   $email (string) - The user's email address, used to identify their data in breaches
#   $count (number) - Number of data breaches in which the user's data was found
exposure-landing-result-hero-heading =
    { $count ->
        [one] Sähköpostiosoite <email>{ $email }</email> on ollut osallisena <count>1</count> tietovuodossa.
       *[other] Sähköpostiosoite <email>{ $email }</email> on ollut osallisena <count>{ $count }</count> tietovuodossa.
    }
exposure-landing-result-card-added = Vuoto lisätty:
exposure-landing-result-card-data = Paljastuneet tiedot:
exposure-landing-result-card-nothing = Tietovuotoja ei löytynyt
exposure-landing-result-footer-attribution = Vuototiedot tarjoaa <hibp-link>{ -brand-HIBP }</hibp-link>
exposure-landing-result-overflow-hero-cta-label = Kirjaudu sisään selvittääksesi vuodot
exposure-landing-result-overflow-footer-cta-label = Kirjaudu sisään nähdäksesi kaikki
exposure-landing-result-some-hero-cta-label = Kirjaudu sisään selvittääksesi vuodot
exposure-landing-result-some-footer-cta-label = Kirjaudu sisään selvittääksesi vuodot
exposure-landing-result-none-hero-cta-label = Vastaanota hälytyksiä uusista tietovuodoista
exposure-landing-result-none-footer-cta-label = Tilaa ilmoitukset
