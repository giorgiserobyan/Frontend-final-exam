const api_key = '7050701aed9a18e3ca26f659c712d23e';
const open_weather_url = 'https://api.openweathermap.org/data/2.5/';

let current_lang = 'en';
let forecast_list = [];
let day_start_indices = [];
let current_index = 0;
let last_searched_city = 'Tbilisi';

const burger = document.getElementById('burger');
const mobile_menu = document.getElementById('mobile_menu');
const lang_btn = document.getElementById('lang_btn');
const mobile_lang_btn = document.getElementById('mobile_btn');
const search_input = document.getElementById('search_placeholder');
const day_buttons = document.querySelectorAll('.days__button');

// თარგმანი
const translations = {
  en: {
    main: 'Main',
    mobile_main: 'Main',
    about: 'About Us',
    mobile_about: 'About Us',
    search_placeholder: 'search for a city...',
    'last-headline': 'About us:',
    'main-desc':
      'WeatherNow is an open source global weather forecast, feel free and enjoy using it!',
    author: '© 2025 WeatherNow. Designed by Giorgi Serobyan',
    'powered-by': 'Powered by OpenWeather API',
  },
  ka: {
    main: 'მთავარი',
    mobile_main: 'მთავარი',
    about: 'ჩვენს შესახებ',
    mobile_about: 'ჩვენს შესახებ',
    search_placeholder: 'შეიყვანეთ ქალაქი...',
    'last-headline': 'ჩვენს შესახებ:',
    'main-desc': 'WeatherNow არის გლობალური ამინდის პროგნოზის ღია წყარო.',
    author: '© 2025 WeatherNow. შექმნილია გიორგი სერობიანის მიერ',
    'powered-by': 'მუშაობს OpenWeather API-ზე',
  },
};

// ამინდის წამოღება
async function get_weather(city) {
  try {
    const response = await fetch(
      `${open_weather_url}forecast?q=${city}&appid=${api_key}&units=metric&lang=${current_lang}`
    );
    const data = await response.json();

    if (data.cod === '200') {
      last_searched_city = data.city.name;
      forecast_list = data.list;

      //ყოველი ახალი დღის პირველი ინდექსი
      day_start_indices = [];
      let last_date = '';
      forecast_list.forEach((item, index) => {
        const date = item.dt_txt.split(' ')[0];
        if (date !== last_date && day_start_indices.length < 5) {
          day_start_indices.push(index);
          last_date = date;
        }
      });

      current_index = 0;
      display_forecast(current_index);
      update_day_buttons();
    } else {
      alert(current_lang === 'ka' ? 'ქალაქი ვერ მოიძებნა' : 'City not found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// მონაცემების გამოტანა
function display_forecast(index) {
  const item = forecast_list[index];
  if (!item) return;

  document.getElementById('city-name').innerText = last_searched_city;
  document.getElementById('temperature').innerText = `${Math.round(
    item.main.temp
  )}°C`;
  document.getElementById('description').innerText =
    item.weather[0].description;
  document.getElementById('humidity').innerText = `${item.main.humidity}%`;
  document.getElementById('wind').innerText = `${item.wind.speed} km/h`;

  // თარიღის და დროის ფორმატირება
  const date_obj = new Date(item.dt * 1000);
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  const time_options = { hour: '2-digit', minute: '2-digit', hour12: false };

  document.getElementById('current-date').innerText =
    date_obj.toLocaleDateString(
      current_lang === 'ka' ? 'ka-GE' : 'en-US',
      options
    );
  document.getElementById('current-hour').innerText =
    date_obj.toLocaleTimeString('en-GB', time_options);

  // ძირითადი აიქონი
  const iconCode = item.weather[0].icon;
  document.querySelector(
    '.weather__animate-icon'
  ).src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  // აქტიური ღილაკის მონიშვნა
  update_active_button(date_obj.toDateString());
}

// ქვედა ღილაკების განახლება
function update_day_buttons() {
  day_buttons.forEach((btn, i) => {
    const index = day_start_indices[i];
    if (index !== undefined) {
      const dateObj = new Date(forecast_list[index].dt * 1000);
      const options = { weekday: 'long', month: 'short', day: 'numeric' };

      btn.innerText = dateObj.toLocaleDateString(
        current_lang === 'ka' ? 'ka-GE' : 'en-US',
        options
      );

      btn.onclick = () => {
        current_index = index;
        display_forecast(current_index);
      };
    }
  });
}

// აქტიური კლასის მართვა
function update_active_button(current_date_str) {
  day_buttons.forEach((btn, i) => {
    if (day_start_indices[i] !== undefined) {
      const btn_date = new Date(
        forecast_list[day_start_indices[i]].dt * 1000
      ).toDateString();
      btn.classList.toggle('active', current_date_str === btn_date);
    }
  });
}

// ენის შეცვლა
function update_language(lang) {
  current_lang = lang;
  const texts = translations[lang];

  // სტატიკური ტექსტების თარგმნა
  Object.keys(texts).forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      if (element.tagName === 'INPUT') element.placeholder = texts[id];
      else element.innerText = texts[id];
    }
  });

  // ღილაკის შეცვლა (ka/en)
  const btn_text = lang === 'en' ? 'ka' : 'en';
  lang_btn.innerText = btn_text;
  if (mobile_lang_btn) mobile_lang_btn.innerText = btn_text;

  // თუ მონაცემები უკვე გვაქვს, მაშინვე გადავთარგმნოთ ეკრანზე
  if (forecast_list.length > 0) {
    display_forecast(current_index);
    update_day_buttons();
  }

  // API-დან ახალი ინფორმაციის წამოღება აღწერილობის სათარგმნად
  get_weather(last_searched_city);
}

lang_btn.addEventListener('click', () => {
  update_language(current_lang === 'en' ? 'ka' : 'en');
});

if (mobile_lang_btn) {
  mobile_lang_btn.addEventListener('click', () => {
    update_language(current_lang === 'en' ? 'ka' : 'en');
  });
}

burger.addEventListener('click', () => {
  mobile_menu.classList.toggle('active');
});

document.getElementById('next').addEventListener('click', () => {
  if (current_index < forecast_list.length - 1) {
    current_index += 1;
    display_forecast(current_index);
  }
});

document.getElementById('prev').addEventListener('click', () => {
  if (current_index > 0) {
    current_index -= 1;
    display_forecast(current_index);
  }
});

search_input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    get_weather(search_input.value);
    search_input.value = '';
  }
});

// საწყისი ჩატვირთვა
window.onload = () => get_weather('Tbilisi');
