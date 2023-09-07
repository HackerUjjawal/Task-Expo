const taskInput = document.querySelector(".task-input input");
const filters = document.querySelectorAll(".filters span");
const clearAll = document.querySelector(".clear-btn");
const taskBox = document.querySelector(".task-box");

let editId,
  isEditTask = false,
  todos = JSON.parse(localStorage.getItem("todo-list"));

filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector("span.active").classList.remove("active");
    btn.classList.add("active");
    showTodo(btn.id);
  });
});

function showTodo(filter) {
  let liTag = "";
  if (todos) {
    todos.forEach((todo, id) => {
      let completed = todo.status == "completed" ? "checked" : "";
      let taskDate = new Date(todo.name.split(' ')[1]);
      let currentDate = new Date();
      let color = "";

      let daysDifference = Math.floor((taskDate - currentDate) / (1000 * 60 * 60 * 24));
      if (daysDifference <= 0) {
        color = "#FF8BA0";
      } else if (daysDifference >= 0 && daysDifference <= 4) {
        color = "#FF8BA0";
      } else if (daysDifference >= 5 && daysDifference >= 9) {
        color = "#90EE90";
      }

      let blinkClass = "";
      if (daysDifference <= 2 && todo.status != "completed") {
        blinkClass = "blink";
      }

      if (filter == todo.status || filter == "all") {
        liTag += `
          <li class="task">
            <label for="${id}">
              <input onclick="updateStatus(this)" type="checkbox" id="${id}" ${completed}>
              <p class="${completed} ${blinkClass}" style="color: ${color}">${todo.name}</p>
            </label>
            <div class="settings">
              <i onclick="showMenu(this)" class="uil uil-ellipsis-h"></i>
              <ul class="task-menu">
                <li onclick='editTask(${id}, "${todo.name}")'><i class="uil uil-pen"></i>Edit</li>
                <li onclick='deleteTask(${id}, "${filter}")'><i class="uil uil-trash"></i>Delete</li>
              </ul>
            </div>
          </li>`;
      }
    });
  }
  taskBox.innerHTML = liTag || `<span>You don't have any task here</span>`;
  let checkTask = taskBox.querySelectorAll(".task");
  !checkTask.length
    ? clearAll.classList.remove("active")
    : clearAll.classList.add("active");
  taskBox.offsetHeight >= 300
    ? taskBox.classList.add("overflow")
    : taskBox.classList.remove("overflow");
}
showTodo("all");

function showMenu(selectedTask) {
  let menuDiv = selectedTask.parentElement.lastElementChild;
  menuDiv.classList.add("show");
  document.addEventListener("click", (e) => {
    if (e.target.tagName != "I" || e.target != selectedTask) {
      menuDiv.classList.remove("show");
    }
  });
}

function updateStatus(selectedTask) {
  let taskName = selectedTask.parentElement.lastElementChild;
  if (selectedTask.checked) {
    taskName.classList.add("checked");
    todos[selectedTask.id].status = "completed";
  } else {
    taskName.classList.remove("checked");
    todos[selectedTask.id].status = "pending";
  }
  localStorage.setItem("todo-list", JSON.stringify(todos));
}

function editTask(taskId, textName) {
  editId = taskId;
  isEditTask = true;
  taskInput.value = textName;
  taskInput.focus();
  taskInput.classList.add("active");
}

function deleteTask(deleteId, filter) {
  isEditTask = false;
  todos.splice(deleteId, 1);
  localStorage.setItem("todo-list", JSON.stringify(todos));
  showTodo(filter);
}

clearAll.addEventListener("click", () => {
  isEditTask = false;
  todos.splice(0, todos.length);
  localStorage.setItem("todo-list", JSON.stringify(todos));
  showTodo();
});

taskInput.addEventListener("keyup", (e) => {
  let userTask = taskInput.value.trim();
  if (e.key == "Enter" && userTask) {
    if (!isEditTask) {
      todos = !todos ? [] : todos;
      let taskInfo = { name: userTask, status: "pending" };

      // Prompt the user to enter a date
      const date = prompt("Enter a date:");
      taskInfo.name = `${userTask} ${date}`; // Append the date to the task name

      // Prompt the user to enter a category
      const category = prompt("Enter a category (education, personal, child, game, job, or other):");
      taskInfo.name = `${taskInfo.name} ${category}`; // Append the category to the task name

      todos.push(taskInfo);
    } else {
      isEditTask = false;
      todos[editId].name = userTask;
    }
    taskInput.value = "";
    localStorage.setItem("todo-list", JSON.stringify(todos));
    showTodo(document.querySelector("span.active").id);
  }
});

const dateInput = document.querySelector(".date-input");
const dateDisplay = document.querySelector(".date");

dateInput.addEventListener("change", (e) => {
  const selectedDate = e.target.value;
  dateDisplay.textContent = selectedDate;
});

// playing audio when delete task
function deleteTask(deleteId, filter) {
  isEditTask = false;
  todos.splice(deleteId, 1);
  localStorage.setItem("todo-list", JSON.stringify(todos));
  showTodo(filter);

  // Play the delete sound
  const deleteSound = document.getElementById("deleteSound");
  deleteSound.play();
}

const micIcon = document.getElementById("mic-icon");

// Create a new SpeechRecognition object
const recognition = new window.SpeechRecognition();

// Set the properties for the recognition
recognition.interimResults = true;
recognition.lang = "en-US";

// Event listener for the microphone icon click
micIcon.addEventListener("click", () => {
  // Start the recognition
  recognition.start();
});

// Event listener for the recognition result
recognition.addEventListener("result", (event) => {
  const transcript = Array.from(event.results)
    .map((result) => result[0].transcript)
    .join("");

  // Update the input field with the transcribed text
  document.getElementById("myinput").value = transcript;
});

// Event listener for the recognition end
recognition.addEventListener("end", () => {
  // Automatically start searching for tasks
  search();
});

function startVoiceSearch() {
  const searchInput = document.getElementById("myinput");
  const transcribedText = searchInput.value;

  searchInput.value = transcribedText;

  search();
}

function search() {
  const filter = document.getElementById("myinput").value.toUpperCase();
  const transcribedText = document.getElementById("myinput").value.toUpperCase();
  const taskNames = taskBox.getElementsByTagName("p");
  let tasksShown = false; // Variable to track if any tasks were shown

  for (let i = 0; i < taskNames.length; i++) {
    let taskName = taskNames[i].textContent || taskNames[i].innerText;
    if (taskName.toUpperCase().indexOf(transcribedText) > -1) {
      taskNames[i].parentNode.parentNode.style.display = "";
      tasksShown = true; // Set tasksShown to true if any tasks are shown
    } else {
      taskNames[i].parentNode.parentNode.style.display = "none";
    }
  }
  if (!tasksShown) {
    alert("No matching tasks found.");
  }
}


