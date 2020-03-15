// Global app controller
import Search from "./models/Search";
import * as searchView from './views/searchView';
import {elements, renderLoader, clearLoader} from "./views/base";

const state = {};

const controlSearch = async () => {
    // Get query from view
    const query = 'pizza';

    if (query) {
        // New search object and add state
        state.search = new Search(query);

        // Prepare UI for the results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        // Search for recipes
        await state.search.getResult();

        // Render results on UI
        clearLoader();
        searchView.renderResults(state.search.result);
    }
};

document.querySelector('.search').addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});