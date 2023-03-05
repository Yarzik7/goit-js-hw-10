import './css/styles.css';
import debounce from 'lodash.debounce';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { fetchCountries } from './fetchCountries';

const DEBOUNCE_DELAY = 300;

const inputEl = document.querySelector('#search-box');
const countriesListEl = document.querySelector('.country-list');
const countryInfoEl = document.querySelector('.country-info');

countriesListEl.style.cssText = `margin: 0; padding: 0; list-style: none;`;

const promiseProcessing = (entity, isError) => {
  if (isError) {
    entity === '404'
      ? Notify.failure('Oops, there is no country with that name')
      : console.log('Помилка: ', entity);

    return;
  }

  if (entity.length > 10) {
    Notify.info('Too many matches found. Please enter a more specific name.');
      
    reset();
    return;
  } else if (entity.length > 1) {
    renderCountriesList(entity);
    return;
  }

  renderCountryInfo(entity[0]);
};

const loadInfo = event => {
  const nameCountry = event.target.value.trim();

  if (!nameCountry) {
    reset();
    return;
  }

  fetchCountries(nameCountry)
    .then(countries => promiseProcessing(countries, false))
    .catch(error => promiseProcessing(error.message, true));
};

function renderCountriesList(countries) {
  reset();
  const marcup = countries.map(
    ({ name: { official }, flags: { svg } }) =>
      `<li style = "display: flex; align-items: center; gap: 10px;">
          <img src="${svg}" alt="${official} flag" width="30" height="30"/>${official}
       </li>`
  );

  countriesListEl.insertAdjacentHTML('beforeend', marcup.join(''));
}

function renderCountryInfo(country) {
  reset();

  const {
    name: { official },
    capital,
    population,
    languages,
    flags: { svg },
  } = country;

  const marcup = `<div style = "display: flex; align-items: center; gap: 10px;">
                    <img src = "${svg}" alt = "${official} flag" width="30" height="30"/>
                    <h1>${official}</h1>
                  </div>
                  <p>Capital: ${capital[0]}</p>
                  <p>Population: ${population}</p>
                  <p>Languages: ${Object.values(languages).join(', ')}</p>`;

  countryInfoEl.insertAdjacentHTML('beforeend', marcup);
}

function reset() {
  countriesListEl.innerHTML = '';
  countryInfoEl.innerHTML = '';
}

inputEl.addEventListener('input', debounce(loadInfo, DEBOUNCE_DELAY));
