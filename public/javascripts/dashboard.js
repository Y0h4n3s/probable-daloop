
const addTaskBtn = document.querySelector("#add-task-btn")
const taskBtns = Array.from(document.querySelector(".task-btn"))
taskBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    
  })
});
addTaskBtn.addEventListener('click', async (e) => {
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

const submitNewTask = async (e) => {
  showLoadingAnimation(true)
  const taskName = document.querySelector(".add-task-details>.add-task-name").value
  const priority = requireNonUndefinedElse(document.querySelector(".add-task-details>.add-task-priority").value, 2)
  const difficulty = requireNonUndefinedElse(document.querySelector(".add-task-details>.add-task-difficulty").value, 2)
  const courseCode = document.querySelector(".add-task-details>.add-task-name").value
  const dueDate = document.querySelector(".add-task-details>.due-date-input").value
  const url = document.location.origin + "/api/user/addtask"
  const postData = {
    taskName: taskName,
    priority: priority,
    difficulty: difficulty,
    courseCode: courseCode,
    dueDate: dueDate
  }
  let resp = await fetchPostData(url, postData)
  console.log(resp)
  showLoadingAnimation(false)
}

const renderAddTaskJumbo = async () => {
  const timetable = document.querySelector("#timetable")
  const today = new Date()
  // array of course objects 
  let myCourses = await fetchData(document.location.origin + "/api/user/courses")
  myCourses = ["", ...myCourses]
  let courseSelector = myCourses.reduce((acc, val) => acc + `<option class="course-selector-option" value=${val.courseCode}>${val.courseCode}</option>`)
  courseSelector = `<select class="course-selector">${courseSelector}</select>`
  let tempDocument = new DOMParser().parseFromString(
    `
    <div class="add-task-jumbo"> 
      <div class="add-task-details">
        <input type="text" class="add-task-name" placeholder="Task Name"/>
        <input type="number" class="add-task-priority" placeholder="Task Priority" min=0 max=4 default=2/>
        <input type="number" class="add-task-difficulty" placeholder="Task Difficulty" min=0 max=4 default=2/>
        ${courseSelector}
        <input type="date" class="due-date-input" >
        <button class="submit-new-task-btn" onclick="submitNewTask(this)"> Submit</button>
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