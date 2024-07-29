import { getAllFromDatabase } from './database-api.js';
import { addCoursesToDOM } from './dom-handlers.js';
import './header.js';
import './change-theme.js';
import { courseFilterButtons, courseSortButtons, coursesWrapperElement, searchCourseInput, categoryTitle, titleIcon, searchResultWrapper } from './dom-elements.js';
import { removeLoader, getQueryParameters, applyDiscountToPrice, categoryInPersian, sortArray } from './utils.js';

let categoryParam = getQueryParameters('category');
let searchParam = getQueryParameters('search');

let categoryCourses = [];
let filteredCourses = [];
let searchedCourses = [];

if (categoryParam && categoryInPersian(categoryParam)) {
  const categoryPersian = categoryInPersian(categoryParam);
  if (categoryPersian === 'دوره ها' || categoryPersian === 'دوره های محبوب') {
    categoryTitle.innerText = `${categoryPersian}`;
  } else {
    categoryTitle.innerText = `دوره های ${categoryPersian}`;
  }
  document.title = `ایزی‌لرن | ${categoryPersian}`;
} else if (searchParam) {
  categoryTitle.innerText = `جستجو: ${searchParam}`;
  document.title = `جستجو برای: ${searchParam}`;
  titleIcon.src = './images/icons/zoom.png';
  // some codes
} else {
  location.replace('404.html');
}

// overall Search handler
const overallSearchHandler = (allCourses) => {
  let regex = new RegExp(`${searchParam}`, 'gi');
  let result = allCourses.filter((course) => {
    return course.name.match(regex) || course.search_keywords.includes(searchParam);
  });
  result.length || searchResultWrapper.classList.remove('hidden');
  return Array.from(new Set(result));
};

// Add Course to DOM
getAllFromDatabase('courses')
  .then((allCourses) => {
    if (categoryParam === 'all-courses') {
      categoryCourses = sortArray(allCourses, 'create', true);
    } else if (categoryParam === 'popular-courses') {
      categoryCourses = sortArray(allCourses, 'students', true);
      removeSortButtonsClasses();
      ActiveSortBtn(courseSortButtons[2]);
    } else if (searchParam) {
      categoryCourses = overallSearchHandler(allCourses);
    } else {
      categoryCourses = allCourses.filter((course) => {
        return course.category.includes(categoryParam);
      });
    }
    filteredCourses = categoryCourses;
    addCoursesToDOM(categoryCourses, coursesWrapperElement);
  })
  .catch((error) => console.error('Error Getting Courses', error));

// Filter and Sort Courses and Add Them To DOM
const displayCourses = (filterType) => {
  let courses = searchedCourses.length > 0 ? searchedCourses : categoryCourses;

  if (filterType === 'all') {
    filteredCourses = courses;
  } else if (filterType === 'free') {
    filteredCourses = courses.filter((course) => course.discount === 100);
  } else if (filterType === 'cash') {
    filteredCourses = courses.filter((course) => course.discount != 100);
  } else if (filterType === 'cheapest') {
    filteredCourses = sortArray(filteredCourses, 'price');
  } else if (filterType === 'expensive') {
    filteredCourses = sortArray(filteredCourses, 'price', true);
  } else if (filterType === 'popular') {
    filteredCourses = sortArray(filteredCourses, 'students', true);
  }
  addCoursesToDOM(filteredCourses, coursesWrapperElement);
};

const removeSortButtonsClasses = () => {
  courseSortButtons.forEach((btn) => {
    btn.classList.remove('theme-bg-color-10');
    btn.classList.remove('theme-text-color');
  });
};

const removeFilterButtonsClasses = () => {
  courseFilterButtons.forEach((btn) => {
    btn.classList.remove('theme-bg-color-10');
    btn.classList.remove('theme-text-color');
    btn.children[0].classList.remove('theme-bg-color');
    btn.children[0].classList.add('bg-slate-200');
    btn.children[0].classList.add('dark:bg-slate-500');
  });
};

function ActiveSortBtn(btn) {
  btn.classList.add('theme-bg-color-10');
  btn.classList.add('theme-text-color');
}
function ActiveFilterBtn(btn) {
  btn.classList.add('theme-bg-color-10');
  btn.classList.add('theme-text-color');
  btn.children[0].classList.add('theme-bg-color');
  btn.children[0].classList.remove('bg-slate-200');
  btn.children[0].classList.remove('dark:bg-slate-500');
}
const filterCourses = (btn) => {
  const filterType = btn.dataset.filter;

  window.scrollY > 64 && window.scrollTo(0, 64);

  removeSortButtonsClasses();
  removeFilterButtonsClasses();

  ActiveFilterBtn(btn);
  displayCourses(filterType);
};

const sortCourses = (btn) => {
  const sortType = btn.dataset.sort;
  removeSortButtonsClasses();

  ActiveSortBtn(btn);

  displayCourses(sortType);
};

const searchCourse = () => {
  removeSortButtonsClasses();
  removeFilterButtonsClasses();
  ActiveFilterBtn(courseFilterButtons[0]);
  let searchCourseInputValue = searchCourseInput.value.trim();
  let regex = new RegExp(searchCourseInputValue, 'gi');
  searchedCourses = categoryCourses.filter((course) => {
    return course.name.match(regex);
  });
  if (searchCourseInputValue) {
    filteredCourses = searchedCourses;
  } else {
    filteredCourses = categoryCourses;
    searchedCourses = [];
  }
  searchedCourses = searchCourseInputValue ? searchedCourses : categoryCourses;
  addCoursesToDOM(searchedCourses, coursesWrapperElement);
};

courseFilterButtons.forEach((btn) => {
  btn.addEventListener('click', () => filterCourses(btn));
});
courseSortButtons.forEach((btn) => {
  btn.addEventListener('click', () => sortCourses(btn));
});

window.addEventListener('load', removeLoader);

searchCourseInput.addEventListener('input', searchCourse);
