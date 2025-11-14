import {
  fetchAndDisplayAccountCourses,
  fetchAndDisplayAccountQuestions,
  fetchAndDisplayAccountUserDetail,
  fetchAndDisplayUserTickets,
  submitAccountDetailChanges,
  submitAccountPasswordChanges,
} from "../database/database-handlers.js";
import {
  accountChangeDetailSubmitBtn,
  accountChangePasswordSubmitBtn,
  accountChangeProfilePictureBtn,
  accountDisplayPasswordButtons,
  accountMenuItemElements,
  localStorageUserID,
  mobileMenuCloseBtn,
  mobileMenuOpenBtn,
  newTicketChosenDepartmentWrapper,
  newTicketDepartmentOptionElements,
  overlay,
  ticketBtn,
  ticketTextareaElement,
} from "../dom/dom-elements.js";
import {
  departmentSelectionHandler,
  displayChosenAccountSection,
  toggleNewTicketWrapper,
} from "../dom/dom-handlers.js";
import { sweetAlert } from "../initializers/sweet-alert-initialize.js";
import "../theme/change-theme.js";
import {
  closeMobileAccountMenu,
  displayPasswordHandler,
  openMobileAccountMenu,
  textareaAutoResize,
  toggleNewTicketOptionsWrapper,
} from "../ui/ui-handlers.js";

if (!localStorageUserID) {
  location.replace("./auth.html?operation=signup");
}

window.addEventListener("load", async () => {
  await fetchAndDisplayAccountUserDetail();
  fetchAndDisplayAccountCourses();
  fetchAndDisplayAccountQuestions();
  fetchAndDisplayUserTickets();
});

accountMenuItemElements.forEach((element) =>
  element.addEventListener("click", () => displayChosenAccountSection(element))
);
mobileMenuOpenBtn.addEventListener("click", openMobileAccountMenu);
mobileMenuCloseBtn.addEventListener("click", closeMobileAccountMenu);
overlay.addEventListener("click", closeMobileAccountMenu);
accountChangeDetailSubmitBtn.addEventListener(
  "click",
  submitAccountDetailChanges
);
accountChangePasswordSubmitBtn.addEventListener(
  "click",
  submitAccountPasswordChanges
);
accountDisplayPasswordButtons.forEach((btn) =>
  btn.addEventListener("click", () =>
    displayPasswordHandler(btn, btn.previousElementSibling)
  )
);
accountChangeProfilePictureBtn.addEventListener("click", () =>
  sweetAlert("در حال حاضر امکان تغییر تصویر پروفایل وجود ندارد.", "info")
);
ticketBtn.addEventListener("click", () => toggleNewTicketWrapper(ticketBtn));
newTicketChosenDepartmentWrapper.addEventListener(
  "click",
  toggleNewTicketOptionsWrapper
);
newTicketDepartmentOptionElements.forEach((element) =>
  element.addEventListener("click", departmentSelectionHandler)
);
ticketTextareaElement.addEventListener("input", textareaAutoResize);
