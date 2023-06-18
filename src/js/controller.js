import * as model from './model';
import recipeView from './views/recipeView';
import searchView from './views/searchView';
import resultsView from './views/resultsView';
import bookmarksView from './views/bookmarksView';
import paginationView from './views/paginationView';
import addRecipeView from './views/addRecipeView';
import { MODAL_CLOSE_SEC } from './config';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

// if (module.hot) module.hot.accept();

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 3: Update the bookmarks
    bookmarksView.update(model.state.bookmarks);

    // 1: Loading the recipe
    await model.loadRecipe(id);

    // 2: Render the recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // 1: Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2: Loading the results
    await model.loadSearchResults(query);

    // 3: Render the results
    resultsView.render(model.getSearchResultsPage());

    // 4: Render pagination
    paginationView.render(model.state.search);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlPagination = function (goToPage) {
  // 1: Render NEW the results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 4: Render NEW pagination
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update recipe servings
  model.updateServings(newServings);

  // Render recipe
  recipeView.render(model.state.recipe);
};

const controlAddBookmark = function () {
  // Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  recipeView.update(model.state.recipe);

  // Render bookmark
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();

    // 1: Upload the new recipe
    await model.uploadRecipe(newRecipe);

    // 2: render the new recipe
    recipeView.render(model.state.recipe);

    // Render the message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `$#${model.state.recipe.id}`);

    // 3: Close the modal
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(err);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
