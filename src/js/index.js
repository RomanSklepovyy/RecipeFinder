// Global app controller
import Search from "./models/Search";
import * as searchView from './views/searchView';
import {elements, renderLoader, clearLoader} from "./views/base";
import Recipe from "./models/Recipe";
import * as recipeView from "./views/recepiView";
import * as listView from "./views/listView";
import List from './models/List';

// Global state of the app
const state = {};
window.state = state;

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
            recipeView.renderRecipe(state.recipe);


        } catch (e) {
            console.log(e);
            alert('Error processing recipe');
        }
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

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
       controlList();
   }
});















