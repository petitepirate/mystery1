// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

// coded num_categories & Num_questions_per_cat to allow for easier future function
let numCategories = 6;
let numQuestionsPerCat = 5;

// async function to get categories to pick from and then return 6 random nonrepeating categories
async function getCategoryIds() {
	let response = await axios.get('http://jservice.io/api/categories', {
		params: { count: 100, offset: Math.floor(Math.random() * 100) }
	});
	let newArray = [];
	let cat = response.data;
	// for each category returned place the id into the new array (we don't care about the other data)
	cat.forEach((returnedCategories) => {
		id = returnedCategories.id;
		newArray.push(id);
	});
	//use lodash library to set categories as an array of 6 random id's
	categories = _.sampleSize(newArray, 6);
	return categories; //returns array with 6 category Id's
}

//function that takes in the 6 category ids and returns objects with all the data.
async function getCategory(catId) {
	// returns an object based on a passsed in category id. object includes title, id and questions/ answers
	let response = await axios.get(`http://jservice.io//api/category?id=${catId}`);
	let catObj = response.data;
	// return for later use
	return catObj; //5 new objects with id, title, clues for each of the 6 categories (35 total objects)
}
/**
 * 
 * @param {string} catIds returned from getCategoryIds();
 * @param {callback function} catObjCallback from getCategory();
 */
// Fill the HTML table#jeopardy with the categories & cells for questions.
async function fillTable(catId, catObjCallback) {
	// run getCategoryIds function to fillout the categories variable, waits for code to execute before proceeding
	await getCategoryIds(catId);
	// select head
	let $head = $('thead');
	// create a row element
	let $hrow = $('<tr></tr>');
	// add row element to head
	$head.append($hrow);
	// loop over the returned category ids (created with the getCategoryIs function) and add title to head row
	for (let category of categories) {
		// runs the CatObj funciton with the category id passed through
		let returnedCategory = await catObjCallback(category);
		//console.log(catObj(category));  // 6 promises, each with an array of 5 questions and answers
		let $newTd = $(`<td>${returnedCategory.title}</td>`); // takes each promise and adds its title as the table heading
		$head.children().append($newTd); // appends the table heading
	}
	// select table body
	let $body = $('tbody');
	// loop over the number of questions for each category variable
	for (i = 0; i < numQuestionsPerCat; i++) {
		// every loop create a new row
		let $trow = $(`<tr></tr>`);
		$body.append($trow);
		// loop over each
		for (let x = 0; x < numCategories; x++) {
			// runs the CatObj funciton with the category id passed through
			let returnedCategory = await catObjCallback(categories[x]);
			// create new td with an class to allow for easey tracking
			let $td = $(`<td class="${returnedCategory.id}">?</td>`);
			// add data question to td for later logic
			$td.attr('data-question', `${returnedCategory.clues[i].question}`);
			// add data answer to td for later logic
			$td.attr('data-answer', `${returnedCategory.clues[i].answer}`);
			// append the td to the last row created
			$('tbody:last-child').append($td);
		}
	}
	$('#jeopardy').removeClass('hidden');
}

// /** Handle clicking on a clue: show the question or answer.
function handleClick(evt) {
	// check if the td clicked has a class which includse question (does not by default)
	if (!evt.target.classList.contains('question')) {
		// if quetsion is not a class, add it as a class
		evt.target.classList.add('question');
		// update the InnerHTML for the question data earlier stored
		evt.target.innerHTML = `${evt.target.dataset.question}`;
		// check if the td clicked has a class which includse answer (does not by default)
	} else if (!evt.target.classList.contains('answer')) {
		// if answer is not a class, add it as a class
		evt.target.classList.add('answer');
		// update the InnerHTML for the answer data earlier stored
		evt.target.innerHTML = `<td>${evt.target.dataset.answer}</td>`;
	}
}
/** On click of new button, restart game. */
$('#restart').on('click', async function setupAndStart(evt) {
	// empty thead
	$('thead').empty();
	// empty tbody
	$('tbody').empty();
	$('#jeopardy').addClass('hidden');
	// starts the function to fill in the tables, provides category ids and category contents functions
	await fillTable(getCategoryIds, getCategory);
});

/** On page load, setup and start & add event handler for clicking clues */

$(document).ready(() => {
	// on page load create the table
	fillTable(getCategoryIds, getCategory);
	// create the click listener
	$('tbody').on('click', 'td', handleClick);
});
