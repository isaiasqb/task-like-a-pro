var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-warning badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};


// EDITING tasks on click by using event delegation
$(".list-group").on("click", "p", function() {
  //select the task text and save it on a variable
  var text = $(this)
  .text()
  .trim();
  console.log(text)
  //create a <textarea> element that has the original task text
  var textInput = $("<textarea>")
  .addClass("form-control")
  .val(text); 

  $(this).replaceWith(textInput);
  //automatically highlight the textarea when clicked
  textInput.trigger("focus");
});



// SAVE the edited task when the textarea is out of focus
$(".list-group").on("blur", "textarea", function(){
  //capture the text from the text area in a variable
  var text = $(this)
  .val()
  .trim();
  
  // get the parent's <ul> id attribute and erase the list- part to leave behind the list status
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");
  
  //get the task's position in the list of other <li> elements
  var index = $(this)
  .closest(".list-group-item")
  .index();
  
  //since we don't know the values ahead oof time. update the tasks array using the variables
  tasks[status][index].text = text;
  saveTasks()
  
  //convert the <textarea> back into a <p> element
  var taskP = $("<p>")
  .addClass("m-1")
  .text(text);
  
  $(this).replaceWith(taskP);
});


//EDITING due dates on click by using event delegation
$(".list-group").on("click", "span", function() {
  //get the current text value
  var date = $(this)
  .text()
  .trim();

  //create new imput element
  var dateInput = $("<input>")
  .attr("type", "text")
  .addClass("form-control")
  .val(date);

  //replace the current <span> with the newly created <input> element
  $(this).replaceWith(dateInput);
  // focus on this new element
  dateInput.trigger("focus");
});

//SAVING the edited due date by clicking outside the <input> area
$(".list-group").on("blur", "input[type='text']", function() {
  console.log(this)
  //get the current input text
  var date = $(this)
  .val()
  .trim();

  //get the parent's <ul> attribute status
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");

  //get the task's position in the list of other <li> elements
  var index = $(this)
  .closest(".list-group")
  .index();

  //update the task in the arrayand save to local storage
  tasks[status][index].date = date;
  saveTasks()

  //recreate span element with new edited value
  var taskSpan = $("<span>")
  .addClass("badge badge-info badge-pill")
  .text(date);

  //replace the input with new span element
  $(this).replaceWith(taskSpan);
})



// SORTABLE and DRAGGABLE functionalities
// the actual lists we want to become sortable are the <ul> elements with the class list-group.
// using a jQuery selector will find all list-group elements and then call a new jQuery UI method on them.
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {// console.log("activate");
  },
  deactivate: function(event) {// console.log("deactivate");
  },
  over: function(event) {// console.log("over");
  },
  out: function(event) {// console.log("out");
  },
  update: function(event) {
    // array to store the task info before pushing it to the task sorresponding list
    var tempArr = [];

    $(this).children().each(function() {
      var text = $(this) // the nested $(this) refers to the task <li> element, you can use additional jQuery methods to strip out the task's description and due date.
      .find("p").text().trim();

      var date = $(this)
      .find("span").text().trim();

      //add data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      })
    });
    console.log(tempArr)

    // trim down list's ID to match object property
    var arrName = $(this)
    .attr("id")
    .replace("list-", "")

    // update the main  tasks array  
    tasks[arrName] = tempArr;
    saveTasks()

  } // --> update function ends
})


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


