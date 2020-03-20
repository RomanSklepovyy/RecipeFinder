// Global app controller
import Search from "./models/Search";
import * as searchView from './views/searchView';
import {elements, renderLoader, clearLoader} from "./views/base";
import Recipe from "./models/Recipe";
import * as recipeView from "./views/recepiView";
import * as listView from "./views/listView";
import List from './models/List';
import Likes from './models/Likes';
import * as likesView from './views/likesView';

// Global state of the app
const state = {};

//
//  Search controller
//

const controlSearch = async () => {
    // Get query from view
    const query = searchView.getInput();

    if (query) {
        // New search object and add state
        state.search = new Search(query);

        // Prepare UI for the results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // Search for recipes
            await state.search.getResult();

            // Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (e) {
            console.log(e);
            alert('Wrong search word..');
            clearLoader();
        }

    }
};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const button = e.target.closest('.btn-inline');

    if (button) {
        const goToPage = parseInt(button.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

//
//  Recipe controller
//

const controlRecipe = async () => {
    // Get id from URL
    const id = window.location.hash.replace('#', '');

    if (id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight selected search item
        if (state.search) searchView.highlightSelected(id);

        // Create new obj
        state.recipe = new Recipe(id);

        try {
            // Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // Calc servings and time
            state.recipe.calcServings();
            state.recipe.calcTime();

            // Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));


        } catch (e) {
            console.log(e);
            alert('Error processing recipe');
        }
    }
};

// Re-open
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

// Restore Liked recipe on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    // Restore likes
    state.likes.readStorage();
    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    // Render likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease btn clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingIng(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase btn clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingIng(state.recipe);

    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        controlList();

    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
});


//
// List controller
//

const controlList = () => {

    if (!state.list) state.list = new List();

    // Add ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const  item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').id;

   // Handle the delete item
    if(e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);
        // Delete from UI
        listView.deleteItem(id);

    // Handle the count update
    } else if(e.target.matches('.shopping__count-value')) {
        const val = parseInt(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});


//
//  Likes controller
//


const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // Recipe hasn't liked yet
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const  newLike = state.likes.addLike(currentID, state.recipe.title, state.recipe.author, state.recipe.img);

        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add to the like list
        likesView.renderLike(newLike);

    // Already liked
    } else {
        // Remove like from the state
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like from the UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};
















