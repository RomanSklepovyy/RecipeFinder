// Global app controller
import Search from "./models/Search";
import * as searchView from './views/searchView';
import {elements, renderLoader, clearLoader} from "./views/base";
import Recipe from "./models/Recipe";

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
            console.log(state.recipe);
        } catch (e) {
            console.log(e);
            alert('Error processing recipe');
        }
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

















