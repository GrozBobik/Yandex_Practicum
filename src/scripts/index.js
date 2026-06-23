import { getUserInfo, getCardList, setUserInfo, setUserAvatar, addNewCard } from "./components/api.js";
import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

const validationConfig = 
{
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible',
};

enableValidation(validationConfig);

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input_type_avatar");

const usersStatsModalWindow = document.querySelector(".popup_type_info");

let userId = null;

const formatDate = (date) =>
{
  return date.toLocaleDateString("ru-RU",
  {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const createInfoString = (term, description) =>
{
  const template = document.getElementById("popup-info-definition-template");
  const element = template.content.cloneNode(true);
  element.querySelector(".popup__info-term").textContent = term;
  element.querySelector(".popup__info-description").textContent = description;
  return element;
};

const createUserBadge = (name, count) =>
{
  const template = document.getElementById("popup-info-user-preview-template");
  const element = template.content.cloneNode(true);
  element.querySelector(".popup__list-item").textContent = `${name} (${count})`;
  return element;
};

const handlePreviewPicture = ({ name, link }) =>
{
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) =>
{
  evt.preventDefault();
  const submitButton = evt.target.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Сохранение...';

  setUserInfo({ name: profileTitleInput.value, about: profileDescriptionInput.value })
    .then((userData) =>
    {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => console.log(err))
    .finally(() =>
    {
      submitButton.textContent = originalText;
    });
};

const handleAvatarFormSubmit = (evt) =>
{
  evt.preventDefault();
  const submitButton = evt.target.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Сохранение...';

  setUserAvatar(avatarInput.value)
    .then((userData) =>
    {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => console.log(err))
    .finally(() =>
    {
      submitButton.textContent = originalText;
    });
};

const handleCardFormSubmit = (evt) =>
{
  evt.preventDefault();
  const submitButton = evt.target.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Создание...';

  addNewCard({ name: cardNameInput.value, link: cardLinkInput.value })
    .then((newCard) =>
    {
      const cardElement = createCardElement(newCard, userId, { onPreviewPicture: handlePreviewPicture });
      placesWrap.prepend(cardElement);
      closeModalWindow(cardFormModalWindow);
      evt.target.reset();
    })
    .catch((err) => console.log(err))
    .finally(() =>
    {
      submitButton.textContent = originalText;
    });
};

const handleLogoClick = () =>
{
  getCardList()
    .then((cards) =>
    {
      if (!cards || cards.length === 0)
      {
        return;
      }

      const users = {};
      cards.forEach(card =>
      {
        const ownerId = card.owner._id;
        if (!users[ownerId])
        {
          users[ownerId] = {
            name: card.owner.name,
            cards: 0,
          };
        }
        users[ownerId].cards++;
      });

      const totalUsers = Object.keys(users).length;

      const sortedCards = [...cards].sort((a, b) =>
        new Date(a.createdAt) - new Date(b.createdAt)
      );

      const firstDate = formatDate(new Date(sortedCards[0].createdAt));
      const lastDate = formatDate(new Date(sortedCards[sortedCards.length - 1].createdAt));

      let maxCards = 0;
      let maxUserName = '';
      Object.entries(users).forEach(([id, data]) =>
      {
        if (data.cards > maxCards)
        {
          maxCards = data.cards;
          maxUserName = data.name;
        }
      });

      const infoList = usersStatsModalWindow.querySelector('.popup__info');
      const usersList = usersStatsModalWindow.querySelector('.popup__list');
      const title = usersStatsModalWindow.querySelector('.popup__title');
      const text = usersStatsModalWindow.querySelector('.popup__text');

      infoList.innerHTML = '';
      usersList.innerHTML = '';

      title.textContent = 'Статистика пользователей';
      text.textContent = 'Все пользователи:';

      infoList.append(createInfoString('Всего пользователей:', `${totalUsers}`));
      infoList.append(createInfoString('Первая создана:', firstDate));
      infoList.append(createInfoString('Последняя создана:', lastDate));
      infoList.append(createInfoString('Максимум карточек от одного:', `${maxUserName} (${maxCards})`));

      Object.entries(users).forEach(([id, data]) =>
      {
        const userElement = createUserBadge(data.name, data.cards);
        usersList.append(userElement);
      });

      openModalWindow(usersStatsModalWindow);
    })
    .catch((err) => console.log(err));
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

openProfileFormButton.addEventListener("click", () =>
{
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () =>
{
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () =>
{
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openModalWindow(cardFormModalWindow);
});

const logo = document.querySelector(".logo");
if (logo)
{
  logo.addEventListener("click", handleLogoClick);
}

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => 
{
  setCloseModalWindowEventListeners(popup);
});

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => 
  {
    userId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((card) => 
    {
      const cardElement = createCardElement(card, userId, { onPreviewPicture: handlePreviewPicture });
      placesWrap.append(cardElement);
    });
  })
  .catch((err) => console.log(err));