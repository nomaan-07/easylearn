import {
  currentPasswordInputElem,
  emailInput,
  lastBlogsWrapperElement,
  latestCoursesWrapperElement,
  localStorageUserID,
  localStorageUsername,
  newPasswordInputElem,
  newQuestionTextareaElement,
  newTicketChosenDepartmentElement,
  newTicketSubmitBtn,
  passwordInput,
  popularCoursesWrapperElement,
  recentBlogsWrapper,
  subjectInputElement,
  ticketBtn,
  ticketTextareaElement,
  usernameInput,
} from "../dom/dom-elements.js";
import {
  addAccountCourseToDOM,
  addAdminPanelQuestionToDOM,
  addAdminPanelViewedQuestionToDOM,
  addAdminViewedUserCoursesToDOM,
  addAdminViewedUserStatsToDOM,
  addAllUsersToDOM,
  addBlogCardsToDOM,
  addCommentsOfPageToDom,
  addCourseCardsToDOM,
  addCourseToCartHandler,
  addRecentBlogsToDom,
  addSellAndExpenseDataToDOM,
  addSessionQuestionsToDOM,
  addSessionToDOM,
  addTicketsToDOM,
  addUserAccountDetailToDOM,
  addUserAccountQuestionToDOM,
  addViewedTicketToDOM,
  returnFromViewedUser,
  toggleNewTicketWrapper,
  updateCartPageDetail,
  updateHederCartDetail,
} from "../dom/dom-handlers.js";
import {
  confirmSweetAlert,
  sweetAlert,
} from "../initializers/sweet-alert-initialize.js";
import { toggleTextarea } from "../ui/ui-handlers.js";
import {
  applyDiscountToPrice,
  convertPersianNumbersToEnglish,
  createCourseObject,
  generateRandomID,
  getLocalCourses,
  getQueryParameters,
  persianMonths,
  removeLoader,
  sortArray,
} from "../utils/utils.js";
import {
  accountChangeDetailFormValidation,
  accountChangePasswordFormValidation,
  loginFormValidation,
  newTicketValidation,
  signupFormValidation,
} from "../validation/validation.js";
import {
  addToDatabase,
  deleteFromDatabase,
  getAllFromDatabase,
  getOneFromDatabase,
  getSomeFromDatabase,
  updateInDatabase,
} from "./database-api.js";

// index.js
const fetchAndDisplayMainPageCourses = async () => {
  try {
    const allCourses = await getAllFromDatabase("courses");
    const lastTenCourse = sortArray(allCourses, "create", true).slice(0, 10);
    const twelveMostPopularCourse = sortArray(
      allCourses,
      "students",
      true
    ).slice(0, 12);
    addCourseCardsToDOM(lastTenCourse, latestCoursesWrapperElement);
    addCourseCardsToDOM(
      twelveMostPopularCourse,
      popularCoursesWrapperElement,
      true
    );
    latestCoursesWrapperElement.addEventListener("click", (event) =>
      addCourseToCartHandler(event, lastTenCourse)
    );
    popularCoursesWrapperElement.addEventListener("click", (event) =>
      addCourseToCartHandler(event, twelveMostPopularCourse)
    );
  } catch (error) {
    console.error("Failed to Fetch courses", error);
  }
};
// index.js
const fetchAndDisplayMainPageBlogs = async () => {
  try {
    const allBlogs = await getAllFromDatabase("blogs");
    const lastFiveBlog = sortArray(allBlogs, "create", true).slice(0, 5);
    addBlogCardsToDOM(lastFiveBlog, lastBlogsWrapperElement);
  } catch (error) {
    console.error("Failed to fetch blogs", error);
  }
};

// course.js - blog.js
const fetchAndDisplayComments = async (commentsWrapper, pageID) => {
  try {
    const comments = await getAllFromDatabase("comments");
    addCommentsOfPageToDom(comments, commentsWrapper, pageID);
  } catch (error) {
    console.error("Failed to fetch comments", error);
  }
};

// comments section - course.js - blog.js
const submitNewComment = async (
  newCommentWrapper,
  newCommentTextarea,
  pageType,
  pageID,
  pageName,
  pageSlug,
  user
) => {
  try {
    const message = newCommentTextarea.value.trim();
    let newComment = {
      id: generateRandomID(),
      message,
      page_id: pageID,
      page_name: pageName,
      writer: user.username,
      image_src: user.image_src,
      page_slug: pageSlug,
      page_type: pageType,
    };

    if (message) {
      const user = await getOneFromDatabase("users", "id", localStorageUserID);

      await addToDatabase("comments", newComment);
      await updateInDatabase(
        "users",
        { comments_count: user.comments_count + 1 },
        localStorageUserID
      );

      sweetAlert("نظر شما ثبت شد و پس از بازبینی منتشر می‌شود.", "success");
      toggleTextarea(newCommentWrapper, newCommentTextarea);
    } else {
      sweetAlert();
      sweetAlert("نظر نمی‌تواند خالی باشد.", "info");
    }
  } catch (error) {
    console.error("Failed to submit new comment", error);

    sweetAlert("کامنت ثبت نشد، لطفا بعدا تلاش کنید.", "failed");
  }
};

// comments section - course.js - blog.js
const submitCommentReply = async (
  textarea,
  wrapper,
  commentID,
  pageType,
  pageName,
  pageSlug,
  user
) => {
  try {
    const message = textarea.value.trim();
    let dbReplies = null;
    let newReply = null;

    const comment = await getOneFromDatabase("comments", "id", commentID);

    newReply = {
      id: generateRandomID(),
      created_at: new Date(),
      message,
      confirmed: false,
      writer: user.username,
      image_src: user.image_src,
      page_type: pageType,
      page_name: pageName,
      page_slug: pageSlug,
      comment_id: commentID,
    };
    dbReplies = comment.replies ? comment.replies : [];
    dbReplies.push(newReply);

    if (message) {
      const user = await getOneFromDatabase("users", "id", localStorageUserID);

      await updateInDatabase("comments", { replies: dbReplies }, commentID);
      await updateInDatabase(
        "users",
        { comments_count: user.comments_count + 1 },
        localStorageUserID
      );

      sweetAlert("نظر شما ثبت شد و پس از بازبینی منتشر می‌شود.", "success");
      toggleTextarea(wrapper, textarea);
    } else {
      sweetAlert("نظر نمی‌تواند خالی باشد.", "info");
    }
  } catch (error) {
    console.error("Failed to submit comment reply", error);

    sweetAlert("کامنت ثبت نشد، لطفا بعدا تلاش کنید.", "failed");
  }
};

// blog.js
const fetchAndDisplayRecantBlogs = async () => {
  try {
    const allBlogs = await getAllFromDatabase("blogs");
    const lastFourBlog = sortArray(allBlogs, "create", true).slice(0, 4);
    addRecentBlogsToDom(lastFourBlog, recentBlogsWrapper);
  } catch (error) {
    console.error("Failed to fetch recent blogs", error);
  }
};

// auth.js
const submitSignupForm = async (event) => {
  event.preventDefault();
  const usernameInputValue = usernameInput.value.trim();
  const emailInputValue = emailInput.value.trim();
  const passwordInputValue = passwordInput.value.trim();

  const allUsers = await getAllFromDatabase("users");

  if (
    signupFormValidation(
      usernameInputValue,
      emailInputValue,
      passwordInputValue,
      allUsers
    )
  ) {
    let newUser = {
      id: generateRandomID(),
      created_at: new Date(),
      username: usernameInputValue,
      email: emailInputValue,
      password: passwordInputValue,
    };

    await addToDatabase("users", newUser);
    localStorage.setItem("userID", newUser.id);
    localStorage.setItem("username", newUser.username);
    localStorage.removeItem("isAdmin");

    emailInput.value = "";
    usernameInput.value = "";
    passwordInput.value = "";
    setTimeout(() => {
      location.replace("./index.html");
    }, 2000);
  }
};

// auth.js
const submitLoginForm = async (event) => {
  event.preventDefault();

  const emailInputValue = emailInput.value.trim();
  const passwordInputValue = passwordInput.value.trim();

  const users = await getAllFromDatabase("users");

  let user = users.find((user) => user.email === emailInputValue);
  if (loginFormValidation(emailInputValue, passwordInputValue, user)) {
    await updateInDatabase("users", { login_at: new Date() }, user.id);

    localStorage.setItem("userID", user.id);
    localStorage.setItem("username", user.username);
    emailInput.value = "";
    passwordInput.value = "";
    setTimeout(() => {
      location.replace("./index.html");
    }, 2000);
  }
};

const addCourseDetailToUserInDatabase = async (courses) => {
  const user = await getOneFromDatabase("users", "id", localStorageUserID);

  let coursesTotalPrice = 0;
  let freeCoursesCount = 0;
  let cashCoursesCount = 0;

  courses.forEach((course) => {
    coursesTotalPrice += applyDiscountToPrice(course.price, course.discount);
    freeCoursesCount += course.discount === 100 ? 1 : 0;
    cashCoursesCount += course.discount !== 100 ? 1 : 0;
    user.courses.push({
      id: course.id,
      name: course.name,
      is_free: course.discount === 100,
      slug: course.slug,
      image_src: course.image_src,
    });
  });

  const userNewPurchaseData = {
    cash_courses_count: user.cash_courses_count + cashCoursesCount,
    free_courses_count: user.free_courses_count + freeCoursesCount,
    expense: user.expense + coursesTotalPrice,
    last_expense_date: new Date(),
    courses: user.courses,
  };

  await updateInDatabase("users", userNewPurchaseData, localStorageUserID);

  return coursesTotalPrice;
};

const addSellDataToDatabase = async (coursesTotalPrice) => {
  if (coursesTotalPrice === 0) return;

  const databaseTableName = "sell_expense";

  // this month and year
  const dateArray = new Date().toLocaleDateString("fa").split("/");
  const year = convertPersianNumbersToEnglish(dateArray[0]);
  const monthNumber = convertPersianNumbersToEnglish(dateArray[1]);
  const month = persianMonths[monthNumber - 1];

  // Check if this month exist in database
  const dbSellData = await getAllFromDatabase(databaseTableName);
  const thisMonthData = dbSellData.find(
    (data) => data.month === month && data.year === year
  );

  // add purchase data to database
  if (thisMonthData) {
    let previousSellAmount = thisMonthData.sell;
    const newSellAmount = previousSellAmount + coursesTotalPrice;

    await updateInDatabase(
      databaseTableName,
      { sell: newSellAmount },
      thisMonthData.id
    );
  } else {
    addToDatabase(databaseTableName, { year, month, sell: coursesTotalPrice });
  }
};

const purchaseCourses = async () => {
  try {
    let courseStudentCount = null;

    const userPurchasedCourses = getLocalCourses();
    const dbCourses = await getAllFromDatabase("courses");

    let filteredCourses = dbCourses.filter((course) =>
      userPurchasedCourses.some(
        (purchasedCourse) => purchasedCourse.id === course.id
      )
    );

    for (let course of filteredCourses) {
      let courseStudentsID = course.students_id || "[]";
      courseStudentsID = JSON.parse(courseStudentsID);

      courseStudentCount = course.students;
      courseStudentsID.push(localStorageUserID);
      courseStudentCount++;
      await updateInDatabase(
        "courses",
        { students_id: courseStudentsID, students: courseStudentCount },
        course.id
      );
    }

    // Add courses info to database
    const coursesTotalPrice = await addCourseDetailToUserInDatabase(
      filteredCourses
    );
    await addSellDataToDatabase(coursesTotalPrice);

    localStorage.removeItem("courses");
    sweetAlert("خرید با موفقیت انجام شد.", "success");
    updateCartPageDetail();
    updateHederCartDetail();
    setTimeout(() => {
      location.href = "./index.html";
    }, 3000);
  } catch (error) {
    console.error("Failed to purchase courses", error);
    sweetAlert("متاسفانه خرید انجام نشد، لطفا بعدا تلاش کنید.", "failed");
  }
};

// session.js
const fetchAndDisplaySession = async () => {
  const sessionID = Number(getQueryParameters("id"));
  const courseSlug = getQueryParameters("course");

  if (!sessionID || !courseSlug) {
    location.replace("./404.html");
  }

  const dbCourse = await getOneFromDatabase("courses", "slug", courseSlug);

  const course = createCourseObject(dbCourse);

  addSessionToDOM(course, sessionID);
};

// session.js
const fetchAndDisplaySessionQuestions = async () => {
  const pageID = `${getQueryParameters("course")}_${getQueryParameters(
    "id"
  )}_${localStorageUserID}`;
  const questionID = getQueryParameters("question");

  const response = await getOneFromDatabase(
    "easyLearn-questions",
    "id",
    pageID
  );

  if (!response) {
    addSessionQuestionsToDOM();
  } else {
    const questions = response.questions;
    addSessionQuestionsToDOM(pageID, questions, questionID);
  }
};

// session.js
const submitSessionNewQuestion = async (
  course_name,
  course_slug,
  session_id,
  session_name
) => {
  try {
    const questionContent = newQuestionTextareaElement.value.trim();

    if (!questionContent) {
      sweetAlert("سوال نمی‌تواند خالی باشد.", "info");
      return;
    }
    const tableName = "easyLearn-questions";

    const newQuestion = {
      id: generateRandomID(),
      created_at: new Date(),
      content: questionContent,
      is_answered: false,
      is_closed: false,
      answers: [],
      username: localStorageUsername,
    };

    newQuestionTextareaElement.value = "";

    const pageID = `${course_slug}_${session_id}_${localStorageUserID}`;

    // get current session user questions
    let userSessionQuestions = await getOneFromDatabase(
      tableName,
      "id",
      pageID
    );

    if (userSessionQuestions) {
      let userPreviousQuestions = userSessionQuestions.questions;
      userPreviousQuestions.push(newQuestion);
      await updateInDatabase(
        tableName,
        { questions: userPreviousQuestions },
        pageID
      );
    } else {
      userSessionQuestions = {
        id: pageID,
        course_name,
        course_slug,
        session_name,
        session_id,
        user_id: localStorageUserID,
        questions: [newQuestion],
      };

      await addToDatabase(tableName, userSessionQuestions);
    }

    // add question to user stats
    const user = await getOneFromDatabase("users", "id", localStorageUserID);
    await updateInDatabase(
      "users",
      { questions_count: user.questions_count + 1 },
      localStorageUserID
    );

    sweetAlert("سوال شما با موفقیت ارسال شد.", "success");
    newQuestionTextareaElement.value = "";
    addSessionQuestionsToDOM(pageID, userSessionQuestions.questions);
  } catch (error) {
    sweetAlert("ارسال سوال با خطا مواجه شد،‌ لطفا بعدا تلاش کنید.", "failed");
    console.error("Failed to submit question", error);
  }
};

// account.js
const fetchAndDisplayAccountCourses = async () => {
  const dbCourses = await getAllFromDatabase("courses");

  let filteredCourses = dbCourses.filter((course) => {
    let studentsIDs = course.students_id;

    if (!studentsIDs) return;

    if (typeof studentsIDs === "string") {
      studentsIDs = JSON.parse(studentsIDs);
    }

    return studentsIDs.some((id) => id === localStorageUserID);
  });

  addAccountCourseToDOM(filteredCourses);
};

// account.js
const fetchAndDisplayAccountQuestions = async () => {
  try {
    const data = await getSomeFromDatabase(
      "easyLearn-questions",
      "user_id",
      localStorageUserID
    );
    addUserAccountQuestionToDOM(data);
  } catch (error) {
    console.error("Failed to fetch questions", error);
  }
};

const submitNewTicket = async (tickets) => {
  try {
    const department = newTicketChosenDepartmentElement.dataset.department;
    const subject = subjectInputElement.value.trim();
    const content = ticketTextareaElement.value.trim();

    if (!newTicketValidation(department, subject, content)) return;

    const newTicket = {
      id: generateRandomID(),
      created_at: new Date(),
      updated_at: new Date(),
      user_id: localStorageUserID,
      username: localStorageUsername,
      department,
      subject,
      content,
      answers: [],
    };

    const user = await getOneFromDatabase("users", "id", localStorageUserID);

    await addToDatabase("tickets", newTicket);
    await updateInDatabase(
      "users",
      { tickets_count: user.tickets_count + 1 },
      localStorageUserID
    );

    sweetAlert("تیکت با موفقیت ارسال شد.", "success");
    toggleNewTicketWrapper(ticketBtn);
    tickets.push(newTicket);
    addTicketsToDOM(tickets, true);
  } catch (error) {
    console.error("Failed to submit ticket", error);
    sweetAlert("ارسال تیکت با خطا مواجه شد، لطفا بعدا تلاش کنید.", "failed");
  }
};

// account.js
const fetchAndDisplayUserTickets = async () => {
  try {
    const tickets = await getSomeFromDatabase(
      "tickets",
      "user_id",
      localStorageUserID
    );

    addTicketsToDOM(tickets, true);

    newTicketSubmitBtn.addEventListener("click", () =>
      submitNewTicket(tickets)
    );
  } catch (error) {
    console.error("Failed to fetch tickets", error);
  }
};

const submitTicketAnswer = (btn, ticket, tickets, isUserPanel) => {
  const textarea = document.querySelector(`#textarea-${ticket.id}`);

  btn.addEventListener("click", async () => {
    const content = textarea.value.trim();
    if (!content) {
      sweetAlert("پاسخ نمی‌تواند خالی باشد.", "info");
      textarea.focus();
      return;
    }

    const answers = ticket.answers;

    const newAnswer = {
      id: answers.length + 1,
      created_at: new Date(),
      content,
      writer_role: isUserPanel ? "user" : "admin",
      username: isUserPanel
        ? localStorageUsername
        : localStorage.getItem("admin-name"),
    };

    const updatedTicketInfo = {
      answers,
      is_answered: isUserPanel ? false : true,
      updated_at: new Date(),
    };

    ticket.updated_at = new Date();
    ticket.is_answered = isUserPanel ? false : true;

    answers.push(newAnswer);

    textarea.value = "";

    await updateInDatabase("tickets", updatedTicketInfo, ticket.id);

    sweetAlert("پاسخ شما با موفقیت ارسال شد.", "success");

    addTicketsToDOM(tickets, isUserPanel);
    addViewedTicketToDOM(ticket.id, tickets, isUserPanel);
  });
};

// account.js - admin-panel.js
const fetchAndDisplayAccountUserDetail = async (isAdmin) => {
  if (!localStorageUserID) {
    location.replace("./auth.html?operation=login");
    return;
  }
  if (isAdmin) {
    const admin = await getOneFromDatabase("users", "id", localStorageUserID);

    if (admin.role !== "admin" && admin.role !== "manager") {
      location.replace("./account.html");
    }

    addUserAccountDetailToDOM(admin);
    localStorage.setItem("admin-name", admin.username);

    return admin;
  }

  const user = await getOneFromDatabase("users", "id", localStorageUserID);

  if (!user) {
    location.replace("./auth.html?operation=signup");
  }

  if (user.role === "admin" || user.role === "manager") {
    location.replace("./admin-panel.html");
  } else {
    addUserAccountDetailToDOM(user);
    removeLoader();
  }
};

// account.js - admin-panel.js
const submitAccountDetailChanges = async (event) => {
  event.preventDefault();

  const usernameInputValue = usernameInput.value.trim();
  const emailInputValue = emailInput.value.trim();

  const allUsers =
    (usernameInputValue || emailInputValue) &&
    (await getAllFromDatabase("users"));

  if (
    allUsers &&
    accountChangeDetailFormValidation(
      usernameInputValue,
      emailInputValue,
      allUsers
    )
  ) {
    let username = usernameInputValue || usernameInput.placeholder;
    let email = emailInputValue || emailInput.placeholder;
    updateInDatabase("users", { username, email }, localStorageUserID);
    addUserAccountDetailToDOM({ username, email });
    usernameInput.value = "";
    emailInput.value = "";
  }
};

// account.js - admin-panel.js
const submitAccountPasswordChanges = async (event) => {
  event.preventDefault();

  const currentPasswordInputValue = currentPasswordInputElem.value.trim();
  const newPasswordInputValue = newPasswordInputElem.value.trim();

  const user =
    (currentPasswordInputValue || newPasswordInputValue) &&
    (await getOneFromDatabase("users", "id", localStorageUserID));

  if (
    user &&
    accountChangePasswordFormValidation(
      currentPasswordInputValue,
      newPasswordInputValue,
      user
    )
  ) {
    updateInDatabase(
      "users",
      { password: newPasswordInputValue },
      localStorageUserID
    );
    currentPasswordInputElem.value = "";
    newPasswordInputElem.value = "";
  }
};

// admin-panel.js
const fetchAndDisplayAdminQuestions = async () => {
  try {
    const data = await getAllFromDatabase("easyLearn-questions");
    addAdminPanelQuestionToDOM(data);
  } catch (error) {
    console.error("Failed to fetch questions", error);
  }
};

const closeQuestion = (btn, pageID, questions, adminName, data, page) => {
  try {
    btn.addEventListener("click", async () => {
      const isConfirmed = await confirmSweetAlert(
        "آیا مطمئن هستید؟",
        "بستن پرسش"
      );
      if (!isConfirmed) return;

      const questionID = btn.dataset.question_id;
      const question = questions.find((question) => question.id === questionID);
      question.is_closed = true;
      await updateInDatabase("easyLearn-questions", { questions }, pageID);
      addAdminPanelViewedQuestionToDOM(data, page, question, adminName);
    });
  } catch (error) {
    console.error("Failed to close question", error);
    sweetAlert("بستن سوال با خطا مواجه شد.", "failed");
  }
};

// admin-panel.js
const fetchAndDisplayAllTickets = async () => {
  try {
    const tickets = await getAllFromDatabase("tickets");

    addTicketsToDOM(tickets);
  } catch (error) {
    console.error("Failed to fetch tickets", error);
  }
};

const closeTicket = (btn, ticket, tickets) => {
  try {
    btn.addEventListener("click", async () => {
      const isConfirmed = await confirmSweetAlert(
        "آیا مطمئن هستید؟",
        "بستن تیکت"
      );
      if (!isConfirmed) return;
      ticket.is_closed = true;
      await updateInDatabase("tickets", { is_closed: true }, ticket.id);
      addTicketsToDOM(tickets);
      addViewedTicketToDOM(ticket.id, tickets, false);
      sweetAlert("تیکت با موفقیت بسته شد.", "success");
    });
  } catch (error) {
    console.error("Failed to close ticket", error);
    sweetAlert("بستن تیکت با خطا مواجه شد.", "failed");
  }
};

// admin-panel.js
const fetchAndDisplayAllUsers = async () => {
  try {
    const users = await getAllFromDatabase("users");
    addAllUsersToDOM(users);
  } catch (error) {
    console.error("Failed to fetch users");
  }
};

// admin-panel.js
const fetchAndDisplaySellAndExpenseData = async () => {
  try {
    const data = await getAllFromDatabase("sell_expense");
    addSellAndExpenseDataToDOM(data);
  } catch (error) {
    console.error("Failed to fetch chart data", error);
  }
};

const submitQuestionAnswer = (
  btn,
  pageID,
  questions,
  adminName,
  data,
  page
) => {
  const questionID = btn.parentElement.dataset.question_id;
  const textarea = document.querySelector(`#textarea-${questionID}`);

  btn.addEventListener("click", async () => {
    const content = textarea.value.trim();
    if (!content) {
      sweetAlert("پاسخ نمی‌تواند خالی باشد.", "info");
      textarea.focus();
      return;
    }

    const question = questions.find((question) => question.id === questionID);
    const answers = question.answers;

    const newAnswer = {
      id: answers.length + 1,
      created_at: new Date(),
      content,
      writer_role: adminName ? "teacher" : "user",
      username: adminName ? adminName : localStorageUsername,
    };

    answers.push(newAnswer);
    question.is_answered = adminName ? true : false;

    textarea.value = "";

    await updateInDatabase("easyLearn-questions", { questions }, pageID);
    sweetAlert("پاسخ شما با موفقیت ارسال شد.", "success");

    adminName
      ? addAdminPanelViewedQuestionToDOM(data, page, question, adminName)
      : addSessionQuestionsToDOM(pageID, questions);
  });
};

const changeUserRole = async (user, users) => {
  try {
    if (
      (user.role === "admin" || user.role === "manager") &&
      user.id === localStorageUserID
    ) {
      sweetAlert("شما نمی توانید نقش خود را تغییر دهید.", "info");
      return;
    }

    const role = user.role === "admin" ? "کاربر" : "پشتیبان";
    const isConfirmed = await confirmSweetAlert(
      `آیا می‌ خواهید نقش ${user.username} به ${role} تغییر پیدا کند؟`,
      "تغییر نقش",
      "#059669"
    );
    if (!isConfirmed) return;

    user.role = user.role === "admin" ? "user" : "admin";

    await updateInDatabase("users", { role: user.role }, user.id);
    addAllUsersToDOM(users);
    sweetAlert("نقش  کاربر با موفقیت تغییر کرد.", "success");
    returnFromViewedUser(true);
  } catch (error) {
    sweetAlert("خطا در تغییر نقش کاربر", "failed");
    console.error("Failed to change user role", error);
  }
};

const deleteUser = async (user, users) => {
  try {
    if (
      (user.role === "admin" || user.role === "manager") &&
      user.id === localStorageUserID
    ) {
      sweetAlert("شما نمی توانید حساب کاربری خود را حذف کنید.", "info");
      return;
    }

    const isConfirmed = await confirmSweetAlert(
      `آیا مطمئن هستید؟`,
      `حذف ${user.username}`
    );
    if (!isConfirmed) return;

    await deleteFromDatabase("users", user.id);
    const filteredUsers = users.filter(
      (filteredUser) => filteredUser.id !== user.id
    );
    addAllUsersToDOM(filteredUsers);
    sweetAlert("کاربر با موفقیت حذف شد.", "success");
    returnFromViewedUser(true);
  } catch (error) {
    sweetAlert("خطا در حذف کاربر", "failed");
    console.error("Failed to delete user", error);
  }
};

const deleteUserCourse = async (deleteUserCourseBtn, user, users) => {
  try {
    const isConfirmed = await confirmSweetAlert(`آیا مطمئن هستید؟`, `حذف دوره`);
    if (!isConfirmed) return;

    const deletedCourseID = deleteUserCourseBtn.dataset.course_id;
    const deletedCourse = await getOneFromDatabase(
      "courses",
      "id",
      deletedCourseID
    );

    const filteredCourses = user.courses.filter(
      (course) => course.id !== deletedCourseID
    );
    const filteredStudentsID = deletedCourse.students_id.filter(
      (id) => id !== user.id
    );

    if (deletedCourse.discount === 100) {
      user.free_courses_count -= 1;
      await updateInDatabase(
        "users",
        {
          courses: filteredCourses,
          free_courses_count: user.free_courses_count,
        },
        user.id
      );
    } else {
      user.cash_courses_count -= 1;
      await updateInDatabase(
        "users",
        {
          courses: filteredCourses,
          cash_courses_count: user.cash_courses_count,
        },
        user.id
      );
    }
    await updateInDatabase(
      "courses",
      { students_id: filteredStudentsID },
      deletedCourseID
    );

    user.courses = user.courses.filter(
      (course) => course.id !== deletedCourseID
    );

    addAllUsersToDOM(users);
    addAdminViewedUserCoursesToDOM(user, users);
    addAdminViewedUserStatsToDOM(user, users);
    sweetAlert("دسترسی کاربر به دوره با موفقیت حذف شد.", "success");
  } catch (error) {
    sweetAlert("خطا در حذف دوره", "failed");
    console.error("Failed to delete course", "error");
  }
};

export {
  changeUserRole,
  closeQuestion,
  closeTicket,
  deleteUser,
  deleteUserCourse,
  fetchAndDisplayAccountCourses,
  fetchAndDisplayAccountQuestions,
  fetchAndDisplayAccountUserDetail,
  fetchAndDisplayAdminQuestions,
  fetchAndDisplayAllTickets,
  fetchAndDisplayAllUsers,
  fetchAndDisplayComments,
  fetchAndDisplayMainPageBlogs,
  fetchAndDisplayMainPageCourses,
  fetchAndDisplayRecantBlogs,
  fetchAndDisplaySellAndExpenseData,
  fetchAndDisplaySession,
  fetchAndDisplaySessionQuestions,
  fetchAndDisplayUserTickets,
  purchaseCourses,
  submitAccountDetailChanges,
  submitAccountPasswordChanges,
  submitCommentReply,
  submitLoginForm,
  submitNewComment,
  submitNewTicket,
  submitQuestionAnswer,
  submitSessionNewQuestion,
  submitSignupForm,
  submitTicketAnswer,
};
