const addBtn = document.getElementById("addBtn");
const taskInput = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const taskList = document.getElementById("taskList");
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");

// Load theme and tasks on startup
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "dark";
  setTheme(savedTheme);
  loadTasks();
  checkOverdueTasks();
  applyFilter(document.querySelector(".filter-btn.active").dataset.filter);
});

// Theme toggle
themeToggle.addEventListener("click", () => {
  const currentTheme = document.body.classList.contains("light") ? "light" : "dark";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  setTheme(newTheme);
});

function setTheme(theme) {
  if (theme === "light") {
    document.body.classList.add("light");
    themeToggle.textContent = "🌙";
  } else {
    document.body.classList.remove("light");
    themeToggle.textContent = "☀️";
  }
  localStorage.setItem("theme", theme);
}

// Save/load tasks
function saveTasks() {
  const tasks = [];
  document.querySelectorAll("#taskList li").forEach(li => {
    tasks.push({
      text: li.querySelector("span").innerText,
      date: li.querySelector(".date").innerText.replace("Due: ", ""),
      completed: li.classList.contains("completed")
    });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  storedTasks.forEach(task => createTask(task.text, task.completed, task.date));
}

// Create task
function createTask(taskText, completed=false, dateText=null) {
  if(!dateText){
    if(dateInput.value){
      dateText = new Date(dateInput.value).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
    } else {
      dateText = new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
    }
  }

  const li = document.createElement("li");
  li.innerHTML = `
    <div>
      <span>${taskText}</span>
      <small class="date">Due: ${dateText}</small>
    </div>
    <div>
      <button class="check">✔</button>
      <button class="delete">✖</button>
    </div>
  `;

  if(completed) li.classList.add("completed");
  checkIfOverdue(li, dateText);

  li.querySelector(".check").addEventListener("click", () => {
    li.classList.toggle("completed");
    saveTasks();
    applyFilter(document.querySelector(".filter-btn.active").dataset.filter);
  });

  li.querySelector(".delete").addEventListener("click", () => {
    li.style.animation = "fadeOut 0.5s ease forwards";
    setTimeout(()=>{ li.remove(); saveTasks(); applyFilter(document.querySelector(".filter-btn.active").dataset.filter); },500);
  });

  taskList.appendChild(li);
  saveTasks();
}

// Add task
function addTask() {
  const taskText = taskInput.value.trim();
  if(taskText==="") return;
  createTask(taskText);
  taskInput.value="";
  dateInput.value="";
  applyFilter(document.querySelector(".filter-btn.active").dataset.filter);
}

// Check overdue
function checkIfOverdue(li,dateText){
  const today = new Date();
  const dueDate = new Date(dateText);
  today.setHours(0,0,0,0); dueDate.setHours(0,0,0,0);
  if(dueDate < today && !li.classList.contains("completed")){
    li.classList.add("overdue");
  } else li.classList.remove("overdue");
}

function checkOverdueTasks(){
  document.querySelectorAll("#taskList li").forEach(li=>{
    const dateText = li.querySelector(".date").innerText.replace("Due: ","");
    checkIfOverdue(li,dateText);
  });
}
setInterval(checkOverdueTasks,60000);

// Filtering
function applyFilter(filter){
  const tasks = document.querySelectorAll("#taskList li");
  const searchText = searchInput.value.toLowerCase();
  tasks.forEach(li=>{
    const text = li.querySelector("span").innerText.toLowerCase();
    let visible = true;
    switch(filter){
      case "pending": visible = !li.classList.contains("completed") && !li.classList.contains("overdue"); break;
      case "completed": visible = li.classList.contains("completed"); break;
      case "overdue": visible = li.classList.contains("overdue"); break;
      default: visible = true;
    }
    if(!text.includes(searchText)) visible=false;
    li.style.display = visible ? "flex":"none";
  });
}

// Filter buttons
filterButtons.forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelector(".filter-btn.active").classList.remove("active");
    btn.classList.add("active");
    applyFilter(btn.dataset.filter);
  });
});

// Search input
searchInput.addEventListener("input",()=>{
  applyFilter(document.querySelector(".filter-btn.active").dataset.filter);
});

// Events
addBtn.addEventListener("click",addTask);
taskInput.addEventListener("keypress",(e)=>{if(e.key==="Enter") addTask();});
