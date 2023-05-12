import './css/styles.css';
import debounce from 'lodash.debounce';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { fetchCountries } from './js/fetchCountries';

const DEBOUNCE_DELAY = 300; // Затримка перед запитом

const inputEl = document.querySelector('#search-box');
const countriesListEl = document.querySelector('.country-list');
const countryInfoEl = document.querySelector('.country-info');

/**
 * Функція створює розмітку списку знайдених країн
 * @param {*} countries Масив з даними про знайдені країни
 */
function renderCountriesList(countries) {
  reset();
    
  // Розмітка списку
  const marcup = countries.map(
    ({ name: { official }, flags: { svg } }) =>
      `<li class = "country-list__item">
          <img src="${svg}" alt="${official} flag" width="30" height="20"/>${official}
       </li>`
  );

  countriesListEl.insertAdjacentHTML('beforeend', marcup.join('')); 
}


/**
 * Створює розмітку для інформації про вказану країну
 * @param {*} country об'єкт з даними про країну
 */
function renderCountryInfo(country) {
  reset();

  // Деструктуризація властивостей з об'єкта країни
  const {
    name: { official },
    capital,
    population,
    languages,
    flags: { svg },
  } = country;

  // Розмітка для інформації
  const marcup = `<div class = "country-info__country-box">
                    <img src = "${svg}" alt = "${official} flag" width="200" height="100"/>
                    <h1>${official}</h1>
                  </div>
                  <p class = "country-info__property"><b>Capital:</b> ${
                    capital[0]
                  }</p>
                  <p class = "country-info__property"><b>Population:</b> ${population}</p>
                  <p class = "country-info__property"><b>Languages:</b> ${Object.values(
                    languages
                  ).join(', ')}</p>`;

  countryInfoEl.insertAdjacentHTML('beforeend', marcup);
}


/**
 * Очищає розмітку з інформацією про країни
 */
function reset() {
  countriesListEl.innerHTML = '';
  countryInfoEl.innerHTML = '';
}


/**
 * Функція обробляє результат промісу
 * @param {array || string} entity Масив з об'єктами країн або текст помилки
 * @param {object with Boolean} isError тип entity?
 * @returns {undefined || void} 
 */
const promiseProcessing = (entity, {isError}) => {
  // Перевірка чи була помилка при запиті на сервер (з якого блоку була викликана функція)
  if (isError) {
    if(entity === '404') { // Перевірка чи код помилки 404
        Notify.failure('Oops, there is no country with that name', { timeout: 3000 }); // Повідомлення, що вказаної країни немає в базі
        reset();
    } else {
        Notify.failure(`Error: ${entity}`, { timeout: 6000 }); // Виводить текст помилки
        reset();
    }

    return;
  }

  // Перевірка кількісті знайдених країн і виконання відповідних дій
  if (entity.length > 10) {
    Notify.info('Too many matches found. Please enter a more specific name.', {timeout: 3000}); // Країн більше 10
    return;
  } else if (entity.length > 1) { // Кількість країн в масиві від 2 до 10
    renderCountriesList(entity); // Рендеринг списку країн
    return;
  }

  renderCountryInfo(entity[0]); // Рендеринг інформації про вказану країну
};


/**
 * Обробляє подію введення даних
 * @param {object} event 'input'
 * @returns {undefined || void}
 */
const onInput = event => {
  const nameCountry = event.target.value.trim();

  // Якщо поле введення пусте або складається тільки з пробілів
  if (!nameCountry) {
    reset();
    return;
  }

  // Запит на сервер для отримання даних про країну
  fetchCountries(nameCountry)
    .then(countries => promiseProcessing(countries, { isError: false })) // Обробка успішного запиту (false - під час запиту на сервер помилок не було)
    .catch(error => promiseProcessing(error.message, { isError: true })); // Обробка невдалого запиту (true - під час запиту на сервер сталася помилка)
};


inputEl.addEventListener('input', debounce(onInput, DEBOUNCE_DELAY));



const imageUrl = new URL('./images/logo.png', import.meta.url);

console.log(imageUrl.toString());

// // згенерований код Parcel
// var imageUrl2 = new URL(
//   require('logo.png'),
//   __ESM_IMPORT_META_URL__
// );

// console.log(imageUrl2.toString());