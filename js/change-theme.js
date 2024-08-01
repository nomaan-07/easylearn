import { localStorageTheme, colorPlateBtn, colorPlate, changeThemeButtons, darkThemeBtn, favIcon, heroLightSVG, heroDarkSVG } from './dom-elements.js';

const getThemeFromLocalStorage = () => {
  localStorageTheme && changeTheme(localStorageTheme);
};
getThemeFromLocalStorage();

const toggleColorPlate = () => {
  colorPlate.classList.toggle('hidden');
  colorPlate.classList.toggle('flex');
  colorPlateBtn.classList.toggle('rotate-45');
};

function changeTheme(theme) {
  document.documentElement.className = `scroll-smooth ${theme}`;

  localStorage.setItem('theme', theme);

  favIcon.href = `images/favIcons/${theme}-favicon-64x64.png`;

  if (theme === 'dark') {
    darkThemeBtn.dataset.theme = 'light';
    darkThemeBtn.classList.remove('bg-slate-900');
    darkThemeBtn.classList.add('bg-white');
    if (heroLightSVG && heroDarkSVG) {
      heroLightSVG.classList.add('hidden');
      heroDarkSVG.classList.remove('hidden');
    }
  } else {
    darkThemeBtn.classList.add('bg-slate-900');
    darkThemeBtn.classList.remove('bg-white');
    darkThemeBtn.dataset.theme = 'dark';
    if (heroLightSVG && heroDarkSVG) {
      heroLightSVG.classList.remove('hidden');
      heroDarkSVG.classList.add('hidden');
    }
  }
}

changeThemeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const theme = btn.dataset.theme;
    changeTheme(theme);
    toggleColorPlate();
  });
});

colorPlateBtn.addEventListener('click', toggleColorPlate);

export { getThemeFromLocalStorage };
