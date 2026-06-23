import { deleteCard, changeLikeCardStatus } from './api.js';

const getTemplate = () => 
{
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (data, userId, { onPreviewPicture }) => 
{
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likeCount = cardElement.querySelector(".card__like-count");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;

  const isLiked = data.likes.some(like => like._id === userId);
  if (isLiked) 
  {
    likeButton.classList.add("card__like-button_is-active");
  }
  likeCount.textContent = data.likes.length;

  if (data.owner._id !== userId) 
  {
    deleteButton.style.display = 'none';
  }

  likeButton.addEventListener("click", () => 
  {
    const isCurrentlyLiked = likeButton.classList.contains("card__like-button_is-active");
    changeLikeCardStatus(data._id, isCurrentlyLiked)
      .then((updatedCard) => 
      {
        likeButton.classList.toggle("card__like-button_is-active");
        likeCount.textContent = updatedCard.likes.length;
      })
      .catch((err) => console.log(err));
  });

  deleteButton.addEventListener("click", () => 
  {
    deleteCard(data._id)
      .then(() => 
      {
        cardElement.remove();
      })
      .catch((err) => console.log(err));
  });

  if (onPreviewPicture) 
  {
    cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.link }));
  }

  return cardElement;
};