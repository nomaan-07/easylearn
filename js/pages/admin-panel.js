import {
  deleteFromDatabase,
  getAllFromDatabase,
  updateInDatabase,
} from "../database/database-api.js";
import {
  fetchAndDisplayAccountUserDetail,
  fetchAndDisplayAdminQuestions,
  fetchAndDisplayAllTickets,
  fetchAndDisplayAllUsers,
  fetchAndDisplaySellAndExpenseData,
  submitAccountDetailChanges,
  submitAccountPasswordChanges,
} from "../database/database-handlers.js";
import {
  accountChangeDetailSubmitBtn,
  accountChangePasswordSubmitBtn,
  accountChangeProfilePictureBtn,
  accountDisplayPasswordButtons,
  accountMenuItemElements,
  adminCommentsFilterButtons,
  adminPanelCommentsWrapper,
  adminPanelUsersBackBtn,
  mobileMenuCloseBtn,
  mobileMenuOpenBtn,
  overlay,
  ticketBtn,
} from "../dom/dom-elements.js";
import {
  addAdminPanelCommentsToDOM,
  displayChosenAccountSection,
  returnFromViewedTicket,
  returnFromViewedUser,
} from "../dom/dom-handlers.js";
import {
  confirmSweetAlert,
  sweetAlert,
} from "../initializers/sweet-alert-initialize.js";
import "../theme/change-theme.js";
import {
  activeSortBtn,
  closeMobileAccountMenu,
  displayPasswordHandler,
  openMobileAccountMenu,
  removeSortButtonsClasses,
} from "../ui/ui-handlers.js";
import { removeLoader } from "../utils/utils.js";

let commentFilterType = "all";
let allComments = null;
let adminPanelCommentsEventListenerAdded = false;

const fetchAndDisplayAdminPanelComments = async (filterType) => {
  const dbComments = await getAllFromDatabase("comments");
  allComments = dbComments;

  addAdminPanelCommentsToDOM(dbComments, filterType);
  if (!adminPanelCommentsEventListenerAdded) {
    adminPanelCommentsWrapper.addEventListener("click", (event) =>
      adminPanelCommentDeleteAndConfirmHandler(event, dbComments)
    );
    adminPanelCommentsEventListenerAdded = true;
  }
};

fetchAndDisplayAdminPanelComments(commentFilterType);

const adminDeleteComment = async (commentParentID, commentID, comments) => {
  try {
    const response = await confirmSweetAlert("آیا مطمئن هستید؟", "حذف کامنت");
    if (response) {
      if (commentParentID) {
        const commentParent = comments.find(
          (comment) => comment.id === commentParentID
        );
        const filteredComments = commentParent.replies.filter(
          (commentReply) => commentReply.id !== commentID
        );
        await updateInDatabase(
          "comments",
          { replies: filteredComments },
          commentParentID
        );
      } else {
        await deleteFromDatabase("comments", commentID);
      }
      await fetchAndDisplayAdminPanelComments(commentFilterType);
      sweetAlert("کامنت حذف شد.", "success");
    }
  } catch (error) {
    console.error("Failed to delete comment", error);
    sweetAlert("حذف کامنت با خطا مواجه شد.", "failed");
  }
};

const adminCommentConfirmation = async (
  commentParentID,
  commentID,
  comments
) => {
  try {
    let comment = null;
    if (commentParentID) {
      const commentParent = comments.find(
        (comment) => comment.id === commentParentID
      );
      comment = commentParent.replies.find(
        (commentReply) => commentReply.id === commentID
      );
      comment.confirmed = !comment.confirmed;

      await updateInDatabase(
        "comments",
        { replies: commentParent.replies },
        commentParentID
      );
    } else {
      comment = comments.find((comment) => comment.id === commentID);
      comment.confirmed = !comment.confirmed;

      await updateInDatabase(
        "comments",
        { confirmed: comment.confirmed },
        commentID
      );
    }
    await fetchAndDisplayAdminPanelComments(commentFilterType);
    sweetAlert("وضعیت کامنت تغییر کرد.", "success");
  } catch (error) {
    console.error("Failed to change comment confirmation", error);
    sweetAlert("تایید کامنت با خطا مواجه شد.", "failed");
  }
};

const adminPanelCommentDeleteAndConfirmHandler = (event, comments) => {
  let element = event.target;
  let commentID = element.closest(".comment__buttons")
    ? element.closest(".comment__buttons").dataset.comment_id
    : null;
  let commentParentID = element.closest(".comment__buttons")
    ? element.closest(".comment__buttons").dataset.comment_parent_id
    : null;

  if (element.closest(".comment__delete-btn")) {
    adminDeleteComment(commentParentID, commentID, comments);
  } else if (element.closest(".comment__confirm-btn")) {
    adminCommentConfirmation(commentParentID, commentID, comments);
  }
};

const filterCommentsHandler = (btn, comments) => {
  const filterType = btn.dataset.filter;

  commentFilterType = filterType;
  removeSortButtonsClasses(adminCommentsFilterButtons);
  activeSortBtn(btn);

  addAdminPanelCommentsToDOM(comments, filterType);
};

window.addEventListener("load", async () => {
  await fetchAndDisplayAccountUserDetail(true);
  setTimeout(() => {
    removeLoader();
  }, 500);
  fetchAndDisplayAdminQuestions();
  fetchAndDisplaySellAndExpenseData();
  fetchAndDisplayAllTickets();
  fetchAndDisplayAllUsers();
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
adminCommentsFilterButtons.forEach((btn) => {
  btn.addEventListener("click", () => filterCommentsHandler(btn, allComments));
});
ticketBtn.addEventListener("click", returnFromViewedTicket);
adminPanelUsersBackBtn.addEventListener("click", () =>
  returnFromViewedUser(true)
);
