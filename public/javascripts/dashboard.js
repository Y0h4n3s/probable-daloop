

jQuery(() => {
  $("table").stackcolumns()

const addTaskBtn = $("#add-task-btn")
const taskBtns = Array.from($(".task-btn"))
taskBtns.forEach(btn => {
  btn.addEventListener("click", async (e) => {
  showLoadingAnimation(true)
    let taskDate = e.target.dataset.date.slice(0,10)
    let taskStartTime = e.target.parentElement.parentElement.firstChild.innerText.split(" - ")[0]
    let taskEndTime = e.target.parentElement.parentElement.firstChild.innerText.split(" - ")[1]
    let taskid =  btoa(taskDate + taskStartTime + taskEndTime)
    let url = document.location.origin + "/api/user/task/" + taskid
    let task = await fetchData(url).catch(console.error)
    document.body.appendChild(renderTaskInfoJumbo(task, taskid));
    showLoadingAnimation(false)
  })
});
addTaskBtn.on('click', async (e) => {
  if (requireNonUndefinedElse(document.querySelector('.add-task-jumbo'), 1) != 1) {
    document.querySelector('.add-task-jumbo').style.display = "flex"
    return;
  }
  showLoadingAnimation(true)
  
  const addTaskJumbo = await renderAddTaskJumbo()
  showLoadingAnimation(false)
  document.body.appendChild(addTaskJumbo)

})

const showLoadingAnimation = (show) => {
  let loading =  document.querySelector("#loading")
  loading.style.display = show ? "block" : "none";
}

$.fn.deleteTask = async (e) => {
  let url = document.location.origin + "/api/user/task/" + e.dataset.taskid
  let response = await fetch(url, {
    mode: "cors",
    method: "DELETE",

  }).then(response => response.json())
  .catch(console.error)
  if (! response.msg) {
    document.location.reload()
  }
}
$.fn.submitNewTask = async (e) => {
  showLoadingAnimation(true)
  
  const taskName = $(".add-task-details>.input-group>.add-task-name").val()
  const priority = requireNonUndefinedElse($(".add-task-details>.input-group>.add-task-priority").val(), 2)
  const difficulty = requireNonUndefinedElse($(".add-task-details>.input-group>.add-task-difficulty").val(), 2)
  const courseCode = $(".add-task-details>.input-group>.add-task-name").val()
  const dueDate =$(".add-task-details>.input-group>.due-date-input").val()
  const description =$(".add-task-details>.input-group>.task-description-input").val()
  const url = document.location.origin + "/api/user/addtask"
  const postData = {
    taskName: taskName,
    priority: priority,
    difficulty: difficulty,
    courseCode: courseCode,
    dueDate: dueDate,
    description: description
  }
  let resp = await fetchPostData(url, postData)
  console.log(resp)
  showLoadingAnimation(false)
  document.location.reload()
}

$.fn.destroyShowTaskJumbo = (e) => {
  $("#show-task-info-jumbo").remove()
}


const renderTaskInfoJumbo = (task, taskid) => {



  let tempDocument = new DOMParser().parseFromString(
    `
    <div id="show-task-info-jumbo" class="show-task-jumbo"> 
      <div class="show-task-details">
      <div class="add-task-details">
      <div class="input-group">
        <label class="add-task-form-label" for="add-task-name-input">Task Name</label>
        <p> ${task.task.taskName} </p>
        </div>
        <div class="input-group">
        <label class="add-task-form-label" for="add-task-priority-input">Priority</label>
        <p> ${task.task.priority} </p>
        </div>
        <div class="input-group">
        <label class="add-task-form-label" for="add-task-difficulty-input">Difficulty</label>
        <p> ${task.task.difficulty} </p>
        </div>
        <div class="input-group">
        <label class="add-task-form-label" for="course-selector">Course</label>
        <p> ${task.task.courseCode} </p>
        </div>
        <div class="input-group">
        <label class="add-task-form-label" for="due-date-input">Due Date</label>
        <p> ${task.task.dueDate} </p>
        </div>
        <div class="input-group">
        <label class="add-task-form-label" for="task-description-input">Description</label>
        <p> ${task.task.description} </p>
        </div>
        <button data-taskid="${taskid}" class="delete-task-btn" onclick="$.fn.deleteTask(this)"> Delete</button>
        <button class="close-jumbo-btn" onclick="$.fn.destroyShowTaskJumbo(this)">Close</button>
      </div>
    </div>
    `,
    "text/html"
  )

  return tempDocument.querySelector('.show-task-jumbo')
}


const renderAddTaskJumbo = async () => {
  const timetable = document.querySelector("#timetable")
  const today = new Date()
  // array of course objects 
  let myCourses = await fetchData(document.location.origin + "/api/user/courses")
  myCourses = ["", ...myCourses]
  let courseSelector = myCourses.reduce((acc, val) => acc + `<option class="course-selector-option" value=${val.courseCode}>${val.courseCode}</option>`)
  courseSelector = `<select name="course-selector" class="course-selector">${courseSelector}</select>`
  let tempDocument = new DOMParser().parseFromString(
    `
    <div class="add-task-jumbo"> 
      <div class="add-task-details">
      <div class="input-group">
        <label class="add-task-form-label" for="add-task-name-input">Task Name</label>
        <input name="add-task-name-input" type="text" class="add-task-name" placeholder="Task Name"/>
        </div>
        <div class="input-group">
        <label class="add-task-form-label" for="add-task-priority-input">Priority</label>
        <input name="add-task-priority-input" type="number" class="add-task-priority" placeholder="Task Priority" min="0" max="4"/>
        </div>
        <div class="input-group">
        <label class="add-task-form-label" for="add-task-difficulty-input">Difficulty</label>
        <input name="add-task-input-difficulty" type="number" class="add-task-difficulty" placeholder="Task Difficulty" min="0" max="4"/>
        </div>
        <div class="input-group">
        <label class="add-task-form-label" for="course-selector">Course</label>
        ${courseSelector}
        </div>
        <div class="input-group">
        <label class="add-task-form-label" for="due-date-input">Due Date</label>
        <input name="due-date-input" type="date" class="due-date-input">
        </div>
        <div class="input-group">
        <label class="add-task-form-label" for="task-description-input">Description</label>
        <textarea name="task-description-input" type="textfield" class="task-description-input" resizable=false></textarea>
        </div>
        <button class="submit-new-task-btn" onclick="$.fn.submitNewTask(this)"> Submit</button>
        <button class="close-jumbo-btn" onclick="document.querySelector('.add-task-jumbo').style.display = 'none'"> close</button>
      </div>
    </div>
    `,
    "text/html"
  )

  return tempDocument.querySelector('.add-task-jumbo')
}


const requireNonUndefinedElse = (val, elseVal) => {
  return void 0 === val ? elseVal : null === val ? elseVal : "" === val ? elseVal : val
} 


const fetchPostData = async (url, body) => {
  
    body = JSON.stringify(body)
  return await new Promise(resolve => {
    fetch(url,
    {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: body
    })
    .then(response => response.json())
    .then(response => resolve(response))
    .catch(console.error)
  })
}


const fetchData = async (url) => {
  return await new Promise(resolve => {
    fetch(url,
    {
      mode: "cors",
      method: "GET",
    })
    .then(response => response.json())
    .then(response => resolve(response))
    .catch(console.error)
  })
}
})
