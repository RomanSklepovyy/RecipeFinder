// Global app controller
import Search from "./models/Search";

const state = {};

const controlSearch = async () => {
    // Get query from view
    const query = 'pizza';

    if (query) {
        // New search object and add state
        state.search = new Search(query);

        // Prepare UI for the results

        // Search for recipes
        await state.search.getResult();

        // Render results on UI
        console.log(state.search.result);
    }
};

document.querySelector('.search').addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});