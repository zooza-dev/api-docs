// Applies ?theme=movers|nord|splash and fills brand-specific text.
// Elements opt in with data-brand="key" (text) or data-brand-html="key".
( function () {
  var BRANDS = {
    movers: { cls: 't-movers', logo: 'little<b>movers</b>', domain: 'littlemovers.example', what: 'movement classes', place: 'Riverside Hall', town: 'Riverton', kid: 'Emma', kid2: 'Leo', parent: 'Anna', programme: 'Mini Movers', programme2: 'Tiny Movers', money: '£', pass: '10-class pass', nav: [ 'Classes', 'Locations', 'Timetable', 'Parent zone' ] },
    nord:   { cls: 't-nord', logo: 'Studio <b>Nord</b>', domain: 'studionord.example', what: 'music & dance lessons', place: 'Harbour Studio', town: 'Northvale', kid: 'Ida', kid2: 'Oskar', parent: 'Freja', programme: 'Piano Foundations', programme2: 'Ballet I', money: '€', pass: '8-lesson card', nav: [ 'Lessons', 'Studios', 'Schedule', 'Account' ] },
    splash: { cls: 't-splash', logo: 'Splash<b>Academy</b>', domain: 'splashacademy.example', what: 'swimming lessons', place: 'Bayside Pool', town: 'Port Ellis', kid: 'Mia', kid2: 'Noah', parent: 'Sara', programme: 'Stage 3 · Dolphins', programme2: 'Stage 1 · Starfish', money: '£', pass: '6-swim pass', nav: [ 'Lessons', 'Pools', 'Timetable', 'My account' ] },
  };
  var key = ( new URLSearchParams( location.search ).get( 'theme' ) ) || 'movers';
  var b = BRANDS[ key ] || BRANDS.movers;
  document.body.classList.add( b.cls );
  document.querySelectorAll( '[data-brand]' ).forEach( function ( el ) { el.textContent = b[ el.dataset.brand ]; } );
  document.querySelectorAll( '[data-brand-html]' ).forEach( function ( el ) { el.innerHTML = b[ el.dataset.brandHtml ]; } );
  document.querySelectorAll( '[data-url]' ).forEach( function ( el ) { el.textContent = b.domain + el.dataset.url; } );
  document.querySelectorAll( '.links' ).forEach( function ( el ) { el.innerHTML = b.nav.map( function ( n ) { return '<span>' + n + '</span>'; } ).join( '' ); } );
} )();
