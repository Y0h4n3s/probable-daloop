jQuery(() => {
  const addCourseButton = $("#add-course-button");
  const addCourseInputs = $(".course-info-inputs");
  const addCourseForm = $(".add-courses-form")[0];
  const nextStepButton = $(".course-selection-next");
  const Timetable = $(".timetable-table")[0];
  const startDate = $("#start-date");
  const endDate = $("#end-date");
  addCourseButton.on("click", (e) => {
    var newElements = new DOMParser().parseFromString(
      `<div class="course-info-input"><input type="text" placeholder="Course Name"/><input type="number" placeholder="Course Cp"/><input type="text" placeholder="Course Code"/></div>`,
      "text/html"
    );
    addCourseInputs.append(newElements.querySelector(".course-info-input"));
  });
  var data = { stepNo: 2, courses: [] };
  nextStepButton.on("click", async (e) => {
    var step = addCourseForm.dataset.stepno;
    if (step == 1) {
      if (!startDate.val() || !endDate.val()) {
        startDate.css("border-color", "red");
        endDate.css("border-color", "red");
        return;
      }
      var elements = $(".course-info-input");
      for (var element of elements) {
        data.courses.push({
          courseName: element.childNodes[0].value,
          courseCp: element.childNodes[1].value,
          courseCode: element.childNodes[2].value,
        });
      }
      Timetable.append(renderTable(data.courses, new Date(startDate.val())));
      addCourseButton.css("display", "none");
      addCourseInputs.css("display", "none");
      nextStepButton.textContent = "Submit";
      endDate.css("display", "none");
      startDate.css("display", "none");
      addCourseForm.dataset.stepno = 2;
      $("table").stackcolumns();
    } else if (step == 2) {
      let timetable = [[]];
      let table = $("tbody")[1];
      let startingDate = new Date(startDate.val());
      let finalDate = new Date(endDate.val());
      let dateSpan = dateDiffInDays(startingDate, finalDate);
      let width =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;

      let schedules = Array.from($(".course-selector"))
        .splice(width < 1100 ? 0 : 119, 119)
        .sort((a, b) => a.dataset.label > b.dataset.label);
      if (width > 1100) {
        let tempSchecules = [];

        for (let i = 0; i < 7; i++) {
          for (let j = 0; j < 17; j++) {
            tempSchecules.push(schedules[j * 7 + i]);
          }
        }
        schedules = tempSchecules;
      }
      for (let i = 0; i < dateSpan; i += 7) {
        for (let k = 0; k < 17; k++) {
          let tempDate = new Date(startingDate.toDateString());

          for (let j = 0; j < 7; j++) {
            let indx = (startingDate.getDay() + j) % 7;
            let col = schedules[indx * 17 + k];
            if (!timetable[i + indx]) timetable[i + indx] = [];
            timetable[i + indx].push({
              date: tempDate.toJSON(),
              startTime: col.dataset.timestart,
              endTime: col.dataset.timeend,
              task: {
                taskName: col.value,
                priority: col.value == "Free" ? 0 : 4,
                difficulty: col.value == "Free" ? 0 : 2,
                constant: !col.value == "Free",
                open: col.value == "Free",
                courseCode: col.selectedOptions[0].dataset.coursecode,
                dueDate: "None",
                description: "None"
              },
            });
            tempDate = new Date(tempDate.getTime() + 24 * 60 * 60 * 1000);
          }
        }
        startingDate = new Date(
          startingDate.getTime() + 7 * 24 * 60 * 60 * 1000
        );
      }

      // Remove Extra added Days
      let tempT = Array.from(timetable);
      let offset = 0;
      tempT.forEach((date, index) => {
        if (new Date(date[0].date).getTime() > finalDate.getTime()) {
          timetable.splice(index - offset, 1);
          offset += 1;
        }
      });

      //sort the timetable by date

      timetable.sort((first, second) =>
        new Date(first[0].date) > new Date(second[0].date)
          ? 1
          : new Date(first[0].date) < new Date(second[0].date)
          ? -1
          : 0
      );

      // send the setup data to be stored
      let url = document.location.origin + "/user/setup";
      await fetch(url, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courses: data.courses,
          timeTable: timetable,
          dateSpan: dateSpan,
          startDate: new Date(startDate.value),
          endDate: new Date(endDate.value),
        }),
      })
        .then((response) => response.text())
        .then((response) => {
          document.location.reload();
        })
        .catch(console.error);
    }
  });

  const dateDiffInDays = (a, b) => {
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
  };
  const timeRanges = [
    { startTime: "08:00", endTime: "08:50" },
    { startTime: "08:55", endTime: "09:45" },
    { startTime: "09:50", endTime: "10:40" },
    { startTime: "10:40", endTime: "11:30" },
    { startTime: "11:35", endTime: "12:25" },
    { startTime: "12:30", endTime: "01:30" },
    { startTime: "01:30", endTime: "02:20" },
    { startTime: "02:25", endTime: "03:15" },
    { startTime: "03:20", endTime: "04:10" },
    { startTime: "04:15", endTime: "05:05" },
    { startTime: "05:10", endTime: "06:00" },
    { startTime: "06:05", endTime: "06:55" },
    { startTime: "07:00", endTime: "07:50" },
    { startTime: "07:55", endTime: "08:45" },
    { startTime: "08:50", endTime: "09:40" },
    { startTime: "09:40", endTime: "10:35" },
    { startTime: "10:40", endTime: "11:30" },
  ];

  const renderTable = (data) => {
    let days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    var times = "<tbody>";
    for (t of timeRanges) {
      times += `<tr ><td><p>${t.startTime + " - " + t.endTime}</p></td>`;
      for (let i = 0; i < 7; i++) {
        times += `
      <td data-label=${days[i]}><select data-label=${i} class="course-selector" name="course-selector" data-timestart=${t.startTime} data-timeend=${t.endTime}>
        <option value="Free">Free</option>`;
        for (d of data) {
          times += `<option value="${d.courseName}" data-coursecode="${d.courseCode}">${d.courseName}</option>`;
        }
        times += "</select></td>";
      }
      times += "</tr>";
    }
    times += "</tbody>";
    var table = new DOMParser().parseFromString(
      `<table>
      <thead>
        <tr>
          <th> Time </th>
          <th> Sunday </th>
          <th> Monday </th>
          <th> Tuesday </th>
          <th> Wednesday </th>
          <th> Thursday </th>
          <th> Friday </th>
          <th> Saturday </th>
          
        </tr>
      </thead>
      ${times}`.trim(),
      "text/html"
    );

    return table.querySelector("table");
  };
});
