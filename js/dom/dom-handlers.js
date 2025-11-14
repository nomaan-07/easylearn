import {
  confirmSweetAlert,
  sweetAlert,
} from '../initializers/sweet-alert-initialize.js';
import {
  submitCommentReply,
  submitSessionNewQuestion,
  submitQuestionAnswer,
  closeQuestion,
  submitTicketAnswer,
  closeTicket,
  changeUserRole,
  deleteUser,
  deleteUserCourse,
} from '../database/database-handlers.js';
import {
  closeMobileAccountMenu,
  toggleTextarea,
  openAnswerTextArea,
  cancelAnswerTextArea,
  toggleNewTicketOptionsWrapper,
  textareaAutoResize,
} from '../ui/ui-handlers.js';
import {
  sellAndExpenseStaticsChart,
  ProfitAndLossStaticsChart,
} from '../initializers/chart-js-initialize.js';
import {
  courseCardTemplate,
  blogCardTemplate,
  recentBlogTemplate,
  loginBtnTemplate,
  headerCartCourseTemplate,
  cartCourseTemplate,
  accountCourseTemplate,
  userAccountProfilePictureTemplate,
  adminPanelCommentTemplate,
  sessionQuestionTemplate,
  adminPanelViewedQuestionTemplate,
  panelQuestionTemplate,
  ticketTemplate,
  viewedTicketTemplate,
  adminPanelUserTemplate,
  adminPanelUserInfoTemplate,
  adminPanelUserStatsTemplate,
  adminPanelUserCoursesTemplate,
} from '../template/template.js';
import {
  applyDiscountToPrice,
  formatDate,
  emptyDomElemContent,
  getParentID,
  getReplyCommentWrapper,
  getReplyCommentTextarea,
  calculateRemainingTime,
  createCartCourseObject,
  getLocalCourses,
  categoryInPersian,
  sortArray,
  filterComments,
  removeLoader,
  CourseHeadlineSectionHandler,
  breadCrumbLinksHandler,
  filterPanelsQuestions,
  scrollToAboveOfElement,
  scrollToTop,
  commentSectionTemplateHandler,
  getQueryParameters,
} from '../utils/utils.js';

import {
  topBannerElement,
  headerCartCoursesNumberElements,
  headerCartCoursesWrappers,
  headerCartPayButtons,
  localStorageUserID,
  headerCartTotalPriceElements,
  cartNoCourseWrapper,
  cartDetailWrapper,
  cartCoursesWrapper,
  cartTotalPrice,
  cartCourseNumberElement,
  headerCartBadgeNumberElements,
  accountMenuItemElements,
  accountCoursesWrapper,
  accountUsernameElement,
  usernameInput,
  emailInput,
  accountSectionNameElement,
  userAccountProfilePictureWrapper,
  accountSectionWrappers,
  adminPanelCommentsWrapper,
  overallSellElement,
  overallExpenseElement,
  overallProfitElement,
  adminNotConfirmedCommentsNumberBadge,
  headlinesWrapper,
  sessionCourseNameElements,
  sessionNameElements,
  sessionNumberElements,
  sessionDownloadButtons,
  sessionVideoElement,
  breadcrumbCourseCategory,
  breadcrumbCourseName,
  newQuestionSubmitBtn,
  questionsWrapperElement,
  questionsSectionWrapper,
  adminPanelQuestionsWrapper,
  accountQuestionsWrapper,
  newTicketWrapper,
  ticketsWrapper,
  newTicketChosenDepartmentElement,
  newTicketDepartmentIconElement,
  newTicketDepartmentOptionsWrapper,
  subjectInputElement,
  ticketTextareaElement,
  viewedTicketWrapper,
  ticketBtn,
  allUsersWrapper,
  userWrapper,
  adminPanelUsersBackBtn,
  adminPanelUserInfoWrapper,
  adminPanelUserStatsWrapper,
  adminPanelUserCoursesWrapper,
} from '../dom/dom-elements.js';
import { getOneFromDatabase } from '../database/database-api.js';

// course.js - dom-handlers.js - blog.js
const insertToDOM = (domElem, content) => {
  const fragment = document.createDocumentFragment();
  const tempDiv = document.createElement('div');

  tempDiv.insertAdjacentHTML('beforeend', content);

  // Append the child nodes of the temporary div to the DocumentFragment
  while (tempDiv.firstChild) {
    fragment.appendChild(tempDiv.firstChild);
  }

  emptyDomElemContent(domElem);

  domElem.appendChild(fragment);
};

// header.js
const addLoginBtnToDOM = (loginButtons, userID) => {
  loginButtons.forEach((btn) => {
    insertToDOM(btn, loginBtnTemplate(userID));
  });
};

// index.html - course-category.html
const addCourseCardsToDOM = (courses, coursesWrapper, isSwiper) => {
  let courseWrapperClass = isSwiper
    ? 'swiper-slide course-card'
    : 'course-card';
  let newCourse = null;
  let finalPrice = null;
  let coursesTemplate = '';
  courses.forEach((course) => {
    finalPrice =
      course.discount !== 100
        ? applyDiscountToPrice(course.price, course.discount).toLocaleString(
            'fa-IR'
          )
        : 'رایگان!';
    newCourse = {
      id: course.id,
      name: course.name,
      caption: course.caption,
      src: course.image_src,
      teacher: course.teacher,
      students: course.students.toLocaleString('fa-IR'),
      rate: course.rate,
      discountPercent: course.discount,
      price: course.price.toLocaleString('fa-IR'),
      finalPrice: finalPrice,
      slug: course.slug,
      isPurchased:
        course.students_id && course.students_id.includes(localStorageUserID),
      courseWrapperClass,
    };
    coursesTemplate += courseCardTemplate(newCourse);
  });
  insertToDOM(coursesWrapper, coursesTemplate);
};

//index.html
const addBlogCardsToDOM = (blogs, blogsWrapper) => {
  let newBlog = null;
  let blogsTemplate = '';
  blogs.forEach((blog) => {
    newBlog = {
      title: blog.title,
      date: formatDate(blog.created_at),
      seen: blog.seen,
      comments: blog.comments,
      image_src: blog.image_src,
      writer: blog.writer,
      readingTime: blog.reading_time,
      slug: blog.slug,
      category: blog.category,
      categoryName: categoryInPersian(blog.category),
    };
    blogsTemplate += blogCardTemplate(newBlog);
  });
  insertToDOM(blogsWrapper, blogsTemplate);
};

// blog.js
const addRecentBlogsToDom = (blogs, blogsWrapper) => {
  let blogsTemplate = '';
  let newBlog = null;
  blogs.forEach((blog) => {
    newBlog = {
      title: blog.title,
      date: formatDate(blog.created_at),
      slug: blog.slug,
      writer: blog.writer,
    };
    blogsTemplate += recentBlogTemplate(newBlog);
  });
  insertToDOM(blogsWrapper, blogsTemplate);
};

const addCommentsOfPageToDom = (comments, commentsWrapper, pageID) => {
  let commentTemplate = '';

  let FilteredComments = comments.filter((comment) => {
    return comment.page_id === pageID && comment.confirmed;
  });

  if (FilteredComments.length) {
    FilteredComments = sortArray(FilteredComments, 'create', true);
    FilteredComments.forEach((comment) => {
      commentTemplate += commentSectionTemplateHandler(comment);
    });

    insertToDOM(commentsWrapper, commentTemplate);
    const textareaElement = document.querySelectorAll(
      '.reply-comment-textarea'
    );
    textareaElement.forEach((textarea) =>
      textarea.addEventListener('input', textareaAutoResize)
    );

    const commentElementID = getQueryParameters('comment');
    const commentElement = document.getElementById(commentElementID);
    commentElement && scrollToAboveOfElement(commentElement, 110);
  } else {
    insertToDOM(
      commentsWrapper,
      `<p class="p-4 font-VazirMedium sm:text-lg xl:text-xl">هنوز نظری برای این بخش ثبت نشده است.</p>`
    );
  }
};

// comments section - course.js - blog.js
const handleCommentReply = (event, pageType, pageName, pageSlug, user) => {
  let element = event.target;
  let commentID = getParentID(element, 'comment');
  let wrapper = getReplyCommentWrapper(commentID);
  let textarea = getReplyCommentTextarea(commentID);

  // open reply
  if (element.closest('.open-reply-btn')) {
    toggleTextarea(wrapper, textarea, user, true);
  }
  // Cancel Reply
  if (element.closest('.reply-comment-cancel-btn')) {
    toggleTextarea(wrapper, textarea);
  }
  // submit reply
  if (element.closest('.reply-comment-submit-btn')) {
    submitCommentReply(
      textarea,
      wrapper,
      commentID,
      pageType,

      pageName,
      pageSlug,
      user
    );
  }
};

// course.js
const courseDiscountRemainingTimeDisplayHandler = (timestamp) => {
  const dayElem = document.getElementById('discount-day');
  const hourElem = document.getElementById('discount-hour');
  const minuteElem = document.getElementById('discount-minute');
  const secondElem = document.getElementById('discount-second');

  setInterval(() => {
    let remainingTime = calculateRemainingTime(timestamp);
    let remainingDays = String(remainingTime.days).padStart(2, '0');
    let remainingHours = String(remainingTime.hours).padStart(2, '0');
    let remainingMinutes = String(remainingTime.minutes).padStart(2, '0');
    let remainingSeconds = String(remainingTime.seconds).padStart(2, '0');
    dayElem.textContent = remainingDays;
    hourElem.textContent = remainingHours;
    minuteElem.textContent = remainingMinutes;
    secondElem.textContent = remainingSeconds;
  }, 1000);
};

const cartCourseDiscountRemainingTimeDisplayHandler = (element) => {
  const timestamp = Number(element.dataset.timestamp);
  if (!timestamp) return;

  setInterval(() => {
    let remainingTime = calculateRemainingTime(timestamp);

    let remainingDays = String(remainingTime.days).padStart(2, '0');
    let remainingHours = String(remainingTime.hours).padStart(2, '0');
    let remainingMinutes = String(remainingTime.minutes).padStart(2, '0');
    let remainingSeconds = String(remainingTime.seconds).padStart(2, '0');
    element.textContent = `${remainingDays} : ${remainingHours} : ${remainingMinutes} : ${remainingSeconds}`;
    element.textContent = `${remainingSeconds} : ${remainingMinutes} : ${remainingHours} : ${remainingDays}`;
  }, 1000);
};

const addToLocalCourseIfNotExist = (localCourses, course) => {
  if (localCourses) {
    let courseInLocalCourse = localCourses.find(
      (localCourse) => localCourse.id === course.id
    );
    if (!courseInLocalCourse) {
      localCourses.push(course);
      sweetAlert(`دوره به سبد خرید اضافه شد.`, 'success');
    } else {
      sweetAlert('این دوره در سبد خرید موجود است.', 'failed');
    }

    localStorage.setItem('courses', JSON.stringify(localCourses));
  } else {
    sweetAlert(`دوره به سبد خرید اضافه شد.`, 'success');
    localStorage.setItem('courses', JSON.stringify([course]));
  }
};

// database-handlers.js
const addCourseToCartHandler = (event, courses) => {
  if (!event.target.closest('.course__add-to-cart-btn')) return;

  if (!localStorageUserID) {
    sweetAlert(
      'برای ثبت نام در دوره، ابتدا باید در سایت ثبت نام کنید.',
      'info'
    );
    localStorage.removeItem('courses');
    return;
  }

  const courseID = event.target.closest('.course__add-to-cart-btn').dataset
    .course_id;
  const dbCourse = courses.length
    ? courses.find((course) => course.id === courseID)
    : courses;

  const course = createCartCourseObject(dbCourse);
  const localCourses = getLocalCourses();

  addToLocalCourseIfNotExist(localCourses, course);

  updateHederCartDetail();
};

// header.js
const removeCourseFromCartHandler = (event) => {
  if (!event.target.closest('.cart__course-remove-btn')) return;
  const courseID = event.target.closest('.cart__course-remove-btn').dataset
    .course_id;

  const localCourses = getLocalCourses();
  const filterDeletedCourse = localCourses.filter(
    (localCourse) => localCourse.id !== courseID
  );
  localStorage.setItem('courses', JSON.stringify(filterDeletedCourse));
  sweetAlert('دوره‌ از سبد خرید حذف شد.', 'success');
  updateHederCartDetail();
  if (cartCoursesWrapper) updateCartPageDetail();
};

// header.js
const updateHederCartDetail = () => {
  if (!localStorageUserID) {
    return;
  }

  let coursesTemplate = '';
  let courseTotalPrice = 0;
  const localCourses = getLocalCourses();

  if (localCourses && localCourses.length) {
    headerCartBadgeNumberElements.forEach((elem) => {
      elem.textContent = localCourses.length;
      elem.classList.remove('hidden');
      elem.classList.add('flex');
    });
    headerCartCoursesNumberElements.forEach(
      (elem) => (elem.textContent = `${localCourses.length} دوره`)
    );

    localCourses.forEach((course) => {
      coursesTemplate += headerCartCourseTemplate(course);
      courseTotalPrice += course.finalPriceInt;
    });

    headerCartCoursesWrappers.forEach((courseWrappers) =>
      insertToDOM(courseWrappers, coursesTemplate)
    );

    headerCartTotalPriceElements.forEach((elem) => {
      elem.classList.add('flex');
      elem.classList.remove('hidden');
      elem.querySelector('span').innerText = courseTotalPrice
        ? courseTotalPrice.toLocaleString('fa-IR')
        : 'صـــفر';
    });

    headerCartPayButtons.forEach((btn) => {
      btn.href = './cart.html';
      btn.textContent = 'تکمیل سفارش';
    });
  } else {
    headerCartBadgeNumberElements.forEach((elem) => {
      elem.textContent = 0;
      elem.classList.add('hidden');
      elem.classList.remove('flex');
    });
    headerCartCoursesNumberElements.forEach(
      (elem) => (elem.innerText = `0 دوره`)
    );
    headerCartCoursesWrappers.forEach((elem) =>
      insertToDOM(
        elem,
        '<p class="font-VazirMedium overflow-hidden text-center">هنوز هیچ دوره‌ای انتخاب نشده است.</p>'
      )
    );

    headerCartTotalPriceElements.forEach((elem) => {
      elem.classList.remove('flex');
      elem.classList.add('hidden');
      elem.querySelector('span').innerText = 'صـــفر';
    });

    headerCartPayButtons.forEach((btn) => {
      btn.href = './course-category.html?category=all-courses';
      btn.textContent = 'همه‌ی دوره‌ها';
    });
  }
};

// cart.js
const updateCartPageDetail = () => {
  if (!localStorageUserID) {
    location.replace('./auth.html?operation=signup');
  }

  let coursesTemplate = '';
  let courseTotalPrice = 0;

  const localCourses = getLocalCourses();
  if (localCourses && localCourses.length) {
    cartCourseNumberElement.textContent = `${localCourses.length} دوره`;
    cartNoCourseWrapper.classList.add('hidden');
    cartDetailWrapper.classList.remove('hidden');
    localCourses.forEach((course) => {
      coursesTemplate += cartCourseTemplate(course);
      courseTotalPrice += course.finalPriceInt;
    });
    insertToDOM(cartCoursesWrapper, coursesTemplate);
    const timerElements = document.querySelectorAll('.cart__discount-timer');
    timerElements.forEach((element) =>
      cartCourseDiscountRemainingTimeDisplayHandler(element)
    );

    cartTotalPrice.textContent = courseTotalPrice
      ? courseTotalPrice.toLocaleString('fa-IR')
      : 'صـــفر';
  } else {
    cartCourseNumberElement.textContent = `0 دوره`;
    cartNoCourseWrapper.classList.remove('hidden');
    cartDetailWrapper.classList.add('hidden');
  }
};

// database-handlers.js
const addSessionToDOM = (course, sessionID) => {
  // Find session
  let session = null;
  let headlineID = null;
  let sessionNumber = null;

  course.headlines.find((headline) =>
    headline.sessions.find((headlineSession, index) => {
      if (headlineSession.id === sessionID) {
        sessionNumber = index + 1;
        session = headlineSession;
        headlineID = headline.id;
      }
    })
  );

  // Check if session is available to user
  if (!session || (session.isLocked && !course.isPurchased)) {
    location.replace('./404.html');
  }

  // Update Title
  document.title = `${session.name} | ${course.name} | ایزی‌لرن`;

  // Add breadcrumb to DOM
  breadCrumbLinksHandler(
    breadcrumbCourseCategory,
    breadcrumbCourseName,
    course.name,
    course.slug,
    course.category,
    course.categoryName,
    'course'
  );

  // Add session detail to DOM

  insertToDOM(
    sessionVideoElement,
    `<source src="${session.videoSrc}" type="video/mp4" />`
  );
  sessionVideoElement.poster = course.image_src;

  sessionCourseNameElements.forEach((elem) => {
    elem.href = `/course.html?course=${course.slug}`;
    insertToDOM(elem, course.name);
  });

  sessionNumberElements.forEach((elem) => (elem.textContent = sessionNumber));

  sessionNameElements.forEach((elem) => {
    insertToDOM(elem, session.name);
  });

  sessionDownloadButtons.forEach((button) => {
    button.href = session.videoSrc;
  });

  // Add headlines to DOM
  let headlinesTemplate = '';

  course.headlines.forEach((headline) => {
    headlinesTemplate += CourseHeadlineSectionHandler(
      headline,
      course.isPurchased,
      course.slug,
      headlineID,
      session.id
    );
  });

  insertToDOM(headlinesWrapper, headlinesTemplate);

  // Q&A Section
  if (!localStorageUserID) {
    insertToDOM(
      questionsSectionWrapper,
      `
      <div class="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 theme-text-color mt-5">
        <svg class="size-5 sm:size-6 shrink-0">
          <use href="#information-circle"></use>
        </svg>
        <p class="font-VazirMedium sm:text-xl">برای ایجاد پرسش باید در سایت ثبت نام کنید.</p>
      </div>`
    );
  } else {
    newQuestionSubmitBtn.addEventListener('click', () =>
      submitSessionNewQuestion(
        course.name,
        course.slug,
        sessionID,
        session.name
      )
    );
  }

  removeLoader();
};

const handleSessionAnswer = (pageID, questions) => {
  const openAnswerButtons = document.querySelectorAll('.answer__open-btn');
  const newAnswerCancelButtons = document.querySelectorAll(
    '.new-answer__cancel-btn'
  );
  const newAnswerSubmitButtons = document.querySelectorAll(
    '.new-answer__submit-btn'
  );

  openAnswerButtons.forEach((btn) => openAnswerTextArea(btn));
  newAnswerCancelButtons.forEach((btn) => cancelAnswerTextArea(btn));
  newAnswerSubmitButtons.forEach((btn) =>
    submitQuestionAnswer(btn, pageID, questions)
  );
};

const addSessionQuestionsToDOM = (pageID, questions, questionID) => {
  if (!pageID) {
    insertToDOM(
      questionsWrapperElement,
      `
      <div class="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 theme-text-color">
        <svg class="size-5 sm:size-6 shrink-0">
          <use href="#information-circle"></use>
        </svg>
        <p class="font-VazirMedium sm:text-xl">هنوز پرسشی برای این جلسه مطرح نکرده‌اید.</p>
      </div>
      `
    );
    return;
  }

  let allQuestionsTemplate = '';

  questions.forEach((question, index) => {
    allQuestionsTemplate += sessionQuestionTemplate(question, index + 1);
  });

  insertToDOM(questionsWrapperElement, allQuestionsTemplate);

  if (questionID) {
    scrollToAboveOfElement(document?.getElementById(questionID), 100);
  }

  handleSessionAnswer(pageID, questions);
};

// header.js
const changeTopBannerBackgroundColor = () => {
  const colors = [
    'bg-fuchsia-600',
    'bg-rose-600',
    'bg-violet-600',
    'bg-emerald-600',
    'bg-lime-600',
    'bg-amber-600',
    'bg-sky-600',
  ];
  const randomIndex = Math.floor(Math.random() * colors.length);
  topBannerElement.classList.add(colors[randomIndex]);
};

// account.js
const addAccountCourseToDOM = (courses) => {
  let coursesTemplate = '';

  if (courses.length) {
    courses.forEach(
      (course) => (coursesTemplate += accountCourseTemplate(course))
    );
  } else {
    coursesTemplate = `
    <p class="text-center text-xl font-VazirMedium">شما در هیچ دوره‌ای شرکت نکرده‌اید.</p>
    <a href="./course-category.html?category=all-courses" class="btn theme-bg-color md:hover:theme-hover-bg-color">همه‌ی دوره‌ها</a>`;
  }
  insertToDOM(accountCoursesWrapper, coursesTemplate);
};

// database-handler.js
const displayChosenAccountSection = async (element) => {
  if (element.dataset.section === 'logout') {
    const isConfirmed = await confirmSweetAlert(
      'آیا مطمئن هستید؟',
      'خروج از حساب کاربری'
    );
    if (!isConfirmed) return;
    localStorage.removeItem('userID');
    location.replace('./index.html');
    return;
  }

  accountMenuItemElements.forEach((element) =>
    element.classList.remove('account__menu-item--active')
  );
  element.classList.add('account__menu-item--active');
  closeMobileAccountMenu();
  accountSectionNameElement.textContent = element.children[1].textContent;

  scrollToTop();

  accountSectionWrappers.forEach((wrapper) => {
    if (wrapper.dataset.section === element.dataset.section) {
      wrapper.classList.remove('hidden');
    } else {
      wrapper.classList.add('hidden');
    }
  });
};

// database-handler.js
const addUserAccountDetailToDOM = (user) => {
  insertToDOM(
    accountUsernameElement,
    `<span class="theme-text-color">${user.username}</span> عزیز خوش آمدی :)`
  );

  usernameInput.placeholder = user.username;
  emailInput.placeholder = user.email;

  user.image_src &&
    insertToDOM(
      userAccountProfilePictureWrapper,
      userAccountProfilePictureTemplate(user.image_src)
    );
};

const addUserAccountQuestionToDOM = (data) => {
  const questions = filterPanelsQuestions(data);

  if (!questions.length) {
    insertToDOM(
      accountQuestionsWrapper,
      `<p class="text-center xl:text-right text-xl font-VazirMedium">شما هنوز هیچ پرسشی مطرح نکرده‌اید.</p>`
    );
    return;
  }

  let questionsTemplate = '';
  questions.forEach(
    (question) => (questionsTemplate += panelQuestionTemplate(question))
  );

  insertToDOM(accountQuestionsWrapper, questionsTemplate);
};

const resetNewTicketElementsValues = () => {
  newTicketChosenDepartmentElement.dataset.department = 'none';
  newTicketChosenDepartmentElement.textContent = 'دپارتمان را انتخاب کنید';
  newTicketDepartmentIconElement.classList.remove('rotate-180');
  newTicketDepartmentOptionsWrapper.classList.add('hidden');
  subjectInputElement.value = '';
  ticketTextareaElement.value = '';
  ticketTextareaElement.style.height = `160px`;
};

const toggleNewTicketWrapper = (btn, isViewedTicket) => {
  const operation = btn.dataset.operation;

  if (isViewedTicket) {
    btn.dataset.operation = 'close';
    insertToDOM(
      btn,
      `
      <span class="hidden xs:block">بازگشت</span>
      <svg class="size-6">
        <use href="#arrow-left"></use>
      </svg>`
    );
    return;
  }

  if (operation === 'open') {
    btn.dataset.operation = 'close';
    newTicketWrapper.classList.remove('hidden');
    ticketsWrapper.classList.add('hidden');
    insertToDOM(
      btn,
      `
      <span class="hidden xs:block">بازگشت</span>
      <svg class="size-6">
        <use href="#arrow-left"></use>
      </svg>`
    );
  } else {
    btn.dataset.operation = 'open';
    newTicketWrapper.classList.add('hidden');
    viewedTicketWrapper.classList.add('hidden');
    ticketsWrapper.classList.remove('hidden');
    resetNewTicketElementsValues();
    insertToDOM(
      btn,
      `
      <span class="hidden xs:block">تیکت جدید</span>
      <svg class="size-6">
      <use href="#plus"></use>
      </svg>`
    );
  }
};

const departmentSelectionHandler = (event) => {
  const departmentValue = event.target.dataset.department;
  const departmentName = event.target.textContent;

  newTicketChosenDepartmentElement.dataset.department = departmentValue;
  newTicketChosenDepartmentElement.textContent = departmentName;

  toggleNewTicketOptionsWrapper();
};

const addViewedTicketToDOM = (ticketID, tickets, isUserPanel) => {
  const ticket = tickets.find((ticket) => ticket.id === ticketID);

  ticketsWrapper.classList.add('hidden');
  viewedTicketWrapper.classList.remove('hidden');

  if (isUserPanel) {
    toggleNewTicketWrapper(ticketBtn, true);
  } else {
    ticketBtn.parentElement.classList.remove('hidden');
    ticketBtn.parentElement.classList.add('flex');
  }

  insertToDOM(viewedTicketWrapper, viewedTicketTemplate(ticket, isUserPanel));

  const answerOpenBtn = document.querySelector('.answer__open-btn');
  const answerCancelBtn = document.querySelector('.new-answer__cancel-btn');
  const answerSubmitBtn = document.querySelector('.new-answer__submit-btn');
  const closeQuestionBtn = document.querySelector('.close-question-btn');

  answerOpenBtn && openAnswerTextArea(answerOpenBtn);
  answerCancelBtn && cancelAnswerTextArea(answerCancelBtn);
  answerSubmitBtn &&
    submitTicketAnswer(answerSubmitBtn, ticket, tickets, isUserPanel);

  closeQuestionBtn && closeTicket(closeQuestionBtn, ticket, tickets);
};

const addTicketsToDOM = (tickets, isUserPanel) => {
  if (!tickets.length && isUserPanel) {
    insertToDOM(
      ticketsWrapper,
      `<p class="text-center xl:text-right text-xl font-VazirMedium">شما هنوز هیچ تیکتی ثبت نکرده‌اید.</p>`
    );
    return;
  }

  let ticketsTemplate = '';

  const filteredTickets = filterPanelsQuestions(tickets, true);

  filteredTickets.forEach((ticket) => {
    ticketsTemplate += ticketTemplate(ticket);
  });

  insertToDOM(ticketsWrapper, ticketsTemplate);

  const ticketElements = document.querySelectorAll('.ticket-wrapper');
  ticketElements.forEach((element) =>
    element.addEventListener('click', () =>
      addViewedTicketToDOM(element.id, tickets, isUserPanel)
    )
  );
};

const returnFromViewedTicket = () => {
  scrollToTop();
  ticketBtn.parentElement.classList.add('hidden');
  ticketBtn.parentElement.classList.remove('flex');
  ticketsWrapper.classList.remove('hidden');
  viewedTicketWrapper.classList.add('hidden');
};

const addAdminNotConfirmedCommentsToDOM = (comments) => {
  const notConfirmedComments = filterComments(comments, 'review');
  const notConfirmedCommentsLength = notConfirmedComments.length;
  adminNotConfirmedCommentsNumberBadge.textContent = notConfirmedCommentsLength;
};

//database-handlers.js
const addAdminPanelCommentsToDOM = (comments, filterType) => {
  let commentsTemplate = '';

  const allCommentsWithReplies = comments.flatMap((comment) => [
    comment,
    ...(comment.replies || []),
  ]);

  const filteredComments = filterComments(allCommentsWithReplies, filterType);

  addAdminNotConfirmedCommentsToDOM(allCommentsWithReplies);

  const sortedComments = sortArray(filteredComments, 'create', true);
  sortedComments.forEach((comment) => {
    commentsTemplate += adminPanelCommentTemplate(comment);
  });
  insertToDOM(adminPanelCommentsWrapper, commentsTemplate);
};

const addAdminPanelQuestionToDOM = (data) => {
  const adminName = localStorage.getItem('admin-name');

  const questions = filterPanelsQuestions(data);

  let questionsTemplate = '';

  questions.forEach((question) => {
    questionsTemplate += panelQuestionTemplate(question, true);
  });

  insertToDOM(adminPanelQuestionsWrapper, questionsTemplate);
  scrollToTop();

  const questionWrapper = document.querySelectorAll('.question__wrapper');
  questionWrapper.forEach((element) =>
    element.addEventListener('click', () =>
      handleAdminPanelQuestionView(element, data, adminName)
    )
  );
};

const handleAdminPanelQuestionView = (element, data, adminName) => {
  const pageID = element.dataset.page_id;
  const questionID = element.dataset.question_id;
  const page = data.find((page) => page.id === pageID);
  const question = page.questions.find(
    (question) => question.id === questionID
  );

  addAdminPanelViewedQuestionToDOM(data, page, question, adminName);
};

const addAdminPanelViewedQuestionToDOM = (data, page, question, adminName) => {
  insertToDOM(
    adminPanelQuestionsWrapper,
    adminPanelViewedQuestionTemplate(page, question)
  );
  scrollToTop();

  document
    .querySelector('.back-btn')
    .addEventListener('click', () => addAdminPanelQuestionToDOM(data));

  const answerOpenBtn = document.querySelector('.answer__open-btn');
  const answerCancelBtn = document.querySelector('.new-answer__cancel-btn');
  const answerSubmitBtn = document.querySelector('.new-answer__submit-btn');
  const closeQuestionBtn = document.querySelector('.close-question-btn');

  answerOpenBtn && openAnswerTextArea(answerOpenBtn);
  answerCancelBtn && cancelAnswerTextArea(answerCancelBtn);
  answerSubmitBtn &&
    submitQuestionAnswer(
      answerSubmitBtn,
      page.id,
      page.questions,
      adminName,
      data,
      page
    );

  closeQuestionBtn &&
    closeQuestion(
      closeQuestionBtn,
      page.id,
      page.questions,
      adminName,
      data,
      page
    );
};

const returnFromViewedUser = (back) => {
  scrollToTop();
  if (back) {
    allUsersWrapper.classList.remove('hidden');
    userWrapper.classList.add('hidden');
    adminPanelUsersBackBtn.parentElement.classList.add('hidden');
    adminPanelUsersBackBtn.parentElement.classList.remove('flex');
  } else {
    allUsersWrapper.classList.add('hidden');
    userWrapper.classList.remove('hidden');
    adminPanelUsersBackBtn.parentElement.classList.remove('hidden');
    adminPanelUsersBackBtn.parentElement.classList.add('flex');
  }
};

const addAdminViewedUserInfoToDOM = (user, userNumber, users) => {
  insertToDOM(
    adminPanelUserInfoWrapper,
    adminPanelUserInfoTemplate(user, userNumber)
  );

  const changeUserRoleBtn = document.querySelector('.user__change-role-btn');

  changeUserRoleBtn.addEventListener('click', () =>
    changeUserRole(user, users)
  );
};

const addAdminViewedUserStatsToDOM = (user, users) => {
  insertToDOM(adminPanelUserStatsWrapper, adminPanelUserStatsTemplate(user));
  const deleteUserBtn = document.querySelector('.user__delete-btn');
  deleteUserBtn.addEventListener('click', () => deleteUser(user, users));
};

const addAdminViewedUserCoursesToDOM = (user, users) => {
  insertToDOM(
    adminPanelUserCoursesWrapper,
    adminPanelUserCoursesTemplate(user)
  );
  const deleteUserCourseButtons = document.querySelectorAll(
    '.user__course-delete-btn'
  );

  deleteUserCourseButtons.forEach((btn) => {
    btn.addEventListener('click', () => deleteUserCourse(btn, user, users));
  });
};

const addViewedUserToDOM = (btn, users) => {
  const user = users.find((user) => user.id === btn.dataset.user_id);
  if (user.role === 'manager' && user.id !== localStorageUserID) {
    sweetAlert('شما دسترسی لازم را ندارید.', 'failed');
    return;
  }

  const userNumber = btn.dataset.user_number;

  addAdminViewedUserInfoToDOM(user, userNumber, users);
  addAdminViewedUserStatsToDOM(user, users);
  addAdminViewedUserCoursesToDOM(user, users);

  returnFromViewedUser(false);
};

const addAllUsersToDOM = (allUsers) => {
  let usersTemplate = '';

  const managers = allUsers.filter((user) => user.role === 'manager');
  const admins = allUsers.filter((user) => user.role === 'admin');
  const users = allUsers.filter((user) => user.role === 'user');
  admins.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  users.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  managers.forEach(
    (user, index) => (usersTemplate += adminPanelUserTemplate(user, index + 1))
  );
  admins.forEach(
    (user, index) => (usersTemplate += adminPanelUserTemplate(user, index + 1))
  );
  users.forEach(
    (user, index) =>
      (usersTemplate += adminPanelUserTemplate(user, users.length - index))
  );

  insertToDOM(allUsersWrapper, usersTemplate);

  const userViewButtons = document.querySelectorAll('.user__view-btn');
  userViewButtons.forEach((btn) =>
    btn.addEventListener('click', () => addViewedUserToDOM(btn, allUsers))
  );
};

// database-handlers.js
const addSellAndExpenseDataToDOM = (data) => {
  const lastSixMonthData = sortArray(data, 'id').splice(-6);
  let overallSell = 0;
  let overallExpense = 0;
  let overallProfit = 0;

  let months = [];
  let sells = [];
  let expenses = [];
  let profits = [];
  let losses = [];

  // overall data
  data.forEach((data) => {
    overallSell += data.sell;
    overallExpense += data.expense;
    overallProfit += data.sell - data.expense;
  });

  overallSellElement.textContent = overallSell.toLocaleString('fa-IR');
  overallExpenseElement.textContent = overallExpense.toLocaleString('fa-IR');
  overallProfitElement.textContent = overallProfit.toLocaleString('fa-IR');
  if (overallProfit <= 0) {
    overallProfitElement.parentElement.classList.add('bg-rose-500');
    overallProfitElement.parentElement.classList.remove('bg-emerald-500');
    overallProfitElement.previousElementSibling.textContent = 'زیان';
    overallProfitElement.nextElementSibling.classList.add('rotate-180');
  }

  // last six month data
  lastSixMonthData.forEach((data) => {
    months.push(`${data.month} ${data.year}`);
    sells.push(data.sell);
    expenses.push(data.expense);
    if (data.sell - data.expense > 0) {
      profits.push(data.sell - data.expense);
      losses.push(0);
    } else {
      profits.push(0);
      losses.push(data.sell - data.expense);
    }
  });

  sellAndExpenseStaticsChart(months, sells, expenses);
  ProfitAndLossStaticsChart(months, profits, losses);
};

export {
  insertToDOM,
  addLoginBtnToDOM,
  addCourseCardsToDOM,
  addBlogCardsToDOM,
  toggleTextarea,
  addRecentBlogsToDom,
  addCommentsOfPageToDom,
  handleCommentReply,
  courseDiscountRemainingTimeDisplayHandler,
  addCourseToCartHandler,
  updateHederCartDetail,
  removeCourseFromCartHandler,
  updateCartPageDetail,
  addSessionToDOM,
  addSessionQuestionsToDOM,
  changeTopBannerBackgroundColor,
  displayChosenAccountSection,
  addAccountCourseToDOM,
  addUserAccountDetailToDOM,
  addUserAccountQuestionToDOM,
  toggleNewTicketWrapper,
  departmentSelectionHandler,
  addTicketsToDOM,
  addViewedTicketToDOM,
  returnFromViewedTicket,
  addAdminPanelCommentsToDOM,
  addAdminPanelQuestionToDOM,
  returnFromViewedUser,
  addAdminPanelViewedQuestionToDOM,
  addAdminViewedUserStatsToDOM,
  addAdminViewedUserCoursesToDOM,
  addAllUsersToDOM,
  addSellAndExpenseDataToDOM,
};
