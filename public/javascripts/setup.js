

const addCourseButton = document.querySelector('#add-course-button')
const addCourseInputs = document.querySelector(".course-info-inputs")
const addCourseForm = document.querySelector(".add-courses-form")
const nextStepButton = document.querySelector(".course-selection-next")
const Timetable = document.querySelector('.timetable-table')
const startDate = document.querySelector('#start-date')
const endDate = document.querySelector('#end-date')
addCourseButton.addEventListener('click', (e) => {
  var newElements = new DOMParser().parseFromString(`<div class="course-info-input"><input type="text" placeholder="Course Name"/><input type="number" placeholder="Course Cp"/><input type="text" placeholder="Course Code"/></div>`, "text/html")
  addCourseInputs.appendChild(newElements.querySelector(".course-info-input"));
})
var data = { stepNo: 2, courses: [] }
nextStepButton.addEventListener('click', async (e) => {

  var step = addCourseForm.dataset.stepno
  if (step == 1) {
    var elements = document.querySelectorAll('.course-info-input')
    for (var element of elements) {

      data.courses.push({
        "courseName": element.childNodes[0].value,
        "courseCp": element.childNodes[1].value,
        "courseCode": element.childNodes[2].value

      })

    }
    Timetable.appendChild(renderTable(data.courses))
    addCourseButton.style.display = "none"
    addCourseInputs.style.display = "none"
    nextStepButton.textContent = "Submit"
    endDate.style.display = "none"
    startDate.style.display = "none"
    addCourseForm.dataset.stepno = 2
  }


  else if (step == 2) {
    let timetable = [[]]
    let table = document.querySelector('tbody')
    let startingDate = new Date(startDate.value);
    let finalDate = new Date(endDate.value)
    let dateSpan = dateDiffInDays(startingDate, finalDate)

    for (let i = 0; i < dateSpan; i+=7) {
      for (row of table.rows) {
        let tempDate = new Date(startingDate.toDateString())
        let schedules = Array.from(row.cells).filter((col, index) => index > 0)
        for (let j = 0; j < schedules.length; j++) {
          let indx = ((startingDate.getDay() + j) % 7)
          let col = schedules[indx]
          if (!timetable[i+indx]) timetable[i+indx] = []
          timetable[i+indx].push({
            "date": tempDate.toJSON(),
            "startTime": col.childNodes[0].dataset.timestart,
            "endTime": col.childNodes[0].dataset.timeend,
            "task": {
              "taskName": col.childNodes[0].value,
              "priority": col.childNodes[0].value == "free" ? 0 : 4,
              "difficulty": col.childNodes[0].value == "free" ? 0 : 2,
              "constant": !col.childNodes[0].value == "free",
              "open": col.childNodes[0].value == "free",
              "courseCode": table.rows[1].cells[1].childNodes[0].selectedOptions[0].dataset.coursecode
            }
          })
          tempDate = new Date(tempDate.getTime() + (24*60*60*1000))
        }
      }
      startingDate = new Date(startingDate.getTime() + (7*24*60*60*1000))

    }

    // Remove Extra added Days
    let tempT = Array.from(timetable)
    let offset = 0
     tempT.forEach((date, index) => {
      if (new Date(date[0].date).getTime() > finalDate.getTime()) {
        timetable.splice(index - offset, 1)
        offset += 1
      }
    })

    //sort the timetable by date

    timetable.sort((first, second) => new Date(first[0].date) > new Date(second[0].date) ? 1 : new Date(first[0].date) < new Date(second[0].date) ? -1 : 0)
    
    // send the setup data to be stored
    let url = document.location.origin + "/user/setup"
    await fetch(url, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ "courses": data.courses, "timeTable": timetable, "dateSpan": dateSpan, "startDate": new Date(startDate.value), "endDate": new Date(endDate.value) })
    }).then(response => response.text())
      .then(response => {
       document.location.reload()
      })
      .catch(console.error)
  }

})

const dateDiffInDays = (a, b) => {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}
const timeRanges = [{ "startTime": "08:00", "endTime": "08:50" }, { "startTime": "08:55", "endTime": "09:45" }, { "startTime": "09:50", "endTime": "10:40" }, { "startTime": "10:40", "endTime": "11:30" }, { "startTime": "11:35", "endTime": "12:25" }, { "startTime": "12:30", "endTime": "01:30" }, { "startTime": "01:30", "endTime": "02:20" }, { "startTime": "02:25", "endTime": "03:15" }, { "startTime": "03:20", "endTime": "04:10" }, { "startTime": "04:15", "endTime": "05:05" }, { "startTime": "05:10", "endTime": "06:00" }, { "startTime": "06:05", "endTime": "06:55" },]

const renderTable = (data) => {

  var times = "<tbody>"
  for (t of timeRanges) {
    times += `<tr ><td><p>${t.startTime + " - " + t.endTime}</p></td>`
    for (let i = 0; i < 7; i++) {
      times += `
      <td><select name="course-selector" data-timestart=${t.startTime} data-timeend=${t.endTime}>
        <option value="free">Free</option>`
      for (d of data) {
        times += `<option value="${d.courseName}" data-coursecode="${d.courseCode}">${d.courseName}</option>`
      }
      times += "</select></td>"
    }
    times += "</tr>"
  }
  times += "</tbody>"
  var table = new DOMParser().parseFromString(
    `<table>
      <thead>
        <tr>
          <th> Time </th>
          <th> Monday </th>
          <th> Tuesday </th>
          <th> Wednesday </th>
          <th> Thursday </th>
          <th> Friday </th>
          <th> Saturday </th>
          <th> Sunday </th>
        </tr>
      </thead>
      ${times}`.trim(),
    "text/html"
  )

  return table.querySelector("table")
}